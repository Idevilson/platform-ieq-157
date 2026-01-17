'use client'

import Link from 'next/link'
import { useRequireAuth } from '@/hooks'
import { useUserInscriptions } from '@/hooks/queries/useUserInscriptions'
import { InscriptionStatus, INSCRIPTION_STATUS_LABELS } from '@/shared/constants'
import { UserInscriptionDTO } from '@/lib/services/userService'

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

            return (
              <div key={inscricao.id} className="card">
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gold/10">
                  <h3 className="text-lg font-semibold text-text-primary">{inscricao.eventTitulo}</h3>
                  <span className={`badge ${statusBadge.class}`}>{statusBadge.label}</span>
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
                  {inscricao.status === 'pendente' && inscricao.paymentId && (
                    <Link href={`/minha-conta/pagamentos/${inscricao.paymentId}`} className="btn-primary">
                      Pagar agora
                    </Link>
                  )}
                  <Link href={`/eventos/${inscricao.eventId}`} className="btn-secondary">
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
