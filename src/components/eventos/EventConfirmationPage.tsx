"use client"

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ShareableReceipt } from '@/components/payment/ShareableReceipt'
import { usePaymentPolling } from '@/hooks/usePaymentPolling'
import { useInscriptionSSE } from '@/hooks/useInscriptionSSE'

export interface EventConfirmationPageProps {
  eventId: string
  eventName: string
  eventNameLong?: string
  eventDates: string
  eventLocation: string
  eventDetailPath: string
  eventLogoUrl?: string
}

type CheckoutStatus = 'success' | 'cancel' | 'expired' | null

function EventConfirmationContent({
  eventId,
  eventName,
  eventNameLong,
  eventDates,
  eventLocation,
  eventDetailPath,
  eventLogoUrl,
}: EventConfirmationPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inscriptionId =
    searchParams.get('inscriptionId') || searchParams.get('inscricaoId')
  const methodParam = (searchParams.get('metodo') as 'PIX' | 'CREDIT_CARD' | null) ?? 'PIX'
  const parcelasParam = searchParams.get('parcelas')
  const parcelas = parcelasParam ? Number(parcelasParam) : undefined
  const checkoutStatus = searchParams.get('checkout') as CheckoutStatus

  const isCheckoutReturn = checkoutStatus !== null
  const isCheckoutSuccess = checkoutStatus === 'success'
  const isCheckoutCancelled = checkoutStatus === 'cancel'
  const isCheckoutExpired = checkoutStatus === 'expired'

  const {
    payment,
    inscription,
    participantName,
    loading,
    error,
    isPaid,
    isCashPayment,
    isInscriptionConfirmed,
  } = usePaymentPolling({
    inscriptionId,
    eventId,
    method: methodParam,
    parcelas,
  })

  const sse = useInscriptionSSE(inscriptionId, eventId)

  const sseConfirmed = sse.isConfirmed
  const ssePaid = sse.isPaid
  const sseHasBrinde = sse.hasBrinde
  const ssePayment = sse.payment

  const confirmed = isPaid || isInscriptionConfirmed || sseConfirmed || ssePaid

  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const checkoutOpenedRef = useRef(false)

  useEffect(() => {
    if (
      payment?.checkoutUrl &&
      !isPaid &&
      !isCheckoutReturn &&
      payment.status === 'PENDING' &&
      !checkoutOpenedRef.current
    ) {
      checkoutOpenedRef.current = true
      const timer = setTimeout(() => {
        window.open(payment.checkoutUrl!, '_blank', 'noopener')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [payment, isPaid, isCheckoutReturn])

  const handleCopyPix = async () => {
    if (payment?.pixCopiaECola) {
      await navigator.clipboard.writeText(payment.pixCopiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleRetryCheckout = () => {
    if (payment?.checkoutUrl) {
      window.location.href = payment.checkoutUrl
    }
  }

  const hasBrinde = inscription?.temBrinde === true || sseHasBrinde
  const isCardPayment = payment?.breakdown?.metodo === 'CREDIT_CARD' || payment?.checkoutUrl || ssePayment?.checkoutUrl

  const titleText = confirmed
    ? 'Inscrição Confirmada!'
    : isCheckoutSuccess
      ? 'Pagamento Processando...'
      : isCheckoutCancelled
        ? 'Pagamento Cancelado'
        : isCheckoutExpired
          ? 'Pagamento Expirado'
          : 'Inscrição Realizada!'

  const subtitleText = confirmed
    ? `Sua inscrição para o ${eventName} foi confirmada com sucesso!`
    : isCheckoutSuccess
      ? 'Seu pagamento foi recebido e está sendo processado. A confirmação será automática em instantes.'
      : isCheckoutCancelled
        ? 'Você cancelou o pagamento. Não se preocupe — sua inscrição continua reservada. Você pode tentar novamente.'
        : isCheckoutExpired
          ? 'O tempo para pagamento expirou. Você pode gerar um novo pagamento.'
          : isCashPayment
            ? `Sua inscrição para o ${eventName} foi realizada. Pague presencialmente na igreja.`
            : `Sua inscrição para o ${eventName} foi realizada. Finalize o pagamento abaixo.`

  return (
    <div className="px-4 py-12 min-h-[calc(100vh-200px)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          {loading ? (
            <LoadingHeader />
          ) : (
            <>
              <StatusIcon
                confirmed={confirmed}
                cancelled={isCheckoutCancelled}
                expired={isCheckoutExpired}
                processing={isCheckoutSuccess && !confirmed}
              />
              <h1 className="text-3xl font-bold text-gold mb-4">{titleText}</h1>
              <p className="text-text-secondary max-w-md mx-auto">{subtitleText}</p>

              {isCheckoutSuccess && !confirmed && (
                <p className="text-xs text-text-muted mt-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Aguardando confirmação do Asaas...
                </p>
              )}

              {payment && !isPaid && !isCashPayment && !isCardPayment && !isCheckoutReturn && (
                <p className="text-xs text-text-muted mt-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Verificando pagamento automaticamente...
                </p>
              )}

              {hasBrinde && confirmed && (
                <div className="mt-6 inline-block px-6 py-3 rounded-full bg-gold/20 border border-gold/40">
                  <p className="text-gold font-semibold">🎁 Você ganhou a pulseira de brinde!</p>
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="card max-w-md mx-auto mb-6 bg-red-500/10 border-red-500/30">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
          <div className="flex flex-col">
            {loading && <LoadingCard />}

            {!loading && isCheckoutSuccess && !confirmed && (
              <CheckoutProcessingCard />
            )}

            {!loading && isCheckoutCancelled && !confirmed && (
              <CheckoutCancelledCard
                checkoutUrl={payment?.checkoutUrl}
                onRetry={handleRetryCheckout}
              />
            )}

            {!loading && isCheckoutExpired && !confirmed && (
              <CheckoutExpiredCard eventDetailPath={eventDetailPath} />
            )}

            {!loading && !isCheckoutReturn && payment?.checkoutUrl && !isPaid && (
              <CheckoutRedirectCard checkoutUrl={payment.checkoutUrl} payment={payment} />
            )}

            {!loading && !isCheckoutReturn && payment && !payment.checkoutUrl && !isPaid && (
              <PixPaymentCard payment={payment} copied={copied} onCopyPix={handleCopyPix} />
            )}

            {!loading && confirmed && (
              <ConfirmedCard payment={payment!} onShare={() => setShowShareModal(true)} />
            )}

            {!loading && !error && isCashPayment && !isInscriptionConfirmed && !isCheckoutReturn && (
              <CashPendingCard valorFormatado={inscription?.valorFormatado ?? '-'} />
            )}

            {!payment && !loading && !error && !isCashPayment && !isCheckoutReturn && <ProcessingCard />}
          </div>

          <div className="flex flex-col">
            {loading ? (
              <LoadingCard />
            ) : (
              <EventDetailsCard
                eventNameLong={eventNameLong ?? eventName}
                eventDates={eventDates}
                eventLocation={eventLocation}
                isPaid={confirmed}
                isCashPayment={isCashPayment}
                onDetail={() => router.push(eventDetailPath)}
                onHome={() => router.push('/')}
              />
            )}
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          inscriptionId={inscriptionId ?? ''}
          participantName={participantName}
          eventName={eventName}
          eventSubtitle={eventNameLong}
          eventDates={eventDates}
          eventLocation={eventLocation}
          eventLogoUrl={eventLogoUrl}
          hasBrinde={hasBrinde}
          onClose={() => setShowShareModal(false)}
        />
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
      <p className="text-text-secondary max-w-md mx-auto">
        Buscando informações da sua inscrição
      </p>
    </>
  )
}

function StatusIcon({ confirmed, cancelled, expired, processing }: {
  confirmed: boolean
  cancelled?: boolean
  expired?: boolean
  processing?: boolean
}) {
  if (cancelled) {
    return (
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-orange-500/20">
        <svg className="w-10 h-10 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      </div>
    )
  }
  if (expired) {
    return (
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-red-500/20">
        <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
    )
  }
  if (processing) {
    return (
      <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-blue-500/20">
        <div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      </div>
    )
  }
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

function CheckoutProcessingCard() {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento com Cartão</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
          Processando
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-12 h-12 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin mb-4" />
        <p className="text-text-primary font-medium mb-2">Pagamento recebido!</p>
        <p className="text-sm text-text-secondary text-center max-w-sm">
          Estamos processando a confirmação. Isso pode levar alguns segundos.
          A página será atualizada automaticamente.
        </p>
      </div>
    </div>
  )
}

function CheckoutCancelledCard({
  checkoutUrl,
  onRetry,
}: {
  checkoutUrl?: string
  onRetry: () => void
}) {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento Cancelado</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400">
          Cancelado
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <p className="text-text-primary font-medium mb-2">Você cancelou o pagamento</p>
        <p className="text-sm text-text-secondary text-center max-w-sm mb-6">
          Sua inscrição continua reservada. Você pode tentar pagar novamente a qualquer momento.
        </p>
        {checkoutUrl && (
          <button
            onClick={onRetry}
            className="w-full py-3 bg-gold text-bg-primary font-bold rounded-lg hover:bg-gold-dark transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  )
}

function CheckoutExpiredCard({ eventDetailPath }: { eventDetailPath: string }) {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento Expirado</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
          Expirado
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="text-text-primary font-medium mb-2">O tempo de pagamento expirou</p>
        <p className="text-sm text-text-secondary text-center max-w-sm mb-6">
          O link de pagamento expirou. Volte à página do evento para gerar uma nova inscrição.
        </p>
        <a
          href={eventDetailPath}
          className="w-full py-3 bg-gold text-bg-primary font-bold rounded-lg hover:bg-gold-dark transition-colors flex items-center justify-center gap-2 no-underline"
        >
          Voltar ao Evento
        </a>
      </div>
    </div>
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

interface PaymentLike {
  valorFormatado: string
  dataVencimento: string
  pixQrCode?: string
  pixCopiaECola?: string
  breakdown?: {
    valorBaseFormatado: string
    valorTaxaFormatado: string
    valorTotalFormatado: string
    metodo: string
    parcelas?: number
    valorParcelaFormatado?: string
  } | null
}

function BreakdownSummary({ breakdown }: { breakdown: PaymentLike['breakdown'] }) {
  if (!breakdown) return null
  return (
    <div className="mb-4 p-3 rounded-lg bg-bg-secondary border border-gold/10 text-sm">
      <div className="flex justify-between text-text-secondary">
        <span>Valor da inscrição</span>
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
      {breakdown.parcelas && breakdown.parcelas > 1 && breakdown.valorParcelaFormatado && (
        <p className="text-xs text-text-muted mt-2">
          Em {breakdown.parcelas}x de {breakdown.valorParcelaFormatado}
        </p>
      )}
    </div>
  )
}

function PixPaymentCard({
  payment,
  copied,
  onCopyPix,
}: {
  payment: PaymentLike
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

      <BreakdownSummary breakdown={payment.breakdown} />

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
            unoptimized
          />
        </div>
      )}

      {payment.pixCopiaECola && (
        <div className="space-y-3 mt-auto">
          <p className="text-sm text-text-muted text-center">Ou copie o código PIX:</p>
          <div className="bg-bg-secondary rounded-lg p-3">
            <p className="text-xs text-text-secondary break-all font-mono mb-3">
              {payment.pixCopiaECola.substring(0, 80)}...
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
  payment,
}: {
  checkoutUrl: string
  payment: PaymentLike
}) {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento com Cartão</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
          Aguardando Pagamento
        </span>
      </div>
      <BreakdownSummary breakdown={payment.breakdown} />
      <div className="flex-1 flex flex-col items-center justify-center py-6">
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
  payment,
  onShare,
}: {
  payment: PaymentLike
  onShare: () => void
}) {
  return (
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
        onClick={onShare}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-auto"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Compartilhar Inscrição
      </button>
    </div>
  )
}

function CashPendingCard({ valorFormatado }: { valorFormatado: string }) {
  return (
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
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
          </svg>
        </div>
        <p className="text-2xl font-bold text-gold mb-2">{valorFormatado}</p>
        <p className="text-sm text-text-muted text-center">Pague presencialmente na igreja</p>
      </div>
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-text-secondary">
        <p className="font-medium text-yellow-400 mb-2">Instruções:</p>
        <ul className="space-y-1 text-text-secondary">
          <li>• Dirija-se à secretaria da igreja</li>
          <li>• Informe seu nome e CPF</li>
          <li>• Efetue o pagamento em dinheiro</li>
          <li>• Sua inscrição será confirmada na hora</li>
        </ul>
      </div>
    </div>
  )
}


function ProcessingCard() {
  return (
    <div className="card text-left flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Pagamento</h3>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
          Processando
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-secondary text-center">
          O pagamento será gerado em breve.
        </p>
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
    ? 'Guarde este comprovante. Você também receberá mais informações por WhatsApp sobre o evento.'
    : isCashPayment
      ? 'Dirija-se à secretaria da igreja para efetuar o pagamento em dinheiro.'
      : 'Após o pagamento, sua inscrição será confirmada automaticamente.'

  return (
    <div className="card text-left flex-1 flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Detalhes do Evento</h3>
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gold/10">
          <span className="text-sm text-text-muted">Evento:</span>
          <span className="text-sm text-text-primary text-right">{eventNameLong}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-gold/10">
          <span className="text-sm text-text-muted">Datas:</span>
          <span className="text-sm text-text-primary text-right">{eventDates}</span>
        </div>
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

function ShareModal({
  inscriptionId,
  participantName,
  eventName,
  eventSubtitle,
  eventDates,
  eventLocation,
  eventLogoUrl,
  hasBrinde,
  onClose,
}: {
  inscriptionId: string
  participantName: string
  eventName: string
  eventSubtitle?: string
  eventDates: string
  eventLocation: string
  eventLogoUrl?: string
  hasBrinde?: boolean
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-bg-primary rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Compartilhe sua inscrição!</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ShareableReceipt
          inscriptionId={inscriptionId}
          participantName={participantName}
          eventName={eventName}
          eventSubtitle={eventSubtitle}
          eventDates={eventDates}
          eventLocation={eventLocation}
          eventLogoUrl={eventLogoUrl}
          hasBrinde={hasBrinde}
        />
      </div>
    </div>
  )
}

export function EventConfirmationPage(props: EventConfirmationPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-200px)]">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <EventConfirmationContent {...props} />
    </Suspense>
  )
}
