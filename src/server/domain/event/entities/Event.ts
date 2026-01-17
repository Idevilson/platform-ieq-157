
import { EventStatus, PaymentMethod, Timestamps, EVENT_STATUS_LABELS } from '@/server/domain/shared/types'
import { EventCategory } from './EventCategory'

export interface EventProps {
  id: string
  titulo: string
  subtitulo?: string
  descricao: string
  descricaoCompleta?: string
  dataInicio: Date
  dataFim?: Date
  local: string
  endereco: string
  googleMapsUrl?: string
  whatsappContato?: string
  status: EventStatus
  metodosPagamento: PaymentMethod[]
  imagemUrl?: string
  categorias: EventCategory[]
  criadoEm: Date
  atualizadoEm: Date
}

export interface CreateEventDTO {
  titulo: string
  subtitulo?: string
  descricao: string
  descricaoCompleta?: string
  dataInicio: Date
  dataFim?: Date
  local: string
  endereco: string
  googleMapsUrl?: string
  whatsappContato?: string
  status?: EventStatus
  metodosPagamento: PaymentMethod[]
  imagemUrl?: string
}

export interface UpdateEventDTO {
  titulo?: string
  subtitulo?: string
  descricao?: string
  descricaoCompleta?: string
  dataInicio?: Date
  dataFim?: Date
  local?: string
  endereco?: string
  googleMapsUrl?: string
  whatsappContato?: string
  status?: EventStatus
  metodosPagamento?: PaymentMethod[]
  imagemUrl?: string
}

export class Event implements Timestamps {
  readonly id: string
  private _titulo: string
  private _subtitulo?: string
  private _descricao: string
  private _descricaoCompleta?: string
  private _dataInicio: Date
  private _dataFim?: Date
  private _local: string
  private _endereco: string
  private _googleMapsUrl?: string
  private _whatsappContato?: string
  private _status: EventStatus
  private _metodosPagamento: PaymentMethod[]
  private _imagemUrl?: string
  private _categorias: EventCategory[]
  readonly criadoEm: Date
  private _atualizadoEm: Date

  private constructor(props: EventProps) {
    this.id = props.id
    this._titulo = props.titulo
    this._subtitulo = props.subtitulo
    this._descricao = props.descricao
    this._descricaoCompleta = props.descricaoCompleta
    this._dataInicio = props.dataInicio
    this._dataFim = props.dataFim
    this._local = props.local
    this._endereco = props.endereco
    this._googleMapsUrl = props.googleMapsUrl
    this._whatsappContato = props.whatsappContato
    this._status = props.status
    this._metodosPagamento = props.metodosPagamento
    this._imagemUrl = props.imagemUrl
    this._categorias = props.categorias
    this.criadoEm = props.criadoEm
    this._atualizadoEm = props.atualizadoEm
  }

  static create(id: string, dto: CreateEventDTO): Event {
    const now = new Date()
    return new Event({
      id,
      titulo: dto.titulo,
      subtitulo: dto.subtitulo,
      descricao: dto.descricao,
      descricaoCompleta: dto.descricaoCompleta,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
      local: dto.local,
      endereco: dto.endereco,
      googleMapsUrl: dto.googleMapsUrl,
      whatsappContato: dto.whatsappContato,
      status: dto.status || 'rascunho',
      metodosPagamento: dto.metodosPagamento,
      imagemUrl: dto.imagemUrl,
      categorias: [],
      criadoEm: now,
      atualizadoEm: now,
    })
  }

  static fromPersistence(props: EventProps): Event {
    return new Event(props)
  }

  // Getters
  get titulo(): string {
    return this._titulo
  }

  get subtitulo(): string | undefined {
    return this._subtitulo
  }

  get descricao(): string {
    return this._descricao
  }

  get descricaoCompleta(): string | undefined {
    return this._descricaoCompleta
  }

  get dataInicio(): Date {
    return this._dataInicio
  }

  get dataFim(): Date | undefined {
    return this._dataFim
  }

