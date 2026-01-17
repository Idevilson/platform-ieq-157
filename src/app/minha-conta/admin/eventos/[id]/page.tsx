'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEventById } from '@/hooks/queries/useEvents'
import { useAdminEventInscriptions } from '@/hooks/queries/useAdminEvents'
import { useUpdateEventStatus } from '@/hooks/mutations/useAdminEventMutations'
import { INSCRIPTION_STATUS_LABELS, InscriptionStatus, INSCRIPTION_STATUSES, EVENT_STATUS_LABELS, EventStatus } from '@/shared/constants'
import { formatDateTime, formatCPF, formatPhone } from '@/lib/formatters'

function formatCPFSafe(cpf: string): string {
  if (!cpf) return '-'
  return formatCPF(cpf)
}

function formatPhoneSafe(phone: string): string {
  if (!phone) return '-'
  return formatPhone(phone)
}

function getStatusClassName(status: string): string {
  const statusClasses: Record<string, string> = {
    aberto: 'bg-green-500/20 text-green-400 border-green-500/30',
    encerrado: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    rascunho: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    fechado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return statusClasses[status] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

function getInscriptionStatusClassName(status: string): string {
  const statusClasses: Record<string, string> = {
    confirmado: 'bg-green-500/20 text-green-400',
    pendente: 'bg-yellow-500/20 text-yellow-400',
  }
  return statusClasses[status] ?? 'bg-red-500/20 text-red-400'
}

function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner" />
        <span className="text-text-secondary">{message}</span>
      </div>
    </div>
  )
}

