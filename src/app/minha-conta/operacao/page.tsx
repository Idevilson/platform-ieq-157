'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { operacaoService, OperableEvent, OpsBatch } from '@/lib/services/operacaoService'
import { adminService, InscriptionWithDetails } from '@/lib/services/adminService'
import { KitDeliveryList } from '@/components/admin/KitDeliveryList'
import { EventSelect } from '@/components/operacao/EventSelect'
import { KitDeliveryDTO, KitItemDef, GENDER_LABELS, EVENT_OPS_PERMISSIONS, DELIVER_KITS_PERMISSION, CONFIRM_CASH_PERMISSION } from '@/shared/constants'

type StatusKind = 'cash' | 'kit' | 'pix' | 'done' | 'cancel'

interface RowStatus {
  kind: StatusKind
  entregues: number
  aplicaveis: number
}

type Selected =
  | { kind: 'inscription'; item: InscriptionWithDetails }
  | { kind: 'batch'; item: OpsBatch }

const PAYMENT_LABEL: Record<string, string> = {
  CASH: 'Dinheiro (espécie)',
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de crédito',
}

function formatCpf(cpf?: string): string | undefined {
  if (!cpf) return undefined
  const d = cpf.replace(/\D/g, '')
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf
}

function applicableItemIds(items: KitItemDef[], temBrinde: boolean): string[] {
  return items.filter((i) => !i.condicionalAoBrinde || temBrinde).map((i) => i.id)
}

function kitStatus(
  status: string,
  method: string,
  kitDeliveries: KitDeliveryDTO[],
  kitItems: KitItemDef[],
  temBrinde: boolean,
): RowStatus {
  if (status === 'cancelado') return { kind: 'cancel', entregues: 0, aplicaveis: 0 }
  if (status === 'pendente') {
    return { kind: method === 'CASH' ? 'cash' : 'pix', entregues: 0, aplicaveis: 0 }
  }
  const aplicaveis = applicableItemIds(kitItems, temBrinde)
  const entreguesSet = new Set(kitDeliveries.filter((d) => d.entregue).map((d) => d.itemId))
  const entregues = aplicaveis.filter((id) => entreguesSet.has(id)).length
  if (aplicaveis.length > 0 && entregues < aplicaveis.length) {
    return { kind: 'kit', entregues, aplicaveis: aplicaveis.length }
  }
  return { kind: 'done', entregues, aplicaveis: aplicaveis.length }
}

const PRIORITY: Record<StatusKind, number> = { cash: 1, kit: 2, pix: 3, done: 4, cancel: 5 }

