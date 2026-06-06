'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdminEventsList } from '@/hooks/queries/useAdminEvents'
import { EVENT_STATUS_LABELS, EventStatus, EVENT_STATUSES } from '@/shared/constants'
import { CreateEventModal } from '@/components/admin/CreateEventModal'

function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data, isLoading, error, refetch } = useAdminEventsList({
    status: statusFilter || undefined,
    limit: 50,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <span className="text-text-secondary">Carregando eventos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400">Erro ao carregar eventos</p>
      </div>
    )
  }

  const events = data?.events || []

  const getStatusClass = (status: string) => {
    if (status === 'aberto') return 'bg-green-500/20 text-green-400'
    if (status === 'encerrado') return 'bg-gray-500/20 text-gray-400'
    if (status === 'rascunho') return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-red-500/20 text-red-400'
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Eventos</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <label className="text-sm text-text-secondary whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EventStatus | '')}
              className="flex-1 sm:flex-none bg-bg-tertiary border border-gold/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold"
            >
              <option value="">Todos</option>
              {EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {EVENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-gold text-bg-primary font-medium text-sm rounded-lg hover:bg-gold-dark transition-colors"
          >
            + Novo Evento
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          Nenhum evento encontrado
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="sm:hidden space-y-3">
            {events.map((event) => (
              <div key={event.id} className="bg-bg-secondary border border-gold/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{event.titulo}</p>
                    {event.subtitulo && (
                      <p className="text-sm text-text-secondary truncate">{event.subtitulo}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(event.status)}`}>
                    {event.statusLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <div>
                    <span className="text-text-muted">Data: </span>
                    <span className="text-text-secondary">{formatDate(event.dataInicio)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-text-primary">{event.stats.total}</span>
                    <span className="text-text-muted text-xs ml-1">inscritos</span>
                    <div className="flex gap-2 text-xs justify-end">
                      <span className="text-green-400">{event.stats.confirmado} conf.</span>
                      <span className="text-yellow-400">{event.stats.pendente} pend.</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/minha-conta/admin/eventos/${event.id}`}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition-colors no-underline"
                >
                  Ver detalhes →
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Evento</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary">Inscritos</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-text-primary">{event.titulo}</p>
                        {event.subtitulo && (
                          <p className="text-sm text-text-secondary">{event.subtitulo}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-text-secondary">{formatDate(event.dataInicio)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(event.status)}`}>
                        {event.statusLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-semibold text-text-primary">{event.stats.total}</span>
                        <div className="flex gap-2 text-xs">
                          <span className="text-green-400">{event.stats.confirmado} conf.</span>
                          <span className="text-yellow-400">{event.stats.pendente} pend.</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/minha-conta/admin/eventos/${event.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition-colors no-underline"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data && data.total > data.limit && (
        <div className="mt-4 text-center text-sm text-text-secondary">
          Exibindo {events.length} de {data.total} eventos
        </div>
      )}

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
