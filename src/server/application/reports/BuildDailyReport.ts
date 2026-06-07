import { Event } from '@/server/domain/event/entities/Event'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'

export interface PerkSummary {
  limiteEstoque: number
  quantidadeRestante: number
}

export interface DailyReportStats {
  date: string
  eventTitle: string
  total: number
  totalAvulsas: number
  totalColetivas: number
  confirmadas: number
  pendentes: number
  receita: number
  novasHoje: number
  receitaHoje: number
  redencao: number
  fora: number
  perkAlocado?: number
  perkLimite?: number
  perkRestante?: number
}

export interface DailyReportResult {
  stats: DailyReportStats
  message: string
  skipped?: 'event-ended'
}

const BRT_TZ = 'America/Sao_Paulo'

function startOfDayBRT(d: Date): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
  return new Date(`${ymd}T00:00:00-03:00`)
}

function normalizeCity(s?: string): string {
  return (s ?? '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function isRedencao(s?: string): boolean {
  return normalizeCity(s) === 'redencao'
}

function isFora(s?: string): boolean {
  if (!s) return false
  return !isRedencao(s)
}

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatDateBR(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: BRT_TZ }).format(d)
}

function pct(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

export class DailyReport {
  private _inscriptions: Inscription[] = []
  private _batches: BatchInscription[] = []
  private _perk?: PerkSummary

  private constructor(private readonly _event: Event) {}

  static for(event: Event): DailyReport {
    return new DailyReport(event)
  }

  withInscriptions(inscriptions: Inscription[]): this {
    this._inscriptions = inscriptions
    return this
  }

  withBatches(batches: BatchInscription[]): this {
    this._batches = batches
    return this
  }

  withPerk(perk: PerkSummary | null | undefined): this {
    if (perk) this._perk = perk
    return this
  }

  build(): DailyReportResult {
    const stats = this.computeStats()
    if (this.eventEnded()) return { stats, message: '', skipped: 'event-ended' }
    return { stats, message: this.formatMessage(stats) }
  }

  private eventEnded(): boolean {
    const end = this._event.dataFim ?? this._event.dataInicio
    return startOfDayBRT(new Date()).getTime() > startOfDayBRT(end).getTime()
  }

  private computeStats(): DailyReportStats {
    const today = startOfDayBRT(new Date())

    const inscriptions = this._inscriptions
    const batches = this._batches

    const confirmedInscriptions = inscriptions.filter(i => i.status === 'confirmado')
    const pendingInscriptions = inscriptions.filter(i => i.status === 'pendente')
    const confirmedBatches = batches.filter(b => b.status === 'confirmado')
    const pendingBatches = batches.filter(b => b.status === 'pendente')

    const totalAvulsas = inscriptions.length
    const totalColetivas = batches.reduce((sum, b) => sum + b.totalParticipantes, 0)
    const confirmadas =
      confirmedInscriptions.length +
      confirmedBatches.reduce((sum, b) => sum + b.totalParticipantes, 0)
    const pendentes =
      pendingInscriptions.length +
      pendingBatches.reduce((sum, b) => sum + b.totalParticipantes, 0)
    const receita =
      confirmedInscriptions.reduce((sum, i) => sum + i.valorCents, 0) +
      confirmedBatches.reduce((sum, b) => sum + b.valorTotalCents, 0)

    const novasHoje =
      inscriptions.filter(i => i.criadoEm >= today).length +
      batches.reduce((sum, b) => (b.criadoEm >= today ? sum + b.totalParticipantes : sum), 0)

    const receitaHoje =
      confirmedInscriptions.filter(i => i.atualizadoEm >= today).reduce((sum, i) => sum + i.valorCents, 0) +
      confirmedBatches.filter(b => b.atualizadoEm >= today).reduce((sum, b) => sum + b.valorTotalCents, 0)

    const redencao =
      inscriptions.filter(i => isRedencao(i.guestData?.cidade)).length +
      batches.filter(b => isRedencao(b.cidade)).reduce((sum, b) => sum + b.totalParticipantes, 0)

    const fora =
      inscriptions.filter(i => isFora(i.guestData?.cidade)).length +
      batches.filter(b => isFora(b.cidade)).reduce((sum, b) => sum + b.totalParticipantes, 0)

    const total = totalAvulsas + totalColetivas

    return {
      date: formatDateBR(new Date()),
      eventTitle: this._event.titulo,
      total,
      totalAvulsas,
      totalColetivas,
      confirmadas,
      pendentes,
      receita,
      novasHoje,
      receitaHoje,
      redencao,
      fora,
      perkAlocado: this._perk ? this._perk.limiteEstoque - this._perk.quantidadeRestante : undefined,
      perkLimite: this._perk?.limiteEstoque,
      perkRestante: this._perk?.quantidadeRestante,
    }
  }

  private formatMessage(s: DailyReportStats): string {
    const lines: string[] = [
      `📊 *${s.eventTitle} · Resumo diário*`,
      `📅 ${s.date}`,
      '',
      '👥 *Inscrições*',
      `   • Total: ${s.total} (avulsas ${s.totalAvulsas} · coletivas ${s.totalColetivas})`,
      `   • Confirmadas: ${s.confirmadas} (${pct(s.confirmadas, s.total)}%)`,
      `   • Pendentes: ${s.pendentes} (${pct(s.pendentes, s.total)}%)`,
    ]

    if (s.novasHoje > 0) lines.push(`   • ⬆️ Hoje: +${s.novasHoje} novas`)

    lines.push('', '💰 *Receita confirmada*', `   ${formatBRL(s.receita)}`)
    if (s.receitaHoje > 0) lines.push(`   ⬆️ +${formatBRL(s.receitaHoje)} hoje`)

    if (s.redencao + s.fora > 0) {
      lines.push(
        '',
        '📍 *Origem*',
        `   • Redenção: ${s.redencao} (${pct(s.redencao, s.total)}%)`,
        `   • De fora: ${s.fora} (${pct(s.fora, s.total)}%)`,
      )
    }

    if (s.perkLimite !== undefined && s.perkRestante !== undefined) {
      lines.push(
        '',
        '🎁 *Pulseiras LED*',
        `   ${s.perkRestante} / ${s.perkLimite} restantes (${pct(s.perkAlocado ?? 0, s.perkLimite)}% alocado)`,
      )
    }

    return lines.join('\n')
  }
}
