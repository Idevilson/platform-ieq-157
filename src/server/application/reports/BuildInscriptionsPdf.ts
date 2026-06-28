import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, PageSizes, RGB, degrees } from 'pdf-lib'
import { EventDTO, EventCategoryDTO } from '@/shared/types/event'
import { InscriptionDTO, BatchInscriptionDTO } from '@/shared/types/inscription'
import { InscriptionPaymentMethod, SHIRT_SIZES, ShirtSize } from '@/shared/constants'
import {
  NormalizedCity,
  compareNormalizedCity,
  normalizeCity,
} from '@/shared/utils/cityNormalizer'
import { formatCPF, formatPhone } from '@/lib/formatters'

const A4 = PageSizes.A4
const MARGIN_X = 40
const MARGIN_TOP = 40
const MARGIN_BOTTOM = 32
const USABLE_WIDTH = A4[0] - MARGIN_X * 2

const TIER_BAR_WIDTH = 16
const TIER_BANNER_HEIGHT = 18

const COL_NAME = 162
const COL_CONTACT = 150
const COL_DATE = 58
const COL_PAY = 38
const COL_STATUS = 54
const COL_SIZE = 22

const COL_X = {
  name: MARGIN_X + TIER_BAR_WIDTH,
  contact: MARGIN_X + TIER_BAR_WIDTH + COL_NAME,
  date: MARGIN_X + TIER_BAR_WIDTH + COL_NAME + COL_CONTACT,
  pay: MARGIN_X + TIER_BAR_WIDTH + COL_NAME + COL_CONTACT + COL_DATE,
  status: MARGIN_X + TIER_BAR_WIDTH + COL_NAME + COL_CONTACT + COL_DATE + COL_PAY,
  size: MARGIN_X + TIER_BAR_WIDTH + COL_NAME + COL_CONTACT + COL_DATE + COL_PAY + COL_STATUS,
  perk: MARGIN_X + TIER_BAR_WIDTH + COL_NAME + COL_CONTACT + COL_DATE + COL_PAY + COL_STATUS + COL_SIZE,
}

const ROW_HEIGHT = 14
const SECTION_HEADER_HEIGHT = 22
const TABLE_HEADER_HEIGHT = 16

const COLOR_TEXT = rgb(0.13, 0.13, 0.15)
const COLOR_MUTED = rgb(0.45, 0.45, 0.5)
const COLOR_GOLD = rgb(0.7, 0.55, 0.15)
const COLOR_SECTION_BG = rgb(0.96, 0.94, 0.88)
const COLOR_HEADER_BG = rgb(0.93, 0.93, 0.93)
const COLOR_DIVIDER = rgb(0.85, 0.85, 0.85)
const COLOR_CONFIRMADO = rgb(0.15, 0.6, 0.25)
const COLOR_PENDENTE = rgb(0.85, 0.6, 0.1)
const COLOR_PENDENTE_BG = rgb(1, 0.95, 0.82)
const COLOR_CANCELADO = rgb(0.75, 0.2, 0.2)
const COLOR_SIMPLES = rgb(0.22, 0.6, 0.86)
const COLOR_PREMIUM = rgb(0.92, 0.7, 0.05)
const COLOR_SIMPLES_BG = rgb(0.91, 0.96, 1)
const COLOR_PREMIUM_BG = rgb(1, 0.97, 0.85)

type CategoryTier = 'Simples' | 'Premium' | null

interface PersonRow {
  source: 'avulsa' | 'lote'
  nome: string
  cpfFormatado: string
  telefoneFormatado: string
  confirmadoEm?: string
  criadoEm?: string
  pagamentoCurto: string
  status: 'confirmado' | 'pendente' | 'cancelado'
  statusLabel: string
  tamanho?: string
  brinde: boolean
  categoryId: string
  tier: CategoryTier
}

interface CityGroup {
  city: NormalizedCity
  rows: PersonRow[]
}

export interface ReportAccountProfile {
  nome?: string
  cpf?: string
  telefone?: string
  cidade?: string
}

interface ShirtSummary {
  bySize: Record<ShirtSize, number>
  semTamanho: number
  outros: number
  total: number
}

interface WithheldSummary {
  avulsas: number
  lotePeople: number
  total: number
}

export type ReportMode = 'confirmado' | 'pendente'

interface ReportConfig {
  mode: ReportMode
  badge: string | null
  dateLabel: string
  shirtLabel: string
  noticeReason: string
}

function reportConfigFor(mode: ReportMode): ReportConfig {
  if (mode === 'pendente') {
    return {
      mode,
      badge: 'Inscrições pendentes · pagamento não confirmado',
      dateLabel: 'Inscrito em',
      shirtLabel: 'pendentes',
      noticeReason: 'Motivo: pagamento já confirmado',
    }
  }
  return {
    mode,
    badge: null,
    dateLabel: 'Pago em',
    shirtLabel: 'confirmadas',
    noticeReason: 'Motivo: pagamento não confirmado (pendente)',
  }
}

