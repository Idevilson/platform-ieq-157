"use client"

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useBatchSSE, BatchBreakdown } from '@/hooks/useBatchSSE'
import { useCreateBatchPayment } from '@/hooks/mutations/useBatchInscriptionMutations'

export interface BatchConfirmationPageProps {
  eventId: string
  eventName: string
  eventNameLong?: string
  eventDates: string
  eventLocation: string
  eventDetailPath: string
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function BreakdownSummary({ breakdown }: { breakdown: BatchBreakdown | null }) {
  if (!breakdown) return null
  return (
    <div className="mb-4 p-3 rounded-lg bg-bg-secondary border border-gold/10 text-sm">
      <div className="flex justify-between text-text-secondary">
        <span>Valor das inscrições</span>
        <span>{breakdown.valorBaseFormatado}</span>
      </div>
      <div className="flex justify-between text-text-secondary">
        <span>Taxa de processamento</span>
        <span>{breakdown.valorTaxaFormatado}</span>
      </div>
      <div className="flex justify-between text-text-primary font-semibold pt-2 border-t border-white/10 mt-2">
        <span>Total</span>
        <span>{breakdown.valorTotalFormatado}</span>
      </div>
    </div>
  )
}

function BatchConfirmationContent({
  eventName,
  eventNameLong,
  eventDates,
  eventLocation,
  eventDetailPath,
}: BatchConfirmationPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const batchId = searchParams.get('batchId')

  const { batch, isConfirmed, isPaid } = useBatchSSE(batchId)
  const createPayment = useCreateBatchPayment()

  const [copied, setCopied] = useState(false)
  const checkoutOpenedRef = useRef(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (
      batch?.checkoutUrl &&
      !isPaid &&
      batch.paymentStatus === 'PENDING' &&
      !checkoutOpenedRef.current
    ) {
      checkoutOpenedRef.current = true
      const timer = setTimeout(() => {
        window.open(batch.checkoutUrl!, '_blank', 'noopener')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [batch, isPaid])

  const handleCopyPix = async () => {
    if (batch?.pixCopiaECola) {
      await navigator.clipboard.writeText(batch.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const confirmed = isPaid || isConfirmed
  const isCash = batch?.preferredPaymentMethod === 'CASH'
  const isCard = batch?.preferredPaymentMethod === 'CREDIT_CARD'
  const valorFormatado = batch?.breakdown?.valorTotalFormatado ?? (batch ? formatCurrency(batch.valorTotal) : '-')

  const titleText = confirmed
    ? 'Inscrição Confirmada!'
    : 'Inscrição Coletiva Realizada!'

  const subtitleText = confirmed
    ? `Todas as inscrições para o ${eventName} foram confirmadas com sucesso!`
    : isCash
      ? `Sua inscrição coletiva para o ${eventName} foi realizada. Pague presencialmente na igreja.`
      : `Sua inscrição coletiva para o ${eventName} foi realizada. Finalize o pagamento abaixo.`

  return (
    <div className="px-4 py-12 min-h-[calc(100vh-200px)]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          {!batch ? (
            <LoadingHeader />
          ) : (
            <>
              <StatusIcon confirmed={confirmed} />
              <h1 className="text-3xl font-bold text-gold mb-4">{titleText}</h1>
              <p className="text-text-secondary max-w-md mx-auto">{subtitleText}</p>

              {batch && !confirmed && !isCash && (
                <p className="text-xs text-text-muted mt-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Verificando pagamento automaticamente...
                </p>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* Coluna esquerda — pagamento */}
          <div className="flex flex-col">
            {!batch && <LoadingCard />}

            {batch && confirmed && (
              <ConfirmedCard valorFormatado={valorFormatado} totalParticipantes={batch.totalParticipantes} />
            )}

            {batch && !confirmed && isCash && (
              <CashPendingCard valorFormatado={valorFormatado} />
            )}

            {batch && !confirmed && isCard && batch.checkoutUrl && (
              <CheckoutRedirectCard checkoutUrl={batch.checkoutUrl} valorFormatado={valorFormatado} breakdown={batch.breakdown} />
            )}

            {batch && !confirmed && isCard && !batch.checkoutUrl && (
              <GeneratePaymentCard
                valorFormatado={valorFormatado}
                isLoading={createPayment.isPending}
                error={createPayment.error?.message}
                onGenerate={() => createPayment.mutate(batchId!)}
              />
            )}

            {batch && !confirmed && !isCash && !isCard && batch.pixQrCode && (
              <PixPaymentCard
                valorFormatado={valorFormatado}
                pixQrCode={batch.pixQrCode}
                pixCopiaECola={batch.pixCopiaECola}
                dataVencimento={batch.dataVencimentoPagamento}
                breakdown={batch.breakdown}
                copied={copied}
                onCopyPix={handleCopyPix}
              />
            )}

            {batch && !confirmed && !isCash && !isCard && !batch.pixQrCode && (
              <ProcessingCard />
            )}
          </div>

          {/* Coluna direita — detalhes do lote + evento */}
          <div className="flex flex-col gap-6">
            {!batch ? (
              <LoadingCard />
            ) : (
              <>
                <BatchDetailsCard
                  totalParticipantes={batch.totalParticipantes}
                  cidade={batch.cidade}
                  valorFormatado={valorFormatado}
                  confirmed={confirmed}
                />
                <EventDetailsCard
                  eventNameLong={eventNameLong ?? eventName}
                  eventDates={eventDates}
                  eventLocation={eventLocation}
                  isPaid={confirmed}
                  isCashPayment={isCash}
                  onDetail={() => router.push(eventDetailPath)}
                  onHome={() => router.push('/')}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusIcon({ confirmed }: { confirmed: boolean }) {
  return (
    <div
      className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${confirmed ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}
    >
      {confirmed ? (
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
  )
}

function LoadingHeader() {
  return (
    <>
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gold/20">
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
      <h1 className="text-3xl font-bold text-gold mb-4">Carregando...</h1>
      <p className="text-text-secondary max-w-md mx-auto">Buscando informações do lote</p>
    </>
  )
}

function LoadingCard() {
  return (
    <div className="card text-left flex-1 flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mb-4" />
      <span className="text-text-secondary">Carregando...</span>
    </div>
  )
}

function GeneratePaymentCard({
  valorFormatado,
  isLoading,
  error,
  onGenerate,
}: {
  valorFormatado: string
  isLoading: boolean
  error?: string
  onGenerate: () => void
}) {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento com Cartão</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
          Aguardando Pagamento
        </span>
      </div>
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-gold mb-2">{valorFormatado}</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4 gap-4">
        <p className="text-text-secondary text-center text-sm">
          Clique abaixo para gerar o link de pagamento com cartão de crédito.
        </p>
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-3 bg-gold text-bg-primary font-bold rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
              Gerando link...
            </>
          ) : (
            'Gerar link de pagamento'
          )}
        </button>
      </div>
    </div>
  )
}

function ProcessingCard() {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">Processando</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">O pagamento está sendo gerado...</p>
        </div>
      </div>
    </div>
  )
}

function PixPaymentCard({
  valorFormatado,
  pixQrCode,
  pixCopiaECola,
  dataVencimento,
  breakdown,
  copied,
  onCopyPix,
}: {
  valorFormatado: string
  pixQrCode: string | null
  pixCopiaECola: string | null
  dataVencimento: string | null
  breakdown: BatchBreakdown | null
  copied: boolean
  onCopyPix: () => void
}) {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento via PIX</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
          Aguardando Pagamento
        </span>
      </div>

      <BreakdownSummary breakdown={breakdown} />

      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-gold mb-2">{valorFormatado}</p>
        {dataVencimento && (
          <p className="text-sm text-text-muted">
            Vencimento: {new Date(dataVencimento).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {pixQrCode && (
        <div className="bg-white p-4 rounded-xl mx-auto mb-6 w-fit">
          <Image
            src={`data:image/png;base64,${pixQrCode}`}
            alt="QR Code PIX"
            width={200}
            height={200}
            className="mx-auto"
            unoptimized
          />
        </div>
      )}

      {pixCopiaECola && (
        <div className="space-y-3 mt-auto">
          <p className="text-sm text-text-muted text-center">Ou copie o código PIX:</p>
          <div className="bg-bg-secondary rounded-lg p-3">
            <p className="text-xs text-text-secondary break-all font-mono mb-3">
              {pixCopiaECola.substring(0, 80)}...
            </p>
            <button
              onClick={onCopyPix}
              className="w-full py-2 bg-gold text-bg-primary font-bold rounded-lg hover:bg-gold-light transition-colors"
            >
              {copied ? 'Copiado!' : 'Copiar Código PIX'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckoutRedirectCard({
  checkoutUrl,
  valorFormatado,
  breakdown,
}: {
  checkoutUrl: string
  valorFormatado: string
  breakdown: BatchBreakdown | null
}) {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento com Cartão</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
          Aguardando Pagamento
        </span>
      </div>
      <BreakdownSummary breakdown={breakdown} />
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-gold mb-2">{valorFormatado}</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <p className="text-text-secondary text-center mb-4">
          A página de pagamento foi aberta em uma nova aba.
          Após pagar, esta página será atualizada automaticamente.
        </p>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-gold text-bg-primary font-bold rounded-lg hover:bg-gold-dark transition-colors flex items-center justify-center gap-2 no-underline"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Abrir página de pagamento
        </a>
        <p className="text-xs text-text-muted mt-4 flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Verificando pagamento automaticamente...
        </p>
      </div>
    </div>
  )
}

function ConfirmedCard({
  valorFormatado,
  totalParticipantes,
}: {
  valorFormatado: string
  totalParticipantes: number
}) {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento Confirmado</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">Pago</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-3xl font-bold text-gold mb-2">{valorFormatado}</p>
        <p className="text-sm text-text-muted">Pagamento recebido com sucesso</p>
        <p className="text-sm text-text-secondary mt-1">
          {totalParticipantes} inscrição{totalParticipantes !== 1 ? 'ões' : ''} confirmada{totalParticipantes !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

function CashPendingCard({ valorFormatado }: { valorFormatado: string }) {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento em Dinheiro</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">Aguardando</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
          </svg>
        </div>
        <p className="text-2xl font-bold text-gold mb-2">{valorFormatado}</p>
        <p className="text-sm text-text-muted text-center">Pague presencialmente na igreja</p>
      </div>
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
        <p className="font-medium text-yellow-400 mb-2">Instruções:</p>
        <ul className="space-y-1 text-text-secondary">
          <li>• Dirija-se à secretaria da igreja</li>
          <li>• Informe o nome do responsável pelo lote</li>
          <li>• Efetue o pagamento em dinheiro</li>
          <li>• Todas as inscrições serão confirmadas na hora</li>
        </ul>
      </div>
    </div>
  )
}

function BatchDetailsCard({
  totalParticipantes,
  cidade,
  valorFormatado,
  confirmed,
}: {
  totalParticipantes: number
  cidade: string
  valorFormatado: string
  confirmed: boolean
}) {
  return (
    <div className="card text-left">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Detalhes do Lote</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-gold/10">
          <span className="text-sm text-text-muted">Participantes:</span>
          <span className="text-sm text-text-primary font-semibold">{totalParticipantes}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gold/10">
          <span className="text-sm text-text-muted">Cidade de origem:</span>
          <span className="text-sm text-text-primary">{cidade}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gold/10">
          <span className="text-sm text-text-muted">Total:</span>
          <span className="text-sm text-gold font-bold">{valorFormatado}</span>
        </div>
        <div className="p-3 bg-gold/10 border border-gold/30 rounded-lg text-sm text-text-secondary">
          <p>
            {confirmed
              ? 'Todas as inscrições do lote foram confirmadas.'
              : 'Após o pagamento, todas as inscrições serão confirmadas automaticamente.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function EventDetailsCard({
  eventNameLong,
  eventDates,
  eventLocation,
  isPaid,
  isCashPayment,
  onDetail,
  onHome,
}: {
  eventNameLong: string
  eventDates: string
  eventLocation: string
  isPaid: boolean
  isCashPayment: boolean
  onDetail: () => void
  onHome: () => void
}) {
  const message = isPaid
    ? 'Guarde este comprovante. Você receberá mais informações por WhatsApp sobre o evento.'
    : isCashPayment
      ? 'Dirija-se à secretaria da igreja para efetuar o pagamento em dinheiro.'
      : 'Após o pagamento, todas as inscrições serão confirmadas automaticamente.'

  return (
    <div className="card text-left flex-1 flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Detalhes do Evento</h3>
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gold/10">
          <span className="text-sm text-text-muted">Evento:</span>
          <span className="text-sm text-text-primary text-right">{eventNameLong}</span>
        </div>
        {eventDates && (
          <div className="flex justify-between items-center pb-3 border-b border-gold/10">
            <span className="text-sm text-text-muted">Datas:</span>
            <span className="text-sm text-text-primary text-right">{eventDates}</span>
          </div>
        )}
        <div className="flex justify-between items-center pb-3 border-b border-gold/10">
          <span className="text-sm text-text-muted">Local:</span>
          <span className="text-sm text-text-primary text-right">{eventLocation}</span>
        </div>
        <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg text-sm text-text-secondary">
          <p>{message}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-6">
        <button className="btn-primary w-full py-3" onClick={onDetail}>
          Ver Detalhes do Evento
        </button>
        <button className="btn-secondary w-full py-3" onClick={onHome}>
          Voltar ao Início
        </button>
      </div>
    </div>
  )
}

export function BatchConfirmationPage(props: BatchConfirmationPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-200px)]">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <BatchConfirmationContent {...props} />
    </Suspense>
  )
}
