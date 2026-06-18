import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, PageSizes, RGB } from 'pdf-lib'
import { EventDTO } from '@/shared/types/event'
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

const COL_NAME = 178
const COL_CONTACT = 150
const COL_DATE = 58
const COL_PAY = 38
const COL_STATUS = 54
const COL_SIZE = 22

const COL_X = {
  name: MARGIN_X,
  contact: MARGIN_X + COL_NAME,
  date: MARGIN_X + COL_NAME + COL_CONTACT,
  pay: MARGIN_X + COL_NAME + COL_CONTACT + COL_DATE,
  status: MARGIN_X + COL_NAME + COL_CONTACT + COL_DATE + COL_PAY,
  size: MARGIN_X + COL_NAME + COL_CONTACT + COL_DATE + COL_PAY + COL_STATUS,
  perk: MARGIN_X + COL_NAME + COL_CONTACT + COL_DATE + COL_PAY + COL_STATUS + COL_SIZE,
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
const COLOR_CANCELADO = rgb(0.75, 0.2, 0.2)

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
}

interface CityGroup {
  city: NormalizedCity
  rows: PersonRow[]
}

interface ShirtSummary {
  bySize: Record<ShirtSize, number>
  semTamanho: number
  outros: number
  total: number
}

export class InscriptionsPdfReport {
  private _inscriptions: InscriptionDTO[] = []
  private _batches: BatchInscriptionDTO[] = []

  private constructor(private readonly _event: EventDTO) {}

  static for(event: EventDTO): InscriptionsPdfReport {
    return new InscriptionsPdfReport(event)
  }

  withInscriptions(inscriptions: InscriptionDTO[]): this {
    this._inscriptions = inscriptions
    return this
  }

  withBatches(batches: BatchInscriptionDTO[]): this {
    this._batches = batches
    return this
  }

  async build(): Promise<Uint8Array> {
    const groups = this.groupByCity()
    const shirts = this.computeShirtSummary()
    return renderPdf({ event: this._event, groups, shirts })
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

    for (const i of this._inscriptions) {
      if (i.status === 'confirmado') tally(i.tamanho)
    }
    for (const b of this._batches) {
      if (b.status !== 'confirmado') continue
      for (const p of b.participantes) tally(p.tamanho)
    }

    return { bySize, semTamanho, outros, total }
  }

  private groupByCity(): CityGroup[] {
    const buckets = new Map<string, CityGroup>()

    const upsert = (city: NormalizedCity): CityGroup => {
      const key = `${city.bucket}::${city.canonical}`
      const existing = buckets.get(key)
      if (existing) return existing
      const fresh: CityGroup = { city, rows: [] }
      buckets.set(key, fresh)
      return fresh
    }

    for (const i of this._inscriptions) {
      const city = normalizeCity(i.guestData?.cidade)
      upsert(city).rows.push(toAvulsaRow(i))
    }

    for (const b of this._batches) {
      const city = normalizeCity(b.cidade ?? b.responsavel?.cidade)
      const group = upsert(city)
      for (const p of b.participantes) {
        group.rows.push(toLoteRow(b, p.nome, p.tamanho, !!p.temBrinde))
      }
    }

    const sorted = [...buckets.values()].sort((a, b) => compareNormalizedCity(a.city, b.city))
    for (const g of sorted) {
      g.rows.sort(compareByPaymentDate)
    }
    return sorted
  }
}

function toAvulsaRow(i: InscriptionDTO): PersonRow {
  return {
    source: 'avulsa',
    nome: i.guestData?.nome?.trim() || '—',
    cpfFormatado: i.guestData?.cpf ? safeFormatCpf(i.guestData.cpf) : '—',
    telefoneFormatado: i.guestData?.telefone ? safeFormatPhone(i.guestData.telefone) : '—',
    confirmadoEm: paymentDateForConfirmed(i.status, i.confirmadoEm, i.atualizadoEm),
    criadoEm: toIsoString(i.criadoEm),
    pagamentoCurto: shortPayment(i.preferredPaymentMethod),
    status: i.status as PersonRow['status'],
    statusLabel: i.statusLabel ?? i.status,
    tamanho: i.tamanho,
    brinde: i.temBrinde === true,
  }
}

function toLoteRow(
  b: BatchInscriptionDTO,
  nome: string,
  tamanho: string | undefined,
  brinde: boolean,
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
}

async function renderPdf(input: {
  event: EventDTO
  groups: CityGroup[]
  shirts: ShirtSummary
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
  }

  const totalAvulsas = input.groups.reduce(
    (sum, g) => sum + g.rows.filter((row) => row.source === 'avulsa').length,
    0,
  )
  const totalLotes = input.groups.reduce(
    (sum, g) => sum + g.rows.filter((row) => row.source === 'lote').length,
    0,
  )

  drawHeader(r, input.event, totalAvulsas, totalLotes)
  drawShirtSummary(r, input.shirts)

  for (const group of input.groups) {
    drawCitySection(r, group)
  }

  drawPageNumbers(r)

  return doc.save()
}

function drawHeader(r: Renderer, event: EventDTO, totalAvulsas: number, totalLotes: number): void {
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

  const title = `Camisetas das inscrições confirmadas · ${shirts.total} total`
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

function drawCitySection(r: Renderer, group: CityGroup): void {
  ensureSpace(r, SECTION_HEADER_HEIGHT + TABLE_HEADER_HEIGHT + ROW_HEIGHT)
  drawSectionHeader(r, group.city, group.rows.length)
  drawTableHeader(r)
  for (const row of group.rows) {
    ensureSpace(r, ROW_HEIGHT, () => {
      drawSectionHeaderContinuation(r, group.city)
      drawTableHeader(r)
    })
    drawDataRow(r, row)
  }
  r.cursor -= 6
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
    [COL_X.date + 4, 'Pago em'],
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
  r.page.drawLine({
    start: { x: MARGIN_X, y: r.cursor - ROW_HEIGHT + 1 },
    end: { x: MARGIN_X + USABLE_WIDTH, y: r.cursor - ROW_HEIGHT + 1 },
    thickness: 0.3,
    color: COLOR_DIVIDER,
  })

  const namePrefix = row.source === 'lote' ? '[L] ' : ''
  drawTextClipped(r, namePrefix + row.nome, {
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

  drawTextAt(r, formatDateShort(row.confirmadoEm), {
    x: COL_X.date + 4,
    y,
    size: 8,
    font: r.fontRegular,
    color: row.confirmadoEm ? COLOR_TEXT : COLOR_MUTED,
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