export class InscriptionsPdfReport {
  private _inscriptions: InscriptionDTO[] = []
  private _batches: BatchInscriptionDTO[] = []
  private _accountProfiles = new Map<string, ReportAccountProfile>()
  private _mode: ReportMode = 'confirmado'

  private constructor(private readonly _event: EventDTO) {}

  static for(event: EventDTO): InscriptionsPdfReport {
    return new InscriptionsPdfReport(event)
  }

  withInscriptions(inscriptions: InscriptionDTO[]): this {
    this._inscriptions = inscriptions
    return this
  }

  withMode(mode: ReportMode): this {
    this._mode = mode
    return this
  }

  // Inscrições de conta logada não têm guestData; o nome/contato vive na coleção users
  withAccountProfiles(profiles: Map<string, ReportAccountProfile>): this {
    this._accountProfiles = profiles
    return this
  }

  withBatches(batches: BatchInscriptionDTO[]): this {
    this._batches = batches
    return this
  }

  async build(): Promise<Uint8Array> {
    const tierByCategory = buildTierMap(this._event.categorias)
    const avulsasGroups = this.groupAvulsasByCity(tierByCategory)
    const lotesGroups = this.groupLotesByCity(tierByCategory)
    const shirts = this.computeShirtSummary()
    const tierCounts = this.countTiers(tierByCategory)
    const withheld = this.computeWithheld()
    return renderPdf({
      config: reportConfigFor(this._mode),
      event: this._event,
      avulsasGroups,
      lotesGroups,
      shirts,
      tierCounts,
      tierByCategory,
      withheld,
    })
  }

  private isListed(status: string): boolean {
    return this._mode === 'pendente' ? status === 'pendente' : status !== 'pendente'
  }

  private get primaryStatus(): 'confirmado' | 'pendente' {
    return this._mode
  }

  private get noticeStatus(): 'confirmado' | 'pendente' {
    return this._mode === 'pendente' ? 'confirmado' : 'pendente'
  }

  // Inscrições do status oposto ficam fora da listagem; o total é anunciado no topo
  private computeWithheld(): WithheldSummary {
    const target = this.noticeStatus
    let avulsas = 0
    for (const i of this._inscriptions) {
      if (i.status === target) avulsas += 1
    }
    let lotePeople = 0
    for (const b of this._batches) {
      if (b.status === target) lotePeople += b.totalParticipantes
    }
    return { avulsas, lotePeople, total: avulsas + lotePeople }
  }

  private countTiers(tierByCategory: Map<string, CategoryTier>): { simples: number; premium: number } {
    let simples = 0
    let premium = 0
    const bump = (categoryId: string, n: number) => {
      const tier = tierByCategory.get(categoryId)
      if (tier === 'Simples') simples += n
      else if (tier === 'Premium') premium += n
    }
    for (const i of this._inscriptions) {
      if (!this.isListed(i.status)) continue
      bump(i.categoryId, 1)
    }
    for (const b of this._batches) {
      if (!this.isListed(b.status)) continue
      bump(b.categoryId, b.totalParticipantes)
    }
    return { simples, premium }
  }

  private computeShirtSummary(): ShirtSummary {
    const bySize: Record<ShirtSize, number> = { PP: 0, P: 0, M: 0, G: 0, GG: 0, XGG: 0 }
    let semTamanho = 0
    let outros = 0
    let total = 0

    const tally = (tamanho: string | undefined) => {
      total += 1
      if (!tamanho) { semTamanho += 1; return }
      const upper = tamanho.toUpperCase().trim() as ShirtSize
      if (SHIRT_SIZES.includes(upper)) bySize[upper] += 1
      else outros += 1
    }

    const primary = this.primaryStatus
    for (const i of this._inscriptions) {
      if (i.status === primary) tally(i.tamanho)
    }
    for (const b of this._batches) {
      if (b.status !== primary) continue
      for (const p of b.participantes) tally(p.tamanho)
    }

    return { bySize, semTamanho, outros, total }
  }

  private groupAvulsasByCity(tierByCategory: Map<string, CategoryTier>): CityGroup[] {
    const buckets = new Map<string, CityGroup>()
    for (const i of this._inscriptions) {
      if (!this.isListed(i.status)) continue
      const profile = i.guestData ? undefined : this._accountProfiles.get(i.userId ?? '')
      const city = normalizeCity(i.guestData?.cidade ?? profile?.cidade)
      upsertCityGroup(buckets, city).rows.push(
        toAvulsaRow(i, tierByCategory.get(i.categoryId) ?? null, profile),
      )
    }
    return finalizeGroups(buckets)
  }

