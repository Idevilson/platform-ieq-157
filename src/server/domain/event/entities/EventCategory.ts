
import { Money } from '@/server/domain/shared/value-objects/Money'

export interface EventCategoryProps {
  id: string
  nome: string
  valor: Money
  descricao?: string
  ordem?: number
  earlyBirdValor?: Money
  earlyBirdDeadline?: Date
  beneficiosInclusos?: string[]
}

export interface CreateCategoryDTO {
  nome: string
  valor: number
  descricao?: string
  ordem?: number
  earlyBirdValor?: number
  earlyBirdDeadline?: Date
  beneficiosInclusos?: string[]
}

export class EventCategory {
  readonly id: string
  private _nome: string
  private _valor: Money
  private _descricao?: string
  private _ordem?: number
  private _earlyBirdValor?: Money
  private _earlyBirdDeadline?: Date
  private _beneficiosInclusos: string[]

  private constructor(props: EventCategoryProps) {
    this.id = props.id
    this._nome = props.nome
    this._valor = props.valor
    this._descricao = props.descricao
    this._ordem = props.ordem
    this._earlyBirdValor = props.earlyBirdValor
    this._earlyBirdDeadline = props.earlyBirdDeadline
    this._beneficiosInclusos = props.beneficiosInclusos ?? []
  }

  static create(id: string, dto: CreateCategoryDTO): EventCategory {
    return new EventCategory({
      id,
      nome: dto.nome,
      valor: Money.fromCents(dto.valor),
      descricao: dto.descricao,
      ordem: dto.ordem,
      earlyBirdValor: dto.earlyBirdValor !== undefined ? Money.fromCents(dto.earlyBirdValor) : undefined,
      earlyBirdDeadline: dto.earlyBirdDeadline,
      beneficiosInclusos: dto.beneficiosInclusos,
    })
  }

  static fromPersistence(data: {
    id: string
    nome: string
    valor: number
    descricao?: string
    ordem?: number
    earlyBirdValor?: number
    earlyBirdDeadline?: Date
    beneficiosInclusos?: string[]
  }): EventCategory {
    return new EventCategory({
      id: data.id,
      nome: data.nome,
      valor: Money.fromCents(data.valor),
      descricao: data.descricao,
      ordem: data.ordem,
      earlyBirdValor: data.earlyBirdValor !== undefined ? Money.fromCents(data.earlyBirdValor) : undefined,
      earlyBirdDeadline: data.earlyBirdDeadline,
      beneficiosInclusos: data.beneficiosInclusos,
    })
  }

  get nome(): string {
    return this._nome
  }

  get valor(): Money {
    return this._valor
  }

  get valorCents(): number {
    return this._valor.getCents()
  }

  get valorFormatado(): string {
    return this._valor.getFormatted()
  }

  get descricao(): string | undefined {
    return this._descricao
  }

  get ordem(): number | undefined {
    return this._ordem
  }

  get earlyBirdValor(): Money | undefined {
    return this._earlyBirdValor
  }

  get earlyBirdDeadline(): Date | undefined {
    return this._earlyBirdDeadline
  }

  get beneficiosInclusos(): string[] {
    return [...this._beneficiosInclusos]
  }

  hasEarlyBird(): boolean {
    return this._earlyBirdValor !== undefined && this._earlyBirdDeadline !== undefined
  }

  isEarlyBirdActive(now: Date): boolean {
    if (!this.hasEarlyBird()) return false
    return now <= this._earlyBirdDeadline!
  }

  getCurrentPrice(now: Date): Money {
    return this.isEarlyBirdActive(now) ? this._earlyBirdValor! : this._valor
  }

  isFree(): boolean {
    return this._valor.isZero()
  }

  toJSON() {
    const now = new Date()
    const earlyBirdAtivo = this.isEarlyBirdActive(now)
    const valorAtual = this.getCurrentPrice(now)
    return {
      id: this.id,
      nome: this._nome,
      valor: this._valor.getCents(),
      valorFormatado: this._valor.getFormatted(),
      descricao: this._descricao,
      ordem: this._ordem,
      earlyBirdValor: this._earlyBirdValor?.getCents(),
      earlyBirdValorFormatado: this._earlyBirdValor?.getFormatted(),
      earlyBirdDeadline: this._earlyBirdDeadline?.toISOString(),
      beneficiosInclusos: [...this._beneficiosInclusos],
      valorAtual: valorAtual.getCents(),
      valorAtualFormatado: valorAtual.getFormatted(),
      earlyBirdAtivo,
    }
  }
}
