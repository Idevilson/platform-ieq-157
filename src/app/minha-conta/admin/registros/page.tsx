'use client'

import { useMemo, useState } from 'react'
import { useAuditLogs } from '@/hooks/queries/useAuditLogs'
import { AuditLogDTO, AuditLogType } from '@/shared/constants'

type TypeFilter = 'all' | AuditLogType

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatCpf(cpf?: string): string | undefined {
  if (!cpf) return undefined
  const d = cpf.replace(/\D/g, '')
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf
}

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function dayLabel(iso: string): string {
  const key = dayKey(iso)
  const hoje = new Date().toLocaleDateString('pt-BR')
  const ontemDate = new Date()
  ontemDate.setDate(ontemDate.getDate() - 1)
  const ontem = ontemDate.toLocaleDateString('pt-BR')
  if (key === hoje) return 'Hoje'
  if (key === ontem) return 'Ontem'
  return key
}

function describe(log: AuditLogDTO): { title: string; text: string } {
  const alvo = log.targetKind === 'batch' ? `o lote de ${log.targetNome}` : log.targetNome
  if (log.type === 'cash_confirm') {
    return {
      title: 'Pagamento confirmado',
      text: `${log.actorNome || 'Alguém'} confirmou o pagamento em dinheiro de ${alvo}`,
    }
  }
  const led = log.comLed === undefined ? '' : log.comLed ? ' (com pulseira LED)' : ' (sem pulseira LED)'
  return {
    title: 'Kit entregue',
    text: `${log.actorNome || 'Alguém'} entregou o kit completo${led} para ${alvo}`,
  }
}

export default function RegistrosPage() {
  const [limit, setLimit] = useState(100)
  const { data: logs = [], isLoading } = useAuditLogs(limit)
  const [type, setType] = useState<TypeFilter>('all')
  const [eventId, setEventId] = useState('')

  const events = useMemo(() => {
    const map = new Map<string, string>()
    logs.forEach((l) => { if (!map.has(l.eventId)) map.set(l.eventId, l.eventTitulo ?? l.eventId) })
    return [...map.entries()].map(([id, titulo]) => ({ id, titulo }))
  }, [logs])

  const groups = useMemo(() => {
    const filtered = logs.filter((l) => (type === 'all' || l.type === type) && (eventId === '' || l.eventId === eventId))
    const out: { label: string; items: AuditLogDTO[] }[] = []
    for (const log of filtered) {
      const label = dayLabel(log.criadoEm)
      const last = out[out.length - 1]
      if (last && last.label === label) last.items.push(log)
      else out.push({ label, items: [log] })
    }
    return out
  }, [logs, type, eventId])

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-text-primary">Registros de Operação</h2>

      <div className="flex flex-wrap gap-2">
        <Chip active={type === 'all'} onClick={() => setType('all')}>Tudo</Chip>
        <Chip active={type === 'cash_confirm'} onClick={() => setType('cash_confirm')}>💵 Pagamentos</Chip>
        <Chip active={type === 'kit_delivery'} onClick={() => setType('kit_delivery')}>🎒 Kits</Chip>
      </div>

      {events.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Chip active={eventId === ''} onClick={() => setEventId('')}>Todos os eventos</Chip>
          {events.map((e) => (
            <Chip key={e.id} active={eventId === e.id} onClick={() => setEventId(e.id)}>{e.titulo}</Chip>
          ))}
        </div>
      )}

      {isLoading && <p className="text-text-secondary text-sm">Carregando registros...</p>}

      {!isLoading && groups.length === 0 && (
        <p className="text-text-secondary text-sm">Nenhum registro ainda.</p>
      )}

      {groups.map((group) => (
        <div key={group.label} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-text-muted">{group.label}</span>
            <span className="h-px flex-1 bg-gold/10" />
          </div>
          {group.items.map((log) => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      ))}

      {!isLoading && logs.length >= limit && (
        <div className="flex justify-center">
          <button onClick={() => setLimit((l) => l + 100)} className="px-4 py-2 text-sm text-gold border border-gold/30 rounded-lg hover:bg-gold/10">
            Carregar mais
          </button>
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${active ? 'bg-gold/20 text-gold border-gold/40' : 'bg-bg-tertiary text-text-secondary border-transparent hover:text-text-primary'}`}
    >
      {children}
    </button>
  )
}

function LogCard({ log }: { log: AuditLogDTO }) {
  const isCash = log.type === 'cash_confirm'
  const { title, text } = describe(log)
  const isBatch = log.targetKind === 'batch'
  return (
    <div className={`bg-bg-secondary border border-gold/10 border-l-4 rounded-xl p-4 ${isCash ? 'border-l-green-500/70' : 'border-l-amber-500/70'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">{isCash ? '💵' : '🎒'}</span>
          <span className="text-sm font-semibold text-text-primary truncate">{title}</span>
        </div>
        <span className="text-xs text-text-muted whitespace-nowrap shrink-0">{formatTime(log.criadoEm)}</span>
      </div>
      <p className="text-sm text-text-secondary mt-1.5">{text}</p>
      {formatCpf(log.targetCpf) && (
        <p className="text-xs text-text-muted mt-1">CPF: {formatCpf(log.targetCpf)}</p>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded border ${isBatch ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'bg-sky-500/15 text-sky-300 border-sky-500/30'}`}>
          {isBatch ? `Coletiva${log.totalParticipantes ? ` (${log.totalParticipantes})` : ''}` : 'Individual'}
        </span>
        {log.eventTitulo && <span className="text-xs text-text-muted truncate">{log.eventTitulo}</span>}
      </div>
    </div>
  )
}
