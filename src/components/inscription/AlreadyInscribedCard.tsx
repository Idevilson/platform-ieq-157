'use client'

import Link from 'next/link'
import { InscriptionDTO } from '@/shared/types'
import { INSCRIPTION_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/shared/constants'

interface AlreadyInscribedCardProps {
  inscription: InscriptionDTO
  eventTitle?: string
  categoryName?: string
}

export function AlreadyInscribedCard({
  inscription,
  eventTitle,
  categoryName,
}: AlreadyInscribedCardProps) {
  const statusClass = getStatusClass(inscription.status)
  const paymentStatusClass = getPaymentStatusClass(inscription.paymentStatus)

  return (
    <div className="bg-bg-secondary rounded-2xl border border-gold/20 p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gold mb-2">Voce ja esta inscrito!</h3>
      <p className="text-text-secondary mb-4">
        Sua inscricao para {eventTitle || 'este evento'} foi realizada com sucesso.
      </p>

      <div className="bg-bg-primary rounded-xl p-4 mb-6 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm text-text-muted">Status da Inscricao</span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusClass}`}>
            {INSCRIPTION_STATUS_LABELS[inscription.status]}
          </span>
        </div>

        {inscription.paymentStatus && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-sm text-text-muted">Status do Pagamento</span>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${paymentStatusClass}`}>
              {PAYMENT_STATUS_LABELS[inscription.paymentStatus]}
            </span>
          </div>
        )}

        {categoryName && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-sm text-text-muted">Categoria</span>
            <span className="text-sm text-text-primary font-medium">{categoryName}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-text-muted">Valor</span>
          <span className="text-lg font-bold text-gold">{inscription.valorFormatado}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/eventos/startup/confirmado?inscriptionId=${inscription.id}`}
          className="px-6 py-3 bg-gold text-bg-primary font-bold rounded-xl hover:bg-gold-light transition-colors"
        >
          Ver Detalhes da Inscricao
        </Link>
        <Link
          href="/minha-conta/inscricoes"
          className="px-6 py-3 bg-bg-tertiary text-text-primary font-medium rounded-xl hover:bg-bg-primary transition-colors border border-gold/20"
        >
          Minhas Inscricoes
        </Link>
      </div>
    </div>
  )
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    pendente: 'bg-yellow-500/20 text-yellow-400',
    confirmado: 'bg-green-500/20 text-green-400',
    cancelado: 'bg-red-500/20 text-red-400',
  }
  return classes[status] || classes.pendente
}

function getPaymentStatusClass(status?: string): string {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    RECEIVED: 'bg-green-500/20 text-green-400',
    CONFIRMED: 'bg-green-500/20 text-green-400',
    OVERDUE: 'bg-red-500/20 text-red-400',
    REFUNDED: 'bg-gray-500/20 text-gray-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
  }
  return status ? classes[status] || classes.PENDING : classes.PENDING
}
