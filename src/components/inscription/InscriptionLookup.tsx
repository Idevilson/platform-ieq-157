'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { InscriptionStatus } from './InscriptionStatus'
import { apiClient } from '@/lib/services/api'
import { PaymentStatus, PAYMENT_STATUS_LABELS } from '@/shared/constants'

interface PaymentInfo {
  id: string
  status: string
  statusLabel: string
  metodoPagamento: string
  pixCopiaECola?: string
  boletoUrl?: string
  valor: string
  dataVencimento: string
}

interface InscriptionResult {
  inscription: {
    id: string
    eventId: string
    categoryId: string
    status: string
    paymentStatus?: PaymentStatus
    paymentId?: string
    criadoEm: string
    guestData?: {
      nome: string
      email: string
    }
  }
  eventTitle?: string
  categoryName?: string
  payment?: PaymentInfo
}

interface LookupResponse {
  inscriptions: InscriptionResult[]
}

interface InscriptionLookupProps {
  eventId?: string
  onInscriptionFound?: (inscription: InscriptionResult) => void
  compact?: boolean
}

async function lookupInscriptions(cpf: string, eventId?: string): Promise<InscriptionResult[]> {
  const params = new URLSearchParams({ cpf })
  if (eventId) {
    params.append('eventId', eventId)
  }

  const response = await apiClient.get<LookupResponse>(`/inscriptions/lookup?${params}`)
  if (response.success && response.data) {
    return response.data.inscriptions
  }
  throw new Error(response.error || 'Erro ao consultar inscrição')
}

function getPaymentStatusClass(status?: PaymentStatus): string {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    RECEIVED: 'bg-green-500/20 text-green-400 border-green-500/30',
    CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
    OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
    REFUNDED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return status ? classes[status] || classes.PENDING : classes.PENDING
}

function isPendingPayment(status?: PaymentStatus): boolean {
  return status === 'PENDING' || status === 'OVERDUE'
}