  private groupLotesByCity(tierByCategory: Map<string, CategoryTier>): CityGroup[] {
    const buckets = new Map<string, CityGroup>()
    for (const b of this._batches) {
      if (!this.isListed(b.status)) continue
      const city = normalizeCity(b.cidade ?? b.responsavel?.cidade)
      const group = upsertCityGroup(buckets, city)
      const tier = tierByCategory.get(b.categoryId) ?? null
      for (const p of b.participantes) {
        group.rows.push(toLoteRow(b, p.nome, p.tamanho, !!p.temBrinde, tier))
      }
    }
    return finalizeGroups(buckets)
  }
}

function upsertCityGroup(buckets: Map<string, CityGroup>, city: NormalizedCity): CityGroup {
  const key = `${city.bucket}::${city.canonical}`
  const existing = buckets.get(key)
  if (existing) return existing
  const fresh: CityGroup = { city, rows: [] }
  buckets.set(key, fresh)
  return fresh
}

function finalizeGroups(buckets: Map<string, CityGroup>): CityGroup[] {
  const sorted = [...buckets.values()].sort((a, b) => compareNormalizedCity(a.city, b.city))
  for (const g of sorted) {
    g.rows.sort(compareByPaymentDate)
  }
  return sorted
}

function buildTierMap(categorias: EventCategoryDTO[]): Map<string, CategoryTier> {
  const sorted = [...categorias].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  const map = new Map<string, CategoryTier>()
  sorted.forEach((cat, idx) => {
    if (idx === 0) map.set(cat.id, 'Simples')
    else if (idx === 1) map.set(cat.id, 'Premium')
    else map.set(cat.id, 'Premium')
  })
  return map
}

function toAvulsaRow(i: InscriptionDTO, tier: CategoryTier, profile?: ReportAccountProfile): PersonRow {
  const cpfRaw = i.guestData?.cpf ?? profile?.cpf
  const telefoneRaw = i.guestData?.telefone ?? profile?.telefone
  return {
    source: 'avulsa',
    nome: i.guestData?.nome?.trim() || profile?.nome?.trim() || '—',
    cpfFormatado: cpfRaw ? safeFormatCpf(cpfRaw) : '—',
    telefoneFormatado: telefoneRaw ? safeFormatPhone(telefoneRaw) : '—',
    confirmadoEm: paymentDateForConfirmed(i.status, i.confirmadoEm, i.atualizadoEm),
    criadoEm: toIsoString(i.criadoEm),
    pagamentoCurto: shortPayment(i.preferredPaymentMethod),
    status: i.status as PersonRow['status'],
    statusLabel: i.statusLabel ?? i.status,
    tamanho: i.tamanho,
    brinde: i.temBrinde === true,
    categoryId: i.categoryId,
    tier,
  }
}

function toLoteRow(
  b: BatchInscriptionDTO,
  nome: string,
  tamanho: string | undefined,
  brinde: boolean,
  tier: CategoryTier,
): PersonRow {
  return {
    source: 'lote',
    nome: nome?.trim() || '—',
    cpfFormatado: b.responsavel?.cpf ? safeFormatCpf(b.responsavel.cpf) : '—',
    telefoneFormatado: b.responsavel?.telefone ? safeFormatPhone(b.responsavel.telefone) : '—',
    confirmadoEm: paymentDateForConfirmed(b.status, b.confirmadoEm, b.atualizadoEm),
    criadoEm: b.criadoEm,
    pagamentoCurto: shortPayment(b.preferredPaymentMethod),
    status: b.status,
    statusLabel: b.status === 'confirmado' ? 'Confirmado' : b.status === 'pendente' ? 'Pendente' : 'Cancelado',
    tamanho,
    brinde,
    categoryId: b.categoryId,
    tier,
  }
}

function paymentDateForConfirmed(
  status: string,
  confirmadoEm: string | Date | undefined,
  atualizadoEm: string | Date | undefined,
): string | undefined {
  if (status !== 'confirmado') return undefined
  return toIsoString(confirmadoEm) ?? toIsoString(atualizadoEm)
}

function toIsoString(value: string | Date | undefined): string | undefined {
  if (!value) return undefined
  return value instanceof Date ? value.toISOString() : value
}

function compareByPaymentDate(a: PersonRow, b: PersonRow): number {
  const FAR_FUTURE = Number.MAX_SAFE_INTEGER
  const ka = a.confirmadoEm ? new Date(a.confirmadoEm).getTime() : FAR_FUTURE
  const kb = b.confirmadoEm ? new Date(b.confirmadoEm).getTime() : FAR_FUTURE
  if (ka !== kb) return ka - kb
  const ca = a.criadoEm ? new Date(a.criadoEm).getTime() : FAR_FUTURE
  const cb = b.criadoEm ? new Date(b.criadoEm).getTime() : FAR_FUTURE
  return ca - cb
}