  get local(): string {
    return this._local
  }

  get endereco(): string {
    return this._endereco
  }

  get googleMapsUrl(): string | undefined {
    return this._googleMapsUrl
  }

  get whatsappContato(): string | undefined {
    return this._whatsappContato
  }

  get status(): EventStatus {
    return this._status
  }

  get statusLabel(): string {
    return EVENT_STATUS_LABELS[this._status]
  }

  get metodosPagamento(): PaymentMethod[] {
    return [...this._metodosPagamento]
  }

  get imagemUrl(): string | undefined {
    return this._imagemUrl
  }

  get categorias(): EventCategory[] {
    return [...this._categorias]
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm
  }

  // Business logic
  isOpen(): boolean {
    return this._status === 'aberto'
  }

  isVisible(): boolean {
    return this._status !== 'rascunho'
  }

  acceptsPaymentMethod(method: PaymentMethod): boolean {
    return this._metodosPagamento.includes(method)
  }

  getCategory(categoryId: string): EventCategory | undefined {
    return this._categorias.find((c) => c.id === categoryId)
  }

  hasCategories(): boolean {
    return this._categorias.length > 0
  }

  shouldAutoClose(): boolean {
    const now = new Date()
    const endDate = this._dataFim || this._dataInicio
    return this._status === 'aberto' && now > endDate
  }

  close(): void {
    if (this._status !== 'aberto') {
      throw new Error('Apenas eventos abertos podem ser fechados')
    }
    this._status = 'encerrado'
    this._atualizadoEm = new Date()
  }

  // Update methods
  update(dto: UpdateEventDTO): void {
    if (dto.titulo !== undefined) this._titulo = dto.titulo
    if (dto.subtitulo !== undefined) this._subtitulo = dto.subtitulo
    if (dto.descricao !== undefined) this._descricao = dto.descricao
    if (dto.descricaoCompleta !== undefined) this._descricaoCompleta = dto.descricaoCompleta
    if (dto.dataInicio !== undefined) this._dataInicio = dto.dataInicio
    if (dto.dataFim !== undefined) this._dataFim = dto.dataFim
    if (dto.local !== undefined) this._local = dto.local
    if (dto.endereco !== undefined) this._endereco = dto.endereco
    if (dto.googleMapsUrl !== undefined) this._googleMapsUrl = dto.googleMapsUrl
    if (dto.whatsappContato !== undefined) this._whatsappContato = dto.whatsappContato
    if (dto.status !== undefined) this._status = dto.status
    if (dto.metodosPagamento !== undefined) this._metodosPagamento = dto.metodosPagamento
    if (dto.imagemUrl !== undefined) this._imagemUrl = dto.imagemUrl
    this._atualizadoEm = new Date()
  }

  addCategory(category: EventCategory): void {
    this._categorias.push(category)
    this._atualizadoEm = new Date()
  }

  setCategorias(categorias: EventCategory[]): void {
    this._categorias = categorias
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      titulo: this._titulo,
      subtitulo: this._subtitulo,
      descricao: this._descricao,
      descricaoCompleta: this._descricaoCompleta,
      dataInicio: this._dataInicio,
      dataFim: this._dataFim,
      local: this._local,
      endereco: this._endereco,
      googleMapsUrl: this._googleMapsUrl,
      whatsappContato: this._whatsappContato,
      status: this._status,
      statusLabel: this.statusLabel,
      metodosPagamento: this._metodosPagamento,
      imagemUrl: this._imagemUrl,
      categorias: this._categorias.map((c) => c.toJSON()),
      criadoEm: this.criadoEm,
      atualizadoEm: this._atualizadoEm,
    }
  }

  toSummary() {
    return {
      id: this.id,
      titulo: this._titulo,
      subtitulo: this._subtitulo,
      descricao: this._descricao,
      dataInicio: this._dataInicio,
      local: this._local,
      status: this._status,
      imagemUrl: this._imagemUrl,
    }
  }
}
