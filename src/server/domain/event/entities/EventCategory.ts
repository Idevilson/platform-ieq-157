
import { Money } from '@/server/domain/shared/value-objects/Money'

export interface EventCategoryProps {
  id: string
  nome: string
  valor: Money
  descricao?: string
  ordem?: number
}

export interface CreateCategoryDTO {
  nome: string
  valor: number // in cents
  descricao?: string
  ordem?: number
}

export class EventCategory {
  readonly id: string
  private _nome: string
  private _valor: Money
  private _descricao?: string
  private _ordem?: number

  private constructor(props: EventCategoryProps) {
    this.id = props.id
    this._nome = props.nome
    this._valor = props.valor
    this._descricao = props.descricao
    this._ordem = props.ordem
  }

  static create(id: string, dto: CreateCategoryDTO): EventCategory {
    return new EventCategory({
      id,
      nome: dto.nome,
      valor: Money.fromCents(dto.valor),
      descricao: dto.descricao,
      ordem: dto.ordem,
    })
  }

  static fromPersistence(data: {
    id: string
    nome: string
    valor: number
    descricao?: string
    ordem?: number
  }): EventCategory {
    return new EventCategory({
      id: data.id,
      nome: data.nome,
      valor: Money.fromCents(data.valor),
      descricao: data.descricao,
      ordem: data.ordem,
    })
  }

  // Getters
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

  // Business logic
  isFree(): boolean {
    return this._valor.isZero()
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      nome: this._nome,
      valor: this._valor.getCents(),
      valorFormatado: this._valor.getFormatted(),
      descricao: this._descricao,
      ordem: this._ordem,
    }
  }
}