function safeFormatCpf(cpf: string): string {
  try {
    return formatCPF(cpf)
  } catch {
    return cpf
  }
}

function safeFormatPhone(phone: string): string {
  try {
    return formatPhone(phone)
  } catch {
    return phone
  }
}

function shortPayment(method: InscriptionPaymentMethod): string {
  switch (method) {
    case 'PIX':
      return 'PIX'
    case 'CREDIT_CARD':
      return 'Cartão'
    case 'CASH':
      return 'Dinheiro'
    default:
      return '—'
  }
}

function statusColor(status: PersonRow['status']): RGB {
  if (status === 'confirmado') return COLOR_CONFIRMADO
  if (status === 'pendente') return COLOR_PENDENTE
  return COLOR_CANCELADO
}

function formatBRDateTime(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function formatBRDate(iso: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso))
}

function formatDateShort(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(d)
    .replace(', ', ' ')
    .replace(/(\d{2}):(\d{2})$/, '$1h$2')
}

interface Renderer {
  doc: PDFDocument
  page: PDFPage
  cursor: number
  fontRegular: PDFFont
  fontBold: PDFFont
  config: ReportConfig
}

async function renderPdf(input: {
  config: ReportConfig
  event: EventDTO
  avulsasGroups: CityGroup[]
  lotesGroups: CityGroup[]
  shirts: ShirtSummary
  tierCounts: { simples: number; premium: number }
  tierByCategory: Map<string, CategoryTier>
  withheld: WithheldSummary
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const r: Renderer = {
    doc,
    page: doc.addPage(A4),
    cursor: A4[1] - MARGIN_TOP,
    fontRegular,
    fontBold,
    config: input.config,
  }

  const totalAvulsas = input.avulsasGroups.reduce((sum, g) => sum + g.rows.length, 0)
  const totalLotes = input.lotesGroups.reduce((sum, g) => sum + g.rows.length, 0)

  drawHeader(r, input.event, totalAvulsas, totalLotes, input.tierCounts, input.tierByCategory)
  drawWithheldNotice(r, input.withheld)
  drawShirtSummary(r, input.shirts)

  if (input.avulsasGroups.length > 0) {
    drawTopLevelSection(r, 'INSCRIÇÕES AVULSAS', totalAvulsas)
    for (const group of input.avulsasGroups) {
      drawCitySection(r, group, input.event, input.tierByCategory)
    }
  }

  if (input.lotesGroups.length > 0) {
    drawTopLevelSection(r, 'INSCRIÇÕES COLETIVAS', totalLotes)
    for (const group of input.lotesGroups) {
      drawCitySection(r, group, input.event, input.tierByCategory)
    }
  }

  drawPageNumbers(r)

  return doc.save()
}

const TOP_LEVEL_HEADER_HEIGHT = 26

function drawTopLevelSection(r: Renderer, title: string, count: number): void {
  ensureSpace(r, TOP_LEVEL_HEADER_HEIGHT + SECTION_HEADER_HEIGHT + TABLE_HEADER_HEIGHT)
  r.page.drawRectangle({
    x: MARGIN_X,
    y: r.cursor - TOP_LEVEL_HEADER_HEIGHT,
    width: USABLE_WIDTH,
    height: TOP_LEVEL_HEADER_HEIGHT,
    color: COLOR_GOLD,
  })
  drawTextAt(r, title, {
    x: MARGIN_X + 10,
    y: r.cursor - 17,
    size: 12,
    font: r.fontBold,
    color: rgb(1, 1, 1),
  })
  const countText = `${count} pessoa${count === 1 ? '' : 's'}`
  const countWidth = r.fontRegular.widthOfTextAtSize(countText, 10)
  drawTextAt(r, countText, {
    x: MARGIN_X + USABLE_WIDTH - 10 - countWidth,
    y: r.cursor - 17,
    size: 10,
    font: r.fontRegular,
    color: rgb(1, 1, 1),
  })
  r.cursor -= TOP_LEVEL_HEADER_HEIGHT + 4
}

function drawHeader(
  r: Renderer,
  event: EventDTO,
  totalAvulsas: number,
  totalLotes: number,
  tierCounts: { simples: number; premium: number },
  tierByCategory: Map<string, CategoryTier>,
): void {
  drawTextAt(r, event.titulo, {
    x: MARGIN_X,
    y: r.cursor - 14,
    size: 16,
    font: r.fontBold,
    color: COLOR_TEXT,
  })
  r.cursor -= 22

  const subtitle = `${formatBRDate(event.dataInicio)} · ${event.local}`
  drawTextAt(r, subtitle, {
    x: MARGIN_X,
    y: r.cursor - 10,
    size: 9,
    font: r.fontRegular,
    color: COLOR_MUTED,
  })
  r.cursor -= 14

  if (r.config.badge) {
    drawTextAt(r, r.config.badge, {
      x: MARGIN_X,
      y: r.cursor - 10,
      size: 9,
      font: r.fontBold,
      color: COLOR_PENDENTE,
    })
    r.cursor -= 14
  }

  const total = totalAvulsas + totalLotes
  const summary = `${total} pessoa${total === 1 ? '' : 's'} · ${totalAvulsas} avulsa${
    totalAvulsas === 1 ? '' : 's'
  } · ${totalLotes} em lotes coletivos`
  drawTextAt(r, summary, {
    x: MARGIN_X,
    y: r.cursor - 10,
    size: 9,
    font: r.fontRegular,
    color: COLOR_TEXT,
  })
  r.cursor -= 14

  const hasTiers = tierCounts.simples > 0 || tierCounts.premium > 0
  if (hasTiers) {
    drawTierLegend(r, event, tierCounts, tierByCategory)
  }

  const generated = `Gerado em ${formatBRDateTime(new Date())}`
  drawTextAt(r, generated, {
    x: MARGIN_X,
    y: r.cursor - 9,
    size: 8,
    font: r.fontRegular,
    color: COLOR_MUTED,
  })
  r.cursor -= 18
}

function drawTierLegend(
  r: Renderer,
  event: EventDTO,
  tierCounts: { simples: number; premium: number },
  tierByCategory: Map<string, CategoryTier>,
): void {
  const y = r.cursor - 10
  const sorted = [...event.categorias].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  let x = MARGIN_X

  const drawChip = (color: RGB, label: string, count: number, catName: string | undefined) => {
    r.page.drawRectangle({ x, y: y - 1, width: 8, height: 8, color })
    x += 12
    const text = catName ? `${label} (${catName}): ${count}` : `${label}: ${count}`
    drawTextAt(r, text, { x, y, size: 9, font: r.fontBold, color: COLOR_TEXT })
    x += r.fontBold.widthOfTextAtSize(text, 9) + 14
  }

  const simplesCat = sorted.find((c) => tierByCategory.get(c.id) === 'Simples')
  const premiumCat = sorted.find((c) => tierByCategory.get(c.id) === 'Premium')

  drawChip(COLOR_SIMPLES, 'Simples', tierCounts.simples, simplesCat?.nome)
  drawChip(COLOR_PREMIUM, 'Premium', tierCounts.premium, premiumCat?.nome)

  r.cursor -= 14
}

function drawWithheldNotice(r: Renderer, withheld: WithheldSummary): void {
  if (withheld.total <= 0) return

  const BOX_HEIGHT = 32
  const BOX_PADDING_X = 10
  const BAR_WIDTH = 4

  r.page.drawRectangle({
    x: MARGIN_X,
    y: r.cursor - BOX_HEIGHT,
    width: USABLE_WIDTH,
    height: BOX_HEIGHT,
    color: COLOR_PENDENTE_BG,
  })
  r.page.drawRectangle({
    x: MARGIN_X,
    y: r.cursor - BOX_HEIGHT,
    width: BAR_WIDTH,
    height: BOX_HEIGHT,
    color: COLOR_PENDENTE,
  })

  const plural = withheld.total === 1 ? 'inscrição não exibida' : 'inscrições não exibidas'
  const title = `${withheld.total} ${plural} neste relatório`
  drawTextAt(r, title, {
    x: MARGIN_X + BAR_WIDTH + BOX_PADDING_X,
    y: r.cursor - 13,
    size: 10,
    font: r.fontBold,
    color: COLOR_TEXT,
  })

  const parts: string[] = []
  if (withheld.avulsas > 0) parts.push(`${withheld.avulsas} avulsa${withheld.avulsas === 1 ? '' : 's'}`)
  if (withheld.lotePeople > 0) parts.push(`${withheld.lotePeople} em lote${withheld.lotePeople === 1 ? '' : 's'} coletivo${withheld.lotePeople === 1 ? '' : 's'}`)
  const breakdown = parts.length > 0 ? ` (${parts.join(' · ')})` : ''
  const reason = `${r.config.noticeReason}${breakdown}`
  drawTextClipped(r, reason, {
    x: MARGIN_X + BAR_WIDTH + BOX_PADDING_X,
    y: r.cursor - 25,
    width: USABLE_WIDTH - BAR_WIDTH - BOX_PADDING_X * 2,
    size: 8.5,
    font: r.fontRegular,
    color: COLOR_PENDENTE,
  })

  r.cursor -= BOX_HEIGHT + 8
}

function drawShirtSummary(r: Renderer, shirts: ShirtSummary): void {
  const BOX_HEIGHT = 38
  const BOX_PADDING_X = 10

  r.page.drawRectangle({
    x: MARGIN_X,
    y: r.cursor - BOX_HEIGHT,
    width: USABLE_WIDTH,
    height: BOX_HEIGHT,
    color: COLOR_SECTION_BG,
    borderColor: COLOR_GOLD,
    borderWidth: 0.5,
  })

  const title = `Camisetas das inscrições ${r.config.shirtLabel} · ${shirts.total} total`
  drawTextAt(r, title, {
    x: MARGIN_X + BOX_PADDING_X,
    y: r.cursor - 14,
    size: 10,
    font: r.fontBold,
    color: COLOR_GOLD,
  })

  const entries: Array<[string, number]> = SHIRT_SIZES.map((size) => [size, shirts.bySize[size]])
  if (shirts.outros > 0) entries.push(['Outros', shirts.outros])
  if (shirts.semTamanho > 0) entries.push(['Sem tam.', shirts.semTamanho])

  let x = MARGIN_X + BOX_PADDING_X
  const y = r.cursor - 30
  const SEP = '  ·  '
  entries.forEach(([label, count], idx) => {
    if (idx > 0) {
      drawTextAt(r, SEP, { x, y, size: 9, font: r.fontRegular, color: COLOR_MUTED })
      x += r.fontRegular.widthOfTextAtSize(SEP, 9)
    }
    const labelText = `${label}:`
    drawTextAt(r, labelText, { x, y, size: 9, font: r.fontBold, color: COLOR_TEXT })
    x += r.fontBold.widthOfTextAtSize(labelText, 9) + 3
    const countText = String(count)
    drawTextAt(r, countText, { x, y, size: 9, font: r.fontRegular, color: count === 0 ? COLOR_MUTED : COLOR_TEXT })
    x += r.fontRegular.widthOfTextAtSize(countText, 9)
  })

  r.cursor -= BOX_HEIGHT + 8
}

function drawCitySection(r: Renderer, group: CityGroup, event: EventDTO, tierByCategory: Map<string, CategoryTier>): void {
  ensureSpace(r, SECTION_HEADER_HEIGHT + TABLE_HEADER_HEIGHT + ROW_HEIGHT)
  drawSectionHeader(r, group.city, group.rows.length)
  drawTableHeader(r)

  const subgroups = splitByTier(group.rows)
  for (const sub of subgroups) {
    const descricao = sub.tier
      ? findCategoryDescription(event, tierByCategory, sub.tier)
      : undefined
    drawTierSubsection(r, group.city, sub.tier, sub.rows, descricao)
  }

  r.cursor -= 6
}

interface TierSubgroup {
  tier: CategoryTier
  rows: PersonRow[]
}

function splitByTier(rows: PersonRow[]): TierSubgroup[] {
  const order: CategoryTier[] = ['Simples', 'Premium', null]
  return order
    .map((tier) => ({ tier, rows: rows.filter((r) => r.tier === tier) }))
    .filter((g) => g.rows.length > 0)
}

function findCategoryDescription(
  event: EventDTO,
  tierByCategory: Map<string, CategoryTier>,
  tier: CategoryTier,
): string | undefined {
  if (!tier) return undefined
  const cat = event.categorias.find((c) => tierByCategory.get(c.id) === tier)
  return cat?.descricao
}

function drawTierSubsection(
  r: Renderer,
  city: NormalizedCity,
  tier: CategoryTier,
  rows: PersonRow[],
  descricao: string | undefined,
): void {
  if (rows.length === 0) return

  let remaining = rows
  let isFirstChunk = true

  while (remaining.length > 0) {
    const needed = (isFirstChunk && tier ? TIER_BANNER_HEIGHT : 0) + ROW_HEIGHT
    ensureSpace(r, needed, () => {
      drawSectionHeaderContinuation(r, city)
      drawTableHeader(r)
    })

    if (isFirstChunk && tier) {
      drawTierBanner(r, tier, descricao)
    }
    isFirstChunk = false

    const chunkTop = r.cursor
    const available = r.cursor - MARGIN_BOTTOM
    const maxRows = Math.max(1, Math.floor(available / ROW_HEIGHT))
    const chunkSize = Math.min(maxRows, remaining.length)

    for (let i = 0; i < chunkSize; i++) {
      drawDataRow(r, remaining[i])
    }

    drawTierBar(r, tier, chunkTop, r.cursor)

    remaining = remaining.slice(chunkSize)
  }
}

function drawTierBar(r: Renderer, tier: CategoryTier, top: number, bottom: number): void {
  if (!tier) return
  const height = top - bottom
  if (height <= 0) return
  const color = tier === 'Simples' ? COLOR_SIMPLES : COLOR_PREMIUM
  r.page.drawRectangle({
    x: MARGIN_X,
    y: bottom,
    width: TIER_BAR_WIDTH,
    height,
    color,
  })
  const label = tier.toUpperCase()
  const labelSize = 9
  const labelWidth = r.fontBold.widthOfTextAtSize(label, labelSize)
  if (height >= labelWidth + 12) {
    const textX = MARGIN_X + TIER_BAR_WIDTH / 2 + labelSize / 2 - 1
    const textY = bottom + (height - labelWidth) / 2
    r.page.drawText(label, {
      x: textX,
      y: textY,
      size: labelSize,
      font: r.fontBold,
      color: rgb(1, 1, 1),
      rotate: degrees(90),
    })
  }
}

function drawTierBanner(r: Renderer, tier: CategoryTier, descricao: string | undefined): void {
  if (!tier) return
  const bg = tier === 'Simples' ? COLOR_SIMPLES_BG : COLOR_PREMIUM_BG
  const accent = tier === 'Simples' ? COLOR_SIMPLES : COLOR_PREMIUM
  r.page.drawRectangle({
    x: MARGIN_X + TIER_BAR_WIDTH,
    y: r.cursor - TIER_BANNER_HEIGHT,
    width: USABLE_WIDTH - TIER_BAR_WIDTH,
    height: TIER_BANNER_HEIGHT,
    color: bg,
  })
  const textY = r.cursor - 12
  drawTextAt(r, tier.toUpperCase(), {
    x: MARGIN_X + TIER_BAR_WIDTH + 8,
    y: textY,
    size: 9,
    font: r.fontBold,
    color: accent,
  })
  if (descricao) {
    const labelWidth = r.fontBold.widthOfTextAtSize(tier.toUpperCase(), 9)
    drawTextClipped(r, descricao, {
      x: MARGIN_X + TIER_BAR_WIDTH + 8 + labelWidth + 8,
      y: textY,
      width: USABLE_WIDTH - TIER_BAR_WIDTH - 24 - labelWidth,
      size: 8.5,
      font: r.fontRegular,
      color: COLOR_TEXT,
    })
  }
  r.cursor -= TIER_BANNER_HEIGHT
}

function drawSectionHeader(r: Renderer, city: NormalizedCity, count: number): void {
  r.page.drawRectangle({
    x: MARGIN_X,
    y: r.cursor - SECTION_HEADER_HEIGHT,
    width: USABLE_WIDTH,
    height: SECTION_HEADER_HEIGHT,
    color: COLOR_SECTION_BG,
  })
  const label = `${city.canonical} · ${count} pessoa${count === 1 ? '' : 's'}`
  drawTextAt(r, label, {
    x: MARGIN_X + 8,
    y: r.cursor - 15,
    size: 11,
    font: r.fontBold,
    color: COLOR_GOLD,
  })
  if (city.bucket === 'Outras') {
    drawTextAt(r, '(fora da lista canônica)', {
      x: MARGIN_X + 8 + r.fontBold.widthOfTextAtSize(label, 11) + 8,
      y: r.cursor - 15,
      size: 8,
      font: r.fontRegular,
      color: COLOR_MUTED,
    })
  }
  r.cursor -= SECTION_HEADER_HEIGHT
}

function drawSectionHeaderContinuation(r: Renderer, city: NormalizedCity): void {
  r.page.drawRectangle({
    x: MARGIN_X,
    y: r.cursor - SECTION_HEADER_HEIGHT,
    width: USABLE_WIDTH,
    height: SECTION_HEADER_HEIGHT,
    color: COLOR_SECTION_BG,
  })
  drawTextAt(r, `${city.canonical} (continuação)`, {
    x: MARGIN_X + 8,
    y: r.cursor - 15,
    size: 11,
    font: r.fontBold,
    color: COLOR_GOLD,
  })
  r.cursor -= SECTION_HEADER_HEIGHT
}

function drawTableHeader(r: Renderer): void {
  r.page.drawRectangle({
    x: MARGIN_X,
    y: r.cursor - TABLE_HEADER_HEIGHT,
    width: USABLE_WIDTH,
    height: TABLE_HEADER_HEIGHT,
    color: COLOR_HEADER_BG,
  })
  const headers: Array<[number, string]> = [
    [COL_X.name + 4, 'Nome'],
    [COL_X.contact + 4, 'Contato'],
    [COL_X.date + 4, r.config.dateLabel],
    [COL_X.pay + 4, 'Pagto'],
    [COL_X.status + 4, 'Status'],
    [COL_X.size + 4, 'Tam'],
    [COL_X.perk + 2, '*'],
  ]
  for (const [x, label] of headers) {
    drawTextAt(r, label, {
      x,
      y: r.cursor - 11,
      size: 8,
      font: r.fontBold,
      color: COLOR_TEXT,
    })
  }
  r.cursor -= TABLE_HEADER_HEIGHT
}

function drawDataRow(r: Renderer, row: PersonRow): void {
  const y = r.cursor - 10

  if (row.tier) {
    const rowBg = row.tier === 'Simples' ? COLOR_SIMPLES_BG : COLOR_PREMIUM_BG
    r.page.drawRectangle({
      x: MARGIN_X + TIER_BAR_WIDTH,
      y: r.cursor - ROW_HEIGHT + 1,
      width: USABLE_WIDTH - TIER_BAR_WIDTH,
      height: ROW_HEIGHT,
      color: rowBg,
    })
  }

  r.page.drawLine({
    start: { x: MARGIN_X + TIER_BAR_WIDTH, y: r.cursor - ROW_HEIGHT + 1 },
    end: { x: MARGIN_X + USABLE_WIDTH, y: r.cursor - ROW_HEIGHT + 1 },
    thickness: 0.3,
    color: COLOR_DIVIDER,
  })

  drawTextClipped(r, row.nome, {
    x: COL_X.name + 4,
    y,
    width: COL_NAME - 8,
    size: 8.5,
    font: r.fontRegular,
    color: COLOR_TEXT,
  })

  const contact = `${row.cpfFormatado} · ${row.telefoneFormatado}`
  drawTextClipped(r, contact, {
    x: COL_X.contact + 4,
    y,
    width: COL_CONTACT - 8,
    size: 8,
    font: r.fontRegular,
    color: COLOR_MUTED,
  })

  const dateIso = r.config.mode === 'pendente' ? row.criadoEm : row.confirmadoEm
  drawTextAt(r, formatDateShort(dateIso), {
    x: COL_X.date + 4,
    y,
    size: 8,
    font: r.fontRegular,
    color: dateIso ? COLOR_TEXT : COLOR_MUTED,
  })

  drawTextAt(r, row.pagamentoCurto, {
    x: COL_X.pay + 4,
    y,
    size: 8,
    font: r.fontRegular,
    color: COLOR_TEXT,
  })

  drawTextAt(r, row.statusLabel, {
    x: COL_X.status + 4,
    y,
    size: 8,
    font: r.fontBold,
    color: statusColor(row.status),
  })

  drawTextAt(r, row.tamanho ?? '—', {
    x: COL_X.size + 4,
    y,
    size: 8,
    font: r.fontRegular,
    color: COLOR_TEXT,
  })

  drawTextAt(r, row.brinde ? '*' : '', {
    x: COL_X.perk + 2,
    y,
    size: 9,
    font: r.fontBold,
    color: COLOR_GOLD,
  })

  r.cursor -= ROW_HEIGHT
}

function ensureSpace(r: Renderer, needed: number, afterPageBreak?: () => void): void {
  if (r.cursor - needed >= MARGIN_BOTTOM) return
  r.page = r.doc.addPage(A4)
  r.cursor = A4[1] - MARGIN_TOP
  if (afterPageBreak) afterPageBreak()
}

function drawTextAt(
  r: Renderer,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; color: RGB },
): void {
  r.page.drawText(sanitize(text), {
    x: opts.x,
    y: opts.y,
    size: opts.size,
    font: opts.font,
    color: opts.color,
  })
}

function drawTextClipped(
  r: Renderer,
  text: string,
  opts: { x: number; y: number; width: number; size: number; font: PDFFont; color: RGB },
): void {
  const truncated = clipText(opts.font, sanitize(text), opts.size, opts.width)
  r.page.drawText(truncated, {
    x: opts.x,
    y: opts.y,
    size: opts.size,
    font: opts.font,
    color: opts.color,
  })
}

function clipText(font: PDFFont, text: string, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
  const ellipsis = '…'
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2)
    const candidate = text.slice(0, mid) + ellipsis
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return text.slice(0, lo) + ellipsis
}

function sanitize(text: string): string {
  return text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '*')
}

function drawPageNumbers(r: Renderer): void {
  const pages = r.doc.getPages()
  const total = pages.length
  pages.forEach((page, index) => {
    const text = `${index + 1} / ${total}`
    const width = r.fontRegular.widthOfTextAtSize(text, 8)
    page.drawText(text, {
      x: A4[0] - MARGIN_X - width,
      y: MARGIN_BOTTOM - 10,
      size: 8,
      font: r.fontRegular,
      color: COLOR_MUTED,
    })
  })
}