function EventNotFound() {
  return (
    <div className="text-center py-12">
      <p className="text-text-secondary">Evento nao encontrado</p>
      <Link href="/minha-conta/admin" className="text-gold hover:underline mt-4 inline-block">
        Voltar para lista
      </Link>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon: React.ReactNode
  color: 'gold' | 'green' | 'yellow' | 'blue'
}

function StatCard({ label, value, subValue, icon, color }: StatCardProps) {
  const colorClasses = {
    gold: 'text-gold border-gold/20',
    green: 'text-green-400 border-green-500/20',
    yellow: 'text-yellow-400 border-yellow-500/20',
    blue: 'text-sky-400 border-sky-500/20',
  }

  return (
    <div className={`bg-bg-secondary border ${colorClasses[color]} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className={colorClasses[color]}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}>{value}</p>
      {subValue && <p className="text-xs text-text-muted mt-1">{subValue}</p>}
    </div>
  )
}

export default function AdminEventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [statusFilter, setStatusFilter] = useState<InscriptionStatus | ''>('')
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)

  const { data: event, isLoading: eventLoading, refetch: refetchEvent } = useEventById(eventId)
  const { data: inscriptionsData, isLoading: inscriptionsLoading } = useAdminEventInscriptions(
    eventId,
    { status: statusFilter || undefined, limit: 100 }
  )
  const updateStatus = useUpdateEventStatus()

  if (eventLoading) return <LoadingSpinner message="Carregando evento..." />
  if (!event) return <EventNotFound />

  const inscriptions = inscriptionsData?.inscriptions ?? []
  const totalInscriptions = inscriptionsData?.total ?? 0
  const confirmedCount = inscriptions.filter(i => i.status === 'confirmado').length
  const pendingCount = inscriptions.filter(i => i.status === 'pendente').length
  const totalRevenue = inscriptions
    .filter(i => i.status === 'confirmado')
    .reduce((sum, i) => sum + (i.valor || 0), 0)

  const handleStatusChange = async (newStatus: EventStatus) => {
    setIsStatusMenuOpen(false)
    try {
      await updateStatus.mutateAsync({ eventId, status: newStatus })
      refetchEvent()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const availableStatusTransitions: Record<EventStatus, EventStatus[]> = {
    rascunho: ['aberto', 'cancelado'],
    aberto: ['fechado', 'encerrado', 'cancelado'],
    fechado: ['aberto', 'encerrado', 'cancelado'],
    encerrado: [],
    cancelado: [],
  }

  const allowedStatuses = availableStatusTransitions[event.status as EventStatus] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/minha-conta/admin" className="text-sm text-text-secondary hover:text-gold transition-colors no-underline">
          ← Voltar para lista
        </Link>
      </div>

      {/* Event Info Card */}
      <div className="bg-bg-secondary border border-gold/10 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">{event.titulo}</h1>
            {event.subtitulo && <p className="text-text-secondary mt-1">{event.subtitulo}</p>}
            <p className="text-sm text-text-muted mt-3">{event.descricao}</p>

            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              <div>
                <span className="text-text-muted">Data:</span>
                <span className="text-text-primary ml-2">{formatDateTime(event.dataInicio)}</span>
                {event.dataFim && (
                  <span className="text-text-primary"> - {formatDateTime(event.dataFim)}</span>
                )}
              </div>
              <div>
                <span className="text-text-muted">Local:</span>
                <span className="text-text-primary ml-2">{event.local}</span>
              </div>
            </div>
          </div>

          {/* Status Control */}
          <div className="flex flex-col items-end gap-3">
            <div className="relative">
              <button
                onClick={() => allowedStatuses.length > 0 && setIsStatusMenuOpen(!isStatusMenuOpen)}
                disabled={allowedStatuses.length === 0 || updateStatus.isPending}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${getStatusClassName(event.status)} ${allowedStatuses.length > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              >
                {updateStatus.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Atualizando...
                  </span>
                ) : (
                  <>
                    {EVENT_STATUS_LABELS[event.status as EventStatus]}
                    {allowedStatuses.length > 0 && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </>
                )}
              </button>

              {isStatusMenuOpen && allowedStatuses.length > 0 && (
                <div className="absolute right-0 top-full mt-2 bg-bg-tertiary border border-gold/20 rounded-lg shadow-xl z-10 min-w-[200px]">
                  <div className="p-2">
                    <p className="text-xs text-text-muted px-3 py-2">Alterar status para:</p>
                    {allowedStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-gold/10 rounded-lg transition-colors"
                      >
                        {EVENT_STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {allowedStatuses.length === 0 && (
              <p className="text-xs text-text-muted">Status final - nao pode ser alterado</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de Inscricoes"
          value={totalInscriptions}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="gold"
        />
        <StatCard
          label="Confirmadas"
          value={confirmedCount}
          subValue={totalInscriptions > 0 ? `${Math.round((confirmedCount / totalInscriptions) * 100)}% do total` : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          label="Pendentes"
          value={pendingCount}
          subValue={totalInscriptions > 0 ? `${Math.round((pendingCount / totalInscriptions) * 100)}% do total` : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          label="Receita Confirmada"
          value={`R$ ${(totalRevenue / 100).toFixed(2).replace('.', ',')}`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
      </div>

      {/* Inscriptions Section */}
      <div className="bg-bg-secondary border border-gold/10 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-gold/10">
          <h2 className="text-lg font-semibold text-text-primary">Inscricoes</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">Filtrar:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InscriptionStatus | '')}
              className="bg-bg-tertiary border border-gold/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold"
            >
              <option value="">Todos</option>
              {INSCRIPTION_STATUSES.map((status) => (
                <option key={status} value={status}>{INSCRIPTION_STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>
        </div>

        {inscriptionsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner" />
          </div>
        )}

        {!inscriptionsLoading && inscriptions.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <svg className="w-12 h-12 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>Nenhuma inscricao encontrada</p>
            {event.status === 'rascunho' && (
              <p className="text-sm mt-2">Altere o status para &quot;Aberto&quot; para receber inscricoes</p>
            )}
          </div>
        )}

        {!inscriptionsLoading && inscriptions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Nome</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Contato</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">CPF</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Categoria</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-text-secondary">Valor</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-text-secondary">Status</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-text-secondary">Data</th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map((inscription) => (
                  <tr key={inscription.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-text-primary">{inscription.nome ?? '-'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-text-secondary">{inscription.email ?? '-'}</p>
                        <p className="text-text-muted">{formatPhoneSafe(inscription.telefone)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-text-secondary font-mono">{formatCPFSafe(inscription.cpf)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-text-primary">{inscription.categoryNome ?? '-'}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-medium text-gold">{inscription.valorFormatado}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getInscriptionStatusClassName(inscription.status)}`}>
                        {inscription.statusLabel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-xs text-text-secondary">{formatDateTime(inscription.criadoEm)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {inscriptionsData && inscriptionsData.total > inscriptionsData.limit && (
          <div className="p-4 text-center text-sm text-text-secondary border-t border-gold/10">
            Exibindo {inscriptions.length} de {inscriptionsData.total} inscricoes
          </div>
        )}
      </div>
    </div>
  )
}