function StatusBadge({ status }: { status: RowStatus }) {
  const map: Record<StatusKind, { label: string; className: string }> = {
    cash: { label: 'Aguardando dinheiro', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    kit: { label: `Kit ${status.entregues}/${status.aplicaveis}`, className: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30' },
    pix: { label: 'Aguardando PIX/cartão', className: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
    done: { label: 'Concluído', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    cancel: { label: 'Cancelado', className: 'bg-red-500/10 text-red-300 border-red-500/20' },
  }
  const { label, className } = map[status.kind]
  return <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${className}`}>{label}</span>
}

export default function OperacaoPage() {
  const { isAdmin, permissions, loading, profileLoading, user, hasPermission } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const canAccess = isAdmin || permissions.some((g) => EVENT_OPS_PERMISSIONS.includes(g.key))

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) { router.push('/login'); return }
    if (!user.profile) return
    if (!canAccess) router.push('/minha-conta')
  }, [loading, profileLoading, user, canAccess, router])

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['operacao', 'events'],
    queryFn: () => operacaoService.listEvents(),
    enabled: canAccess,
    staleTime: 5 * 60 * 1000,
  })

  const [eventId, setEventId] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Selected | null>(null)
  const event = events.find((e) => e.id === eventId)

  const digits = search.replace(/\D/g, '')
  const [debouncedDigits, setDebouncedDigits] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDigits(digits), 350)
    return () => clearTimeout(timer)
  }, [digits])
  const searching = debouncedDigits.length >= 11

  const worklist = useQuery({
    queryKey: ['operacao', 'event', eventId, 'worklist'],
    queryFn: () => operacaoService.lookup(eventId, ''),
    enabled: canAccess && !!eventId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const searchResult = useQuery({
    queryKey: ['operacao', 'event', eventId, 'search', debouncedDigits],
    queryFn: () => operacaoService.lookup(eventId, debouncedDigits),
    enabled: canAccess && !!eventId && searching,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const onChanged = () => queryClient.invalidateQueries({ queryKey: ['operacao', 'event', eventId] })

  const canDeliver = !!event && (isAdmin || hasPermission(DELIVER_KITS_PERMISSION, event.id))
  const canCash = !!event && (isAdmin || hasPermission(CONFIRM_CASH_PERMISSION, event.id))

  const active = searching ? searchResult.data : worklist.data
  const kitItems = useMemo(() => active?.kitItems ?? event?.kitItems ?? [], [active, event])

  const items = useMemo(() => {
    if (!active) return []
    const inscricoes = active.inscriptions.map((i) => ({
      kind: 'inscription' as const,
      item: i,
      nome: i.nome,
      status: kitStatus(i.status, i.preferredPaymentMethod, i.kitDeliveries ?? [], kitItems, i.temBrinde === true),
    }))
    const lotes = active.batches.map((b) => ({
      kind: 'batch' as const,
      item: b,
      nome: b.responsavelNome,
      status: kitStatus(b.status, b.preferredPaymentMethod, b.kitDeliveries ?? [], kitItems, b.participantes.some((p) => p.temBrinde)),
    }))
    return [...inscricoes, ...lotes].sort(
      (a, b) => PRIORITY[a.status.kind] - PRIORITY[b.status.kind] || a.nome.localeCompare(b.nome),
    )
  }, [active, kitItems])

  if (loading || profileLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center p-6"><p className="text-text-secondary">Carregando...</p></div>
  }
  if (!canAccess) return null

  const counts = worklist.data?.counts
  const isLoading = searching ? searchResult.isLoading : worklist.isLoading

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gold">Operação do Evento</h1>
        <a
          href="/minha-conta/operacao/relatorios"
          className="text-sm text-gold border border-gold/30 hover:border-gold/60 hover:bg-gold/5 rounded-lg px-3 py-1.5 transition-colors no-underline whitespace-nowrap"
        >
          📄 Relatórios
        </a>
      </div>

      <EventSelect events={events} value={eventId} loading={eventsLoading} onChange={(id) => { setEventId(id); setSearch('') }} />

      {eventId && (
        <>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por CPF (11 dígitos)"
              inputMode="numeric"
              className="w-full bg-bg-secondary border border-gold/20 rounded-xl pl-11 pr-4 py-3.5 text-text-primary placeholder:text-text-muted focus:border-gold/60 focus:ring-2 focus:ring-gold/20 outline-none transition-colors"
            />
          </div>

          {!searching && counts && (
            <div className="flex flex-wrap gap-2 text-sm">
              {canCash && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  🟠 {counts.cashPending} aguardando dinheiro
                </span>
              )}
              {canDeliver && kitItems.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-200 border border-yellow-500/30">
                  🟡 {counts.kitPending} aguardando kit
                </span>
              )}
            </div>
          )}

          {search.length > 0 && !searching && (
            <p className="text-text-muted text-xs">Digite os 11 dígitos do CPF para buscar.</p>
          )}

          {isLoading && <p className="text-text-secondary text-sm">Carregando...</p>}

          {!isLoading && event && active && (
            <div className="space-y-3">
              {items.length === 0
                ? <p className="text-text-secondary text-sm">{searching ? 'Nenhuma inscrição encontrada para esse CPF.' : 'Nada pendente. 🎉'}</p>
                : items.map((row) => (
                    <SummaryRow
                      key={`${row.kind}-${row.item.id}`}
                      kind={row.kind}
                      nome={row.kind === 'inscription' ? `${row.item.nome}${row.item.temBrinde ? ' 🎁' : ''}` : row.item.responsavelNome}
                      sub={row.kind === 'inscription'
                        ? row.item.categoryNome
                        : `${row.item.totalParticipantes} participantes · 🎁 ${row.item.participantes.filter((p) => p.temBrinde).length}`}
                      status={row.status}
                      onClick={() => setSelected(row)}
                    />
                  ))}

              {!searching && worklist.data?.kitPendingCapped && (
                <p className="text-text-muted text-xs">Mostrando os primeiros itens aguardando kit. Busque por CPF para localizar os demais.</p>
              )}
            </div>
          )}
        </>
      )}

      {selected && event && (
        <OpsDetailModal
          selected={selected}
          event={event}
          kitItems={kitItems}
          canDeliver={canDeliver}
          canCash={canCash}
          onChanged={onChanged}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function SummaryRow({ kind, nome, sub, status, onClick }: {
  kind: 'inscription' | 'batch'
  nome: string
  sub: string
  status: RowStatus
  onClick: () => void
}) {
  const isInscription = kind === 'inscription'
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-bg-secondary border border-gold/10 border-l-4 rounded-xl p-4 hover:border-gold/30 transition-colors ${isInscription ? 'border-l-sky-500/70' : 'border-l-violet-500/70'}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded border ${isInscription ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-violet-500/15 text-violet-300 border-violet-500/30'}`}>
          {isInscription ? 'Individual' : 'Coletiva'}
        </span>
        <StatusBadge status={status} />
      </div>
      <p className="text-text-primary font-medium">{nome}</p>
      <p className="text-xs text-text-muted">{sub}</p>
    </button>
  )
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-gold/5 last:border-0">
      <span className="text-text-muted text-sm shrink-0">{label}</span>
      <span className="text-text-primary text-sm text-right break-words">{value}</span>
    </div>
  )
}

function OpsDetailModal({ selected, event, kitItems, canDeliver, canCash, onChanged, onClose }: {
  selected: Selected
  event: OperableEvent
  kitItems: KitItemDef[]
  canDeliver: boolean
  canCash: boolean
  onChanged: () => void
  onClose: () => void
}) {
  const isInscription = selected.kind === 'inscription'
  const [kitDeliveries, setKitDeliveries] = useState<KitDeliveryDTO[]>(selected.item.kitDeliveries ?? [])
  const [status, setStatus] = useState<string>(selected.item.status)
  const [busy, setBusy] = useState(false)
  const changedRef = useRef(false)

  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null)
  const toastSeq = useRef(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = (msg: string) => {
    toastSeq.current += 1
    setToast({ id: toastSeq.current, msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (changedRef.current) onChanged()
      onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onChanged, onClose])

  const close = () => {
    if (changedRef.current) onChanged()
    onClose()
  }

  const method = selected.item.preferredPaymentMethod
  const temBrinde = isInscription
    ? selected.item.temBrinde === true
    : selected.item.participantes.some((p) => p.temBrinde)
  const brindeCount = isInscription
    ? (selected.item.temBrinde ? 1 : 0)
    : selected.item.participantes.filter((p) => p.temBrinde).length
  const live = kitStatus(status, method, kitDeliveries, kitItems, temBrinde)
  const isCashPending = status === 'pendente' && method === 'CASH'

  const kitEnabled = status === 'confirmado' && canDeliver
  const kitLockMsg = !canDeliver
    ? 'Você não tem permissão de entrega neste evento.'
    : 'Confirme o pagamento antes de entregar o kit.'

  const cashEnabled = isCashPending && canCash
  const cashLockMsg = !canCash
    ? 'Você não tem permissão de caixa neste evento.'
    : status === 'confirmado'
      ? 'Pagamento já confirmado.'
      : status === 'cancelado'
        ? 'Inscrição cancelada.'
        : method !== 'CASH'
          ? 'Confirmação manual é só para dinheiro em espécie — PIX e cartão são automáticos.'
          : 'Confirmação indisponível.'

  const deliverFull = async () => {
    setBusy(true)
    try {
      const res = isInscription
        ? await adminService.deliverInscriptionKit(event.id, selected.item.id)
        : await adminService.deliverBatchKit(selected.item.id)
      setKitDeliveries(res.kitDeliveries)
      changedRef.current = true
    } catch (err) { console.error(err) } finally { setBusy(false) }
  }

  const confirmCash = async () => {
    setBusy(true)
    try {
      if (isInscription) await adminService.confirmInscription(selected.item.id, event.id)
      else await adminService.confirmBatchCash(selected.item.id)
      setStatus('confirmado')
      changedRef.current = true
    } catch (err) { console.error(err) } finally { setBusy(false) }
  }

  const nome = isInscription ? selected.item.nome : selected.item.responsavelNome
  const cpf = formatCpf(isInscription ? selected.item.cpf : selected.item.responsavelCpf)

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full sm:max-w-md bg-bg-secondary border border-gold/15 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-bg-secondary/95 backdrop-blur px-5 py-4 border-b border-gold/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded border ${isInscription ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' : 'bg-violet-500/15 text-violet-300 border-violet-500/30'}`}>
              {isInscription ? 'Individual' : 'Coletiva'}
            </span>
            <StatusBadge status={live} />
          </div>
          <button onClick={close} aria-label="Fechar" className="text-text-muted hover:text-text-primary p-1">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <h2 className="text-lg font-bold text-text-primary">{nome} {temBrinde ? '🎁' : ''}</h2>

          <div className="bg-bg-primary/40 rounded-xl px-4 py-1">
            <DataRow label="CPF" value={cpf} />
            {isInscription ? (
              <>
                <DataRow label="Telefone" value={selected.item.telefone} />
                <DataRow label="E-mail" value={selected.item.email} />
                <DataRow label="Sexo" value={selected.item.sexo ? GENDER_LABELS[selected.item.sexo] : undefined} />
                <DataRow label="Cidade" value={selected.item.cidade} />
                <DataRow label="Categoria" value={selected.item.categoryNome} />
                <DataRow label="Valor" value={selected.item.valorFormatado} />
                <DataRow label="Tamanho da camiseta" value={selected.item.tamanho} />
                <DataRow label="Brinde" value={selected.item.temBrinde ? 'Sim (pulseira LED)' : 'Não'} />
              </>
            ) : (
              <>
                <DataRow label="Participantes" value={String(selected.item.totalParticipantes)} />
                <DataRow label="Brindes" value={String(brindeCount)} />
              </>
            )}
            <DataRow label="Pagamento" value={PAYMENT_LABEL[method] ?? method} />
            <DataRow label="Confirmado por" value={selected.item.confirmadoPorNome} />
          </div>

          {!isInscription && (
            <div>
              <p className="text-sm text-gold font-medium mb-2">Participantes</p>
              <ul className="space-y-1.5">
                {selected.item.participantes.map((p, idx) => (
                  <li key={idx} className="text-sm flex items-center justify-between gap-3">
                    <span className="text-text-primary min-w-0 truncate">
                      <span className="text-text-muted">{idx + 1}.</span> {p.nome} {p.temBrinde ? '🎁' : ''}
                    </span>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {GENDER_LABELS[p.sexo]}{p.tamanho ? ` · ${p.tamanho}` : ' · sem tam.'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {kitItems.length > 0 ? (
            <div className="relative">
              <div className={kitEnabled ? '' : 'opacity-50 pointer-events-none select-none'}>
                <KitDeliveryList
                  items={kitItems}
                  deliveries={kitDeliveries}
                  elegivelLed={temBrinde}
                  quantidadePorItem={isInscription ? undefined : selected.item.totalParticipantes}
                  ledQuantidade={isInscription ? undefined : brindeCount}
                  busy={busy}
                  onDeliverFull={deliverFull}
                />
              </div>
              {!kitEnabled && (
                <button
                  type="button"
                  onClick={() => showToast(kitLockMsg)}
                  aria-label="Entrega de kit indisponível"
                  className="absolute inset-0 cursor-not-allowed"
                />
              )}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center">Nenhum item de kit configurado para este evento. Configure o kit em Admin → Evento → Kit.</p>
          )}

          <button
            type="button"
            onClick={() => (cashEnabled ? confirmCash() : showToast(cashLockMsg))}
            disabled={busy && cashEnabled}
            aria-disabled={!cashEnabled}
            className={`w-full py-3 font-bold rounded-xl transition-colors ${cashEnabled ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-bg-tertiary text-text-muted cursor-not-allowed'} ${busy ? 'opacity-60' : ''}`}
          >
            {busy && cashEnabled ? 'Confirmando...' : '✓ Confirmar pagamento em dinheiro'}
          </button>
        </div>
      </div>
    </div>

    {toast && (
      <div className="fixed inset-x-0 top-6 z-[60] flex justify-center px-4 pointer-events-none">
        <div key={toast.id} className="animate-dropdown pointer-events-auto flex items-center gap-2.5 max-w-sm bg-bg-tertiary border border-amber-500/30 text-text-primary text-sm px-4 py-3 rounded-xl shadow-2xl shadow-black/40">
          <svg className="w-5 h-5 shrink-0 text-amber-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 7v4" />
            <circle cx="10" cy="14" r="0.5" fill="currentColor" />
          </svg>
          <span>{toast.msg}</span>
        </div>
      </div>
    )}
    </>
  )
}
