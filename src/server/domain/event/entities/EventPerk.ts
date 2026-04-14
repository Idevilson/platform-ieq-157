
export interface EventPerkProps {
  id: string
  eventId: string
  nome: string
  descricao: string
  limiteEstoque: number
  quantidadeAlocada: number
  categoriaId?: string | null
  criadoEm: Date
  atualizadoEm: Date
}

export interface CreateEventPerkDTO {
  eventId: string
  nome: string
  descricao: string
  limiteEstoque: number
  categoriaId?: string | null
}

export class EventPerk {
  readonly id: string
  readonly eventId: string
  private _nome: string
  private _descricao: string
  private _limiteEstoque: number
  private _quantidadeAlocada: number
  private _categoriaId?: string | null
  readonly criadoEm: Date
  private _atualizadoEm: Date

  private constructor(props: EventPerkProps) {
    if (props.limiteEstoque < 0) {
      throw new Error('limiteEstoque não pode ser negativo')
    }
    if (props.quantidadeAlocada < 0) {
      throw new Error('quantidadeAlocada não pode ser negativa')
    }
    if (props.quantidadeAlocada > props.limiteEstoque) {
      throw new Error('quantidadeAlocada não pode ser maior que limiteEstoque')
    }
    this.id = props.id
    this.eventId = props.eventId
    this._nome = props.nome
    this._descricao = props.descricao
    this._limiteEstoque = props.limiteEstoque
    this._quantidadeAlocada = props.quantidadeAlocada
    this._categoriaId = props.categoriaId ?? null
    this.criadoEm = props.criadoEm
    this._atualizadoEm = props.atualizadoEm
  }

  static create(id: string, dto: CreateEventPerkDTO): EventPerk {
    const now = new Date()
    return new EventPerk({
      id,
      eventId: dto.eventId,
      nome: dto.nome,
      descricao: dto.descricao,
      limiteEstoque: dto.limiteEstoque,
      quantidadeAlocada: 0,
      categoriaId: dto.categoriaId,
      criadoEm: now,
      atualizadoEm: now,
    })
  }

  static fromPersistence(props: EventPerkProps): EventPerk {
    return new EventPerk(props)
  }

  get nome(): string {
    return this._nome
  }

  get descricao(): string {
    return this._descricao
  }

  get limiteEstoque(): number {
    return this._limiteEstoque
  }

  get quantidadeAlocada(): number {
    return this._quantidadeAlocada
  }

  get quantidadeRestante(): number {
    return this._limiteEstoque - this._quantidadeAlocada
  }

  get categoriaId(): string | null {
    return this._categoriaId ?? null
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm
  }

  canAllocate(): boolean {
    return this._quantidadeAlocada < this._limiteEstoque
  }

  isAvailable(): boolean {
    return this.canAllocate()
  }

  toJSON() {
    return {
      id: this.id,
      eventId: this.eventId,
      nome: this._nome,
      descricao: this._descricao,
      limiteEstoque: this._limiteEstoque,
      quantidadeAlocada: this._quantidadeAlocada,
      quantidadeRestante: this.quantidadeRestante,
      disponivel: this.isAvailable(),
      categoriaId: this._categoriaId ?? null,
      criadoEm: this.criadoEm,
      atualizadoEm: this._atualizadoEm,
    }
  }

  toSummary() {
    return {
      id: this.id,
      nome: this._nome,
      limiteEstoque: this._limiteEstoque,
      quantidadeRestante: this.quantidadeRestante,
      disponivel: this.isAvailable(),
    }
  }
}
