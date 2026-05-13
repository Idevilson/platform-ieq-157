import { Gender, ShirtSize } from '@/shared/constants'

export interface BatchParticipantInput {
  nome: string
  sexo: Gender
  tamanho?: ShirtSize
}

export interface BatchParticipantData {
  nome: string
  sexo: Gender
  tamanho?: ShirtSize
  temBrinde?: boolean
  perkId?: string
  brindeAlocadoEm?: Date
}

export class BatchParticipant {
  readonly nome: string
  readonly sexo: Gender
  readonly tamanho?: ShirtSize
  private _temBrinde: boolean
  private _perkId?: string
  private _brindeAlocadoEm?: Date

  private constructor(data: BatchParticipantData) {
    this.nome = data.nome
    this.sexo = data.sexo
    this.tamanho = data.tamanho
    this._temBrinde = data.temBrinde ?? false
    this._perkId = data.perkId
    this._brindeAlocadoEm = data.brindeAlocadoEm
  }

  static create(input: BatchParticipantInput): BatchParticipant {
    if (!input.nome || input.nome.trim().length < 2) {
      throw new Error('Nome do participante é obrigatório e deve ter pelo menos 2 caracteres')
    }
    return new BatchParticipant({ nome: input.nome.trim(), sexo: input.sexo, tamanho: input.tamanho })
  }

  static fromPersistence(data: BatchParticipantData): BatchParticipant {
    return new BatchParticipant(data)
  }

  get temBrinde(): boolean { return this._temBrinde }
  get perkId(): string | undefined { return this._perkId }
  get brindeAlocadoEm(): Date | undefined { return this._brindeAlocadoEm }

  allocateBrinde(perkId: string): void {
    this._temBrinde = true
    this._perkId = perkId
    this._brindeAlocadoEm = new Date()
  }

  markBrindeUnavailable(): void {
    this._temBrinde = false
  }

  toJSON() {
    return {
      nome: this.nome,
      sexo: this.sexo,
      tamanho: this.tamanho ?? null,
      temBrinde: this._temBrinde,
      perkId: this._perkId,
      brindeAlocadoEm: this._brindeAlocadoEm?.toISOString(),
    }
  }
}
