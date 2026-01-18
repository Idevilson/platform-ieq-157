'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEventById } from '@/hooks/queries/useEvents'
import { useAdminEventInscriptions } from '@/hooks/queries/useAdminEvents'
import { useUpdateEventStatus, useConfirmInscription } from '@/hooks/mutations/useAdminEventMutations'
import { INSCRIPTION_STATUS_LABELS, InscriptionStatus, INSCRIPTION_STATUSES, EVENT_STATUS_LABELS, EventStatus, INSCRIPTION_PAYMENT_METHOD_LABELS, InscriptionPaymentMethod } from '@/shared/constants'
import { formatDateTime, formatCPF, formatPhone } from '@/lib/formatters'
import { InscriptionWithDetails } from '@/lib/services/adminService'

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

interface ConfirmModalProps {
  inscription: InscriptionWithDetails
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

function ConfirmModal({ inscription, onClose, onConfirm, isLoading }: ConfirmModalProps) {
  const isPending = inscription.status === 'pendente'
  const hasPixPayment = inscription.preferredPaymentMethod === 'PIX'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-bg-secondary border border-gold/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Detalhes da Inscricao</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted">Nome</label>
              <p className="text-text-primary font-medium">{inscription.nome}</p>
            </div>
            <div>
              <label className="text-xs text-text-muted">CPF</label>
              <p className="text-text-primary font-mono">{formatCPFSafe(inscription.cpf)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted">Email</label>
              <p className="text-text-primary text-sm">{inscription.email}</p>
            </div>
            <div>
              <label className="text-xs text-text-muted">Telefone</label>
              <p className="text-text-primary">{formatPhoneSafe(inscription.telefone)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted">Categoria</label>
              <p className="text-text-primary">{inscription.categoryNome}</p>
            </div>
            <div>
              <label className="text-xs text-text-muted">Valor</label>
              <p className="text-gold font-bold">{inscription.valorFormatado}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted">Metodo de Pagamento</label>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${inscription.preferredPaymentMethod === 'CASH' ? 'bg-orange-500/20 text-orange-400' : 'bg-sky-500/20 text-sky-400'}`}>
                {INSCRIPTION_PAYMENT_METHOD_LABELS[inscription.preferredPaymentMethod] || 'PIX'}
              </span>
            </div>
            <div>
              <label className="text-xs text-text-muted">Status</label>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getInscriptionStatusClassName(inscription.status)}`}>
                {inscription.statusLabel}
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted">Data da Inscricao</label>
            <p className="text-text-primary text-sm">{formatDateTime(inscription.criadoEm)}</p>
          </div>

          {isPending && (
            <div className="pt-4 border-t border-gold/10">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-400 font-medium mb-1">Confirmar Manualmente</p>
                <p className="text-xs text-text-secondary">
                  {hasPixPayment
                    ? 'A cobranca PIX pendente no Asaas sera cancelada automaticamente.'
                    : 'Esta inscricao sera marcada como confirmada.'}
                </p>
              </div>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmar Inscricao
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminEventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const [statusFilter, setStatusFilter] = useState<InscriptionStatus | ''>('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<InscriptionPaymentMethod | ''>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)
  const [selectedInscription, setSelectedInscription] = useState<InscriptionWithDetails | null>(null)

  const { data: event, isLoading: eventLoading, refetch: refetchEvent } = useEventById(eventId)
  const { data: inscriptionsData, isLoading: inscriptionsLoading, refetch: refetchInscriptions } = useAdminEventInscriptions(
    eventId,
    { status: statusFilter || undefined, limit: 500 }
  )
  const updateStatus = useUpdateEventStatus()
  const confirmInscription = useConfirmInscription()

  const inscriptions = useMemo(() => inscriptionsData?.inscriptions ?? [], [inscriptionsData?.inscriptions])

  // Filter inscriptions by search term and payment method
  const filteredInscriptions = useMemo(() => {
    return inscriptions.filter(inscription => {
      // Filter by payment method
      if (paymentMethodFilter && inscription.preferredPaymentMethod !== paymentMethodFilter) {
        return false
      }

      // Filter by search term
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesName = inscription.nome?.toLowerCase().includes(search)
        const matchesCPF = inscription.cpf?.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
        const matchesEmail = inscription.email?.toLowerCase().includes(search)
        const matchesPhone = inscription.telefone?.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
        return matchesName || matchesCPF || matchesEmail || matchesPhone
      }

      return true
    })
  }, [inscriptions, searchTerm, paymentMethodFilter])

  if (eventLoading) return <LoadingSpinner message="Carregando evento..." />
  if (!event) return <EventNotFound />

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

  const handleConfirmInscription = async () => {
    if (!selectedInscription) return
    try {
      await confirmInscription.mutateAsync({ inscriptionId: selectedInscription.id, eventId })
      setSelectedInscription(null)
      refetchInscriptions()
    } catch (error) {
      console.error('Erro ao confirmar inscricao:', error)
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
        <div className="p-6 border-b border-gold/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold text-text-primary">Inscricoes</h2>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-bg-tertiary border border-gold/20 rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold w-full sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InscriptionStatus | '')}
                className="bg-bg-tertiary border border-gold/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold"
              >
                <option value="">Status: Todos</option>
                {INSCRIPTION_STATUSES.map((status) => (
                  <option key={status} value={status}>{INSCRIPTION_STATUS_LABELS[status]}</option>
                ))}
              </select>

              {/* Payment Method Filter */}
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value as InscriptionPaymentMethod | '')}
                className="bg-bg-tertiary border border-gold/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold"
              >
                <option value="">Pagamento: Todos</option>
                <option value="PIX">PIX</option>
                <option value="CASH">Dinheiro</option>
              </select>
            </div>
          </div>

          {/* Active filters indicator */}
          {(searchTerm || statusFilter || paymentMethodFilter) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-text-muted">Filtros ativos:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-xs rounded-full">
                  Busca: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="hover:text-white">×</button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-xs rounded-full">
                  {INSCRIPTION_STATUS_LABELS[statusFilter]}
                  <button onClick={() => setStatusFilter('')} className="hover:text-white">×</button>
                </span>
              )}
              {paymentMethodFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold/10 text-gold text-xs rounded-full">
                  {INSCRIPTION_PAYMENT_METHOD_LABELS[paymentMethodFilter]}
                  <button onClick={() => setPaymentMethodFilter('')} className="hover:text-white">×</button>
                </span>
              )}
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter(''); setPaymentMethodFilter(''); }}
                className="text-xs text-text-muted hover:text-gold"
              >
                Limpar todos
              </button>
            </div>
          )}
        </div>

        {inscriptionsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner" />
          </div>
        )}

        {!inscriptionsLoading && filteredInscriptions.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <svg className="w-12 h-12 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>Nenhuma inscricao encontrada</p>
            {searchTerm && (
              <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
            )}
            {event.status === 'rascunho' && !searchTerm && (
              <p className="text-sm mt-2">Altere o status para &quot;Aberto&quot; para receber inscricoes</p>
            )}
          </div>
        )}

        {!inscriptionsLoading && filteredInscriptions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Nome</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Contato</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">CPF</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-text-secondary">Categoria</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-text-secondary">Valor</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-text-secondary">Pagamento</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-text-secondary">Status</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-text-secondary">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredInscriptions.map((inscription) => (
                  <tr
                    key={inscription.id}
                    onClick={() => setSelectedInscription(inscription)}
                    className="border-b border-gold/5 hover:bg-gold/5 transition-colors cursor-pointer"
                  >
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${inscription.preferredPaymentMethod === 'CASH' ? 'bg-orange-500/20 text-orange-400' : 'bg-sky-500/20 text-sky-400'}`}>
                        {INSCRIPTION_PAYMENT_METHOD_LABELS[inscription.preferredPaymentMethod] || 'PIX'}
                      </span>
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

        {filteredInscriptions.length > 0 && (
          <div className="p-4 text-center text-sm text-text-secondary border-t border-gold/10">
            Exibindo {filteredInscriptions.length} {filteredInscriptions.length !== totalInscriptions && `de ${totalInscriptions}`} inscricoes
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {selectedInscription && (
        <ConfirmModal
          inscription={selectedInscription}
          onClose={() => setSelectedInscription(null)}
          onConfirm={handleConfirmInscription}
          isLoading={confirmInscription.isPending}
        />
      )}
    </div>
  )
}
