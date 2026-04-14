"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getIdToken } from '@/lib/firebase/FirebaseAuthService'

interface PerkAllocation {
  inscriptionId: string
  userId: string | null
  nome: string
  cpf: string
  email: string
  telefone: string
  alocadoEm: string
}

interface PerkSummary {
  id: string
  nome: string
  limiteEstoque: number
  quantidadeRestante: number
  disponivel: boolean
}

async function fetchSummary(eventId: string): Promise<PerkSummary | null> {
  const response = await fetch(`/api/events/${eventId}/perks/summary`)
  if (!response.ok) return null
  const data = await response.json()
  return data.summary
}

async function fetchHolders(eventId: string, perkId: string, token: string): Promise<PerkAllocation[]> {
  const response = await fetch(`/api/admin/events/${eventId}/perks/${perkId}/holders`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return []
  const data = await response.json()
  return data.holders ?? []
}

function holdersToCSV(holders: PerkAllocation[]): string {
  const header = 'Nome,CPF,Email,Telefone,Inscrição ID,User ID,Alocado Em'
  const rows = holders.map((h) => [
    JSON.stringify(h.nome),
    JSON.stringify(h.cpf),
    JSON.stringify(h.email),
    JSON.stringify(h.telefone),
    JSON.stringify(h.inscriptionId),
    JSON.stringify(h.userId ?? ''),
    JSON.stringify(h.alocadoEm),
  ].join(','))
  return [header, ...rows].join('\n')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function formatCPF(cpf: string): string {
  if (!cpf || cpf.length !== 11) return cpf || '-'
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

function formatDate(iso: string): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface AdminPerkCardProps {
  eventId: string
}

export function AdminPerkCard({ eventId }: AdminPerkCardProps) {
  const [showModal, setShowModal] = useState(false)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['admin-perk-summary', eventId],
    queryFn: () => fetchSummary(eventId),
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="card border-gold/20">
        <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!summary) return null

  const alocadas = summary.limiteEstoque - summary.quantidadeRestante

  return (
    <>
      <div
        className="card border-gold/30 cursor-pointer hover:border-gold/60 transition-all"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gold">🎁 {summary.nome}</h3>
            <p className="text-xs text-text-muted">Clique para ver as alocações</p>
          </div>
          <span className={`px-3 py-1 text-xs rounded-full ${summary.disponivel ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {summary.disponivel ? 'Disponível' : 'Esgotado'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-black text-gold">{alocadas}</span>
          <span className="text-text-secondary">/ {summary.limiteEstoque}</span>
        </div>

        <p className="text-sm text-text-muted mb-4">
          Restam {summary.quantidadeRestante} brindes
        </p>

        <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-500"
            style={{ width: `${(alocadas / Math.max(summary.limiteEstoque, 1)) * 100}%` }}
          />
        </div>
      </div>

      {showModal && (
        <PerkHoldersModal
          eventId={eventId}
          perkId={summary.id}
          perkNome={summary.nome}
          totalAlocadas={alocadas}
          limiteEstoque={summary.limiteEstoque}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

function PerkHoldersModal({
  eventId,
  perkId,
  perkNome,
  totalAlocadas,
  limiteEstoque,
  onClose,
}: {
  eventId: string
  perkId: string
  perkNome: string
  totalAlocadas: number
  limiteEstoque: number
  onClose: () => void
}) {
  const [holders, setHolders] = useState<PerkAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useState(() => {
    const load = async () => {
      const token = await getIdToken()
      if (!token) { setLoading(false); return }
      const data = await fetchHolders(eventId, perkId, token)
      setHolders(data)
      setLoading(false)
    }
    load()
  })

  const handleExport = async () => {
    setExporting(true)
    const csv = holdersToCSV(holders)
    downloadCSV(csv, `brindes-${eventId}-${perkId}.csv`)
    setExporting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl bg-bg-secondary border border-gold/20 rounded-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-gold/10 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary">🎁 {perkNome}</h2>
            <p className="text-sm text-text-muted">{totalAlocadas} de {limiteEstoque} alocadas</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting || holders.length === 0}
              className="btn-secondary px-4 py-2 text-sm"
            >
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : holders.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              <p>Nenhuma pulseira alocada ainda.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left py-3 px-6 text-xs font-medium text-text-muted">#</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-text-muted">Nome</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-text-muted">CPF</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-text-muted">Email</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-text-muted">Alocado em</th>
                </tr>
              </thead>
              <tbody>
                {holders.map((holder, index) => (
                  <tr key={holder.inscriptionId} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                    <td className="py-3 px-6 text-sm text-text-muted">{index + 1}</td>
                    <td className="py-3 px-6 text-sm text-text-primary font-medium">
                      {holder.nome || holder.userId || '-'}
                    </td>
                    <td className="py-3 px-6 text-sm text-text-secondary font-mono">
                      {formatCPF(holder.cpf)}
                    </td>
                    <td className="py-3 px-6 text-sm text-text-secondary">
                      {holder.email || '-'}
                    </td>
                    <td className="py-3 px-6 text-xs text-text-muted text-right">
                      {formatDate(holder.alocadoEm)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
