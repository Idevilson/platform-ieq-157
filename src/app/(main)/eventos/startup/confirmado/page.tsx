"use client"

import { Suspense, useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ShareableReceipt } from '@/components/payment'
import { InscriptionPaymentMethod } from '@/shared/constants'

interface PaymentData {
  id: string
  status: string
  statusLabel: string
  valorFormatado: string
  pixQrCode?: string
  pixCopiaECola?: string
  dataVencimento: string
}

interface InscriptionData {
  id: string
  status: string
  valorFormatado: string
  preferredPaymentMethod: InscriptionPaymentMethod
}

function StartupConfirmadoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Support both inscriptionId and inscricaoId for backwards compatibility
  const inscriptionId = searchParams.get('inscriptionId') || searchParams.get('inscricaoId')
  const eventId = searchParams.get('eventId') || 'startup'

  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [inscription, setInscription] = useState<InscriptionData | null>(null)
  const [participantName, setParticipantName] = useState<string>('Participante')
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<InscriptionPaymentMethod>('PIX')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const fetchedRef = useRef(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const isPaid = payment?.status === 'RECEIVED' || payment?.status === 'CONFIRMED'
  const isCashPayment = preferredPaymentMethod === 'CASH'
  const isInscriptionConfirmed = inscription?.status === 'confirmado'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Initial fetch or create payment
  useEffect(() => {
    if (!inscriptionId) {
      setLoading(false)
      return
    }

    // Prevent double fetch in React StrictMode
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchPayment() {
      try {
        const queryParams = eventId ? `?eventId=${eventId}` : ''
        const getResponse = await fetch(`/api/inscriptions/${inscriptionId}/payment${queryParams}`)
        const getData = await getResponse.json()

        if (getData.participantName) {
          setParticipantName(getData.participantName)
        }

        if (getData.preferredPaymentMethod) {
          setPreferredPaymentMethod(getData.preferredPaymentMethod)
        }

        if (getData.inscription) {
          setInscription(getData.inscription)
        }

        // For cash payments, don't try to create Asaas payment
        if (getData.preferredPaymentMethod === 'CASH') {
          setLoading(false)
          return
        }

        if (getData.payment) {
          setPayment(getData.payment)
          setLoading(false)
          return
        }

        const createResponse = await fetch(`/api/inscriptions/${inscriptionId}/payment${queryParams}`, {
          method: 'POST',
        })
        const createData = await createResponse.json()

        if (createData.payment) {
          setPayment(createData.payment)
        } else if (createData.error) {
          setError(createData.error)
        }
      } catch (err) {
        setError('Erro ao carregar pagamento')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPayment()
  }, [inscriptionId, eventId])

  // Poll for payment confirmation every 30 seconds (only if payment is pending and not cash)
  useEffect(() => {
    if (!inscriptionId || isPaid || isCashPayment) {
      return
    }

    // For PIX, only poll if payment exists
    if (!payment) {
      return
    }

    async function checkPaymentStatus() {
      try {
        const queryParams = eventId ? `?eventId=${eventId}` : ''
        const response = await fetch(`/api/inscriptions/${inscriptionId}/payment${queryParams}`)
        const data = await response.json()

        if (data.participantName) {
          setParticipantName(data.participantName)
        }

        if (data.payment) {
          const newStatus = data.payment.status
          if (newStatus === 'RECEIVED' || newStatus === 'CONFIRMED') {
            setPayment(data.payment)
            // Stop polling once confirmed
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
              pollingRef.current = null
            }
          }
        }
      } catch (err) {
        console.error('Error checking payment status:', err)
      }
    }

    // Start polling
    pollingRef.current = setInterval(checkPaymentStatus, 30000)

    // Cleanup on unmount or when payment is confirmed
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [inscriptionId, eventId, payment, isPaid, isCashPayment])

  const handleCopyPix = async () => {
    if (payment?.pixCopiaECola) {
      await navigator.clipboard.writeText(payment.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div className="px-4 py-12 min-h-[calc(100vh-200px)]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {loading ? (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gold/20">
                <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
              <h1 className="text-3xl font-bold text-gold mb-4">Carregando...</h1>
              <p className="text-text-secondary max-w-md mx-auto">
                Buscando informacoes da sua inscricao
              </p>
            </>
          ) : (
            <>
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${(isPaid || isInscriptionConfirmed) ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                {(isPaid || isInscriptionConfirmed) ? (
                  <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gold mb-4">
                {(isPaid || isInscriptionConfirmed) ? 'Inscricao Confirmada!' : 'Inscricao Realizada!'}
              </h1>

              <p className="text-text-secondary max-w-md mx-auto">
                {(isPaid || isInscriptionConfirmed)
                  ? 'Sua inscricao para o STARTUP foi confirmada com sucesso!'
                  : isCashPayment
                    ? 'Sua inscricao para o STARTUP foi realizada. Pague presencialmente na igreja.'
                    : 'Sua inscricao para o STARTUP foi realizada. Finalize o pagamento abaixo.'}
              </p>

              {payment && !isPaid && !isCashPayment && (
                <p className="text-xs text-text-muted mt-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Verificando pagamento automaticamente...
                </p>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="card max-w-md mx-auto mb-6 bg-red-500/10 border-red-500/30">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Main content - two columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* Left column - Payment */}
          <div className="flex flex-col">
            {loading && (
              <div className="card text-left flex-1 flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
                <span className="text-text-secondary">Carregando...</span>
              </div>
            )}

            {!loading && payment && !isPaid && (
              <div className="card text-left flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Pagamento via PIX</h3>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                    Aguardando Pagamento
                  </span>
                </div>

                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-gold mb-2">{payment.valorFormatado}</p>
                  <p className="text-sm text-text-muted">
                    Vencimento: {new Date(payment.dataVencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {payment.pixQrCode && (
                  <div className="bg-white p-4 rounded-xl mx-auto mb-6 w-fit">
                    <Image
                      src={`data:image/png;base64,${payment.pixQrCode}`}
                      alt="QR Code PIX"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                )}

                {payment.pixCopiaECola && (
                  <div className="space-y-3 mt-auto">
                    <p className="text-sm text-text-muted text-center">Ou copie o codigo PIX:</p>
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <p className="text-xs text-text-secondary break-all font-mono mb-3">
                        {payment.pixCopiaECola.substring(0, 80)}...
                      </p>
                      <button
                        onClick={handleCopyPix}
                        className="w-full py-2 bg-gold text-bg-primary font-bold rounded-lg hover:bg-gold-light transition-colors"
                      >
                        {copied ? 'Copiado!' : 'Copiar Codigo PIX'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && payment && isPaid && (
              <div className="card text-left flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">Pagamento Confirmado</h3>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                    Pago
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-gold mb-2">{payment.valorFormatado}</p>
                  <p className="text-sm text-text-muted">Pagamento recebido com sucesso</p>
                </div>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full btn-primary flex items-center justify-center gap-2 mt-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartilhar Inscricao
                </button>
              </div>
            )}

            {!loading && !error && isCashPayment && !isInscriptionConfirmed && (
              <div className="card text-left flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Pagamento em Dinheiro</h3>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
                    Aguardando
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gold mb-2">{inscription?.valorFormatado}</p>
                  <p className="text-sm text-text-muted text-center">Pague presencialmente na igreja</p>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-text-secondary">
                  <p className="font-medium text-yellow-400 mb-2">Instrucoes:</p>
                  <ul className="space-y-1 text-text-secondary">
                    <li>• Dirija-se a secretaria da igreja</li>
                    <li>• Informe seu nome e CPF</li>
                    <li>• Efetue o pagamento em dinheiro</li>
                    <li>• Sua inscricao sera confirmada na hora</li>
                  </ul>
                </div>
              </div>
            )}

            {!loading && !error && isCashPayment && isInscriptionConfirmed && (
              <div className="card text-left flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">Pagamento Confirmado</h3>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                    Pago
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-gold mb-2">{inscription?.valorFormatado}</p>
                  <p className="text-sm text-text-muted">Pagamento em dinheiro confirmado</p>
                </div>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full btn-primary flex items-center justify-center gap-2 mt-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartilhar Inscricao
                </button>
              </div>
            )}

            {!payment && !loading && !error && !isCashPayment && (
              <div className="card text-left flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">Pagamento</h3>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
                    Processando
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-text-secondary text-center">
                    O pagamento sera gerado em breve.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Event Details */}
          <div className="flex flex-col">
            {loading ? (
              <div className="card text-left flex-1 flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
                <span className="text-text-secondary">Carregando...</span>
              </div>
            ) : (
              <div className="card text-left flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-text-primary mb-6">Detalhes do Evento</h3>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gold/10">
                    <span className="text-sm text-text-muted">Evento:</span>
                    <span className="text-sm text-text-primary text-right">STARTUP - A Uncao dos Quatro Seres</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gold/10">
                    <span className="text-sm text-text-muted">Datas:</span>
                    <span className="text-sm text-text-primary text-right">30 e 31 de Janeiro | 01 de Fevereiro de 2026</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gold/10">
                    <span className="text-sm text-text-muted">Local:</span>
                    <span className="text-sm text-text-primary text-right">IEQ Campo 157 - Redencao/PA</span>
                  </div>

                  <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg text-sm text-text-secondary">
                    <p>
                      {(isPaid || isInscriptionConfirmed)
                        ? 'Guarde este comprovante. Voce tambem recebera mais informacoes por WhatsApp sobre o evento.'
                        : isCashPayment
                          ? 'Dirija-se a secretaria da igreja para efetuar o pagamento em dinheiro.'
                          : 'Apos o pagamento, sua inscricao sera confirmada automaticamente.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => router.push('/')}
                  >
                    Voltar ao Inicio
                  </button>
                  <button
                    className="btn-primary flex-1"
                    onClick={() => router.push('/eventos/startup')}
                  >
                    Ver Detalhes do Evento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-lg bg-bg-primary rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Compartilhe sua inscricao!</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ShareableReceipt
              inscriptionId={inscriptionId || ''}
              participantName={participantName}
              eventName="STARTUP"
              eventDates="30 e 31 de Janeiro | 01 de Fevereiro"
              eventLocation="IEQ Campo 157 - Redencao/PA"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function StartupConfirmado() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <StartupConfirmadoContent />
    </Suspense>
  )
}
