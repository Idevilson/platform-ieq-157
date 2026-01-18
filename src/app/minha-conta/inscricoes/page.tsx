'use client'

import Link from 'next/link'
import { useRequireAuth } from '@/hooks'
import { useUserInscriptions } from '@/hooks/queries/useUserInscriptions'
import { InscriptionStatus, INSCRIPTION_STATUS_LABELS } from '@/shared/constants'
import { UserInscriptionDTO, PaymentInfo } from '@/lib/services/userService'

export default function MinhasInscricoesPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const { data, isLoading, error } = useUserInscriptions({
    enabled: !!user,
  })

  const inscricoes = data?.inscriptions || []

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Minhas Inscricoes</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="spinner" />
          <p className="text-text-secondary">Carregando inscricoes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Minhas Inscricoes</h1>
        </div>
        <div className="card text-center py-12">
          <p className="text-red-400">Erro ao carregar inscricoes. Tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: InscriptionStatus) => {
    const config: Record<InscriptionStatus, string> = {
      pendente: 'badge-warning',
      confirmado: 'badge-success',
      cancelado: 'badge-danger'
    }
    return { class: config[status], label: INSCRIPTION_STATUS_LABELS[status] }
  }

  const getPaymentStatusBadge = (payment?: PaymentInfo) => {
    if (!payment) return null

    const config: Record<string, { class: string; label: string }> = {
      PENDING: { class: 'bg-yellow-500/20 text-yellow-400', label: 'Pagamento Pendente' },
      CONFIRMED: { class: 'bg-green-500/20 text-green-400', label: 'Pago' },
      RECEIVED: { class: 'bg-green-500/20 text-green-400', label: 'Pago' },
      OVERDUE: { class: 'bg-red-500/20 text-red-400', label: 'Vencido' },
      REFUNDED: { class: 'bg-gray-500/20 text-gray-400', label: 'Reembolsado' },
      CANCELLED: { class: 'bg-gray-500/20 text-gray-400', label: 'Cancelado' },
    }

    return config[payment.status] || { class: 'bg-gray-500/20 text-gray-400', label: payment.statusLabel }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Minhas Inscricoes</h1>
        <p className="text-text-secondary">Gerencie suas inscricoes em eventos</p>
      </div>

      {inscricoes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-12">
          <div className="text-5xl mb-4 opacity-60">📋</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Nenhuma inscricao encontrada</h2>
          <p className="text-text-secondary mb-6">Voce ainda nao se inscreveu em nenhum evento.</p>
          <Link href="/eventos" className="btn-primary">
            Ver eventos disponiveis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inscricoes.map((inscricao: UserInscriptionDTO) => {
            const statusBadge = getStatusBadge(inscricao.status)
            const paymentBadge = getPaymentStatusBadge(inscricao.payment)
            const isPendingPayment = inscricao.payment?.status === 'PENDING'
            const isPaid = inscricao.payment?.status === 'CONFIRMED' || inscricao.payment?.status === 'RECEIVED'

            return (
              <div key={inscricao.id} className={`card ${isPendingPayment ? 'border-2 border-yellow-500/50' : ''}`}>
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gold/10">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text-primary">{inscricao.eventTitulo}</h3>
                    {isPendingPayment && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 animate-pulse">
                        Aguardando pagamento
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {paymentBadge && (
                      <span className={`text-xs px-2 py-1 rounded-full ${paymentBadge.class}`}>
                        {paymentBadge.label}
                      </span>
                    )}
                    <span className={`badge ${statusBadge.class}`}>{statusBadge.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="block text-xs text-text-muted uppercase tracking-wide mb-1">Categoria</span>
                    <span className="text-sm text-text-primary">{inscricao.categoryNome}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted uppercase tracking-wide mb-1">Valor</span>
                    <span className="text-sm text-text-primary">{inscricao.valorFormatado}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted uppercase tracking-wide mb-1">Data da inscricao</span>
                    <span className="text-sm text-text-primary">{formatDate(inscricao.criadoEm)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted uppercase tracking-wide mb-1">Data do evento</span>
                    <span className="text-sm text-text-primary">{formatDate(inscricao.eventDataInicio)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gold/10">
                  {isPendingPayment && (
                    <Link
                      href={`/eventos/startup/confirmado?inscriptionId=${inscricao.id}&eventId=${inscricao.eventId}`}
                      className="btn btn-primary"
                    >
                      Pagar agora
                    </Link>
                  )}
                  {isPaid && (
                    <Link
                      href={`/eventos/startup/confirmado?inscriptionId=${inscricao.id}&eventId=${inscricao.eventId}`}
                      className="btn btn-secondary"
                    >
                      Ver comprovante
                    </Link>
                  )}
                  <Link href={`/eventos/${inscricao.eventId}`} className="btn btn-secondary">
                    Ver evento
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