export function InscriptionLookup({
  eventId,
  onInscriptionFound,
  compact = false,
}: InscriptionLookupProps) {
  const router = useRouter()
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<InscriptionResult[] | null>(null)
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)

  const handleViewDetails = (result: InscriptionResult) => {
    const params = new URLSearchParams({
      inscriptionId: result.inscription.id,
      eventId: result.inscription.eventId,
    })
    router.push(`/eventos/${result.inscription.eventId}/confirmado?${params}`)
  }

  const lookupMutation = useMutation({
    mutationFn: (cleanCpf: string) => lookupInscriptions(cleanCpf, eventId),
    onSuccess: (inscriptions) => {
      setResults(inscriptions)
      if (inscriptions.length === 1 && onInscriptionFound) {
        onInscriptionFound(inscriptions[0])
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Erro ao consultar inscrição')
    },
  })

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
    setError(null)
    setResults(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      setError('CPF deve ter 11 dígitos')
      return
    }

    setError(null)
    lookupMutation.mutate(cleanCpf)
  }

  const handleTogglePayment = (inscriptionId: string) => {
    setExpandedPayment(expandedPayment === inscriptionId ? null : inscriptionId)
    setCopiedPix(false)
  }

  const handleCopyPix = async (pixCode: string) => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = pixCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    }
  }

  const isLoading = lookupMutation.isPending

  return (
    <div className={`bg-bg-secondary rounded-2xl border border-gold/10 ${compact ? 'p-4' : 'p-6'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h4 className={`font-semibold text-gold ${compact ? 'text-base mb-2' : 'text-lg mb-1'}`}>
            Consultar Inscrição
          </h4>
          <p className="text-sm text-text-secondary">
            Digite seu CPF para consultar suas inscrições{eventId ? ' neste evento' : ' em todos os eventos'}.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            id="lookup-cpf"
            type="text"
            value={cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
            disabled={isLoading}
            className="flex-1 bg-bg-primary border border-gold/20 rounded-lg px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50"
          />
          <button
            type="submit"
            disabled={isLoading || cpf.replace(/\D/g, '').length !== 11}
            className="px-6 py-2 bg-gold text-bg-primary font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
            {error}
          </div>
        )}
      </form>

      {results !== null && (
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p>Nenhuma inscrição encontrada para este CPF{eventId ? ' neste evento' : ''}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-text-primary">
                {results.length} inscrição(ões) encontrada(s)
              </h4>

              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.inscription.id}
                    className="bg-bg-primary rounded-xl p-4 border border-gold/10"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h5 className="font-medium text-text-primary">
                          {result.eventTitle || 'Evento'}
                        </h5>
                        <p className="text-sm text-text-secondary">
                          {result.categoryName || 'Categoria não especificada'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <InscriptionStatus
                          status={result.inscription.status as 'pendente' | 'confirmado' | 'cancelado'}
                        />
                        {result.inscription.paymentStatus && (
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPaymentStatusClass(result.inscription.paymentStatus)}`}>
                            {PAYMENT_STATUS_LABELS[result.inscription.paymentStatus]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-text-secondary space-y-1">
                      {result.inscription.guestData && (
                        <p><span className="text-text-muted">Nome:</span> {result.inscription.guestData.nome}</p>
                      )}
                      <p>
                        <span className="text-text-muted">Data da inscrição:</span>{' '}
                        {new Date(result.inscription.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    {result.payment && isPendingPayment(result.payment.status as PaymentStatus) && (
                      <div className="mt-4 pt-4 border-t border-gold/10">
                        <button
                          onClick={() => handleTogglePayment(result.inscription.id)}
                          className="w-full sm:w-auto px-4 py-2 bg-gold/20 text-gold font-medium rounded-lg hover:bg-gold/30 transition-colors text-sm flex items-center gap-2"
                        >
                          <svg className={`w-4 h-4 transition-transform ${expandedPayment === result.inscription.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {expandedPayment === result.inscription.id ? 'Ocultar Pagamento' : 'Ver 2ª Via do Pagamento'}
                        </button>

                        {expandedPayment === result.inscription.id && result.payment && (
                          <div className="mt-4 p-4 bg-bg-secondary rounded-lg border border-gold/20 space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-text-secondary">Valor:</span>
                              <span className="text-gold font-semibold text-lg">{result.payment.valor}</span>
                            </div>

                            {result.payment.pixCopiaECola && (
                              <div className="space-y-2">
                                <p className="text-sm text-text-secondary">PIX Copia e Cola:</p>
                                <div className="bg-bg-primary p-3 rounded-lg border border-gold/10">
                                  <code className="text-xs text-text-primary break-all block mb-2">
                                    {result.payment.pixCopiaECola.substring(0, 100)}...
                                  </code>
                                  <button
                                    onClick={() => handleCopyPix(result.payment!.pixCopiaECola!)}
                                    className="w-full py-2 bg-gold text-bg-primary font-medium rounded-lg hover:bg-gold-light transition-colors text-sm"
                                  >
                                    {copiedPix ? 'Copiado!' : 'Copiar Código PIX'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {result.payment.boletoUrl && (
                              <div className="space-y-2">
                                <a
                                  href={result.payment.boletoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full py-2 bg-gold/20 text-gold font-medium rounded-lg hover:bg-gold/30 transition-colors text-sm text-center"
                                >
                                  Abrir Boleto
                                </a>
                              </div>
                            )}

                            <p className="text-xs text-text-muted text-center">
                              Vencimento: {new Date(result.payment.dataVencimento).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {result.payment && (result.payment.status === 'RECEIVED' || result.payment.status === 'CONFIRMED') && (
                      <div className="mt-4 pt-4 border-t border-gold/10 flex items-center gap-2 text-green-400 text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pagamento confirmado
                      </div>
                    )}

                    {!result.payment && result.inscription.status === 'pendente' && (
                      <div className="mt-4 pt-4 border-t border-gold/10 text-yellow-400 text-sm">
                        Aguardando geração do pagamento
                      </div>
                    )}

                    <button
                      onClick={() => handleViewDetails(result)}
                      className="mt-4 w-full py-2 bg-gold/20 text-gold font-medium rounded-lg hover:bg-gold/30 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalhes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
