
import { Money } from '@/server/domain/shared/value-objects/Money'
import { InscriptionStatus, Timestamps, INSCRIPTION_STATUS_LABELS } from '@/server/domain/shared/types'
import { GuestData, GuestDataInput } from '../value-objects/GuestData'
import { Gender, InscriptionPaymentMethod } from '@/shared/constants'

export interface InscriptionProps {
  id: string
  eventId: string
  userId?: string
  categoryId: string
  guestData?: GuestData
  valor: Money
  status: InscriptionStatus
  paymentId?: string
  preferredPaymentMethod: InscriptionPaymentMethod
  criadoEm: Date
  atualizadoEm: Date
}

export interface CreateInscriptionDTO {
  eventId: string
  categoryId: string
  valor: number // in cents
  userId?: string
  guestData?: GuestDataInput
  preferredPaymentMethod?: InscriptionPaymentMethod
}

export class Inscription implements Timestamps {
  readonly id: string
  readonly eventId: string
  readonly userId?: string
  readonly categoryId: string
  readonly guestData?: GuestData
  readonly valor: Money
  readonly preferredPaymentMethod: InscriptionPaymentMethod
  private _status: InscriptionStatus
  private _paymentId?: string
  readonly criadoEm: Date
  private _atualizadoEm: Date

  private constructor(props: InscriptionProps) {
    this.id = props.id
    this.eventId = props.eventId
    this.userId = props.userId
    this.categoryId = props.categoryId
    this.guestData = props.guestData
    this.valor = props.valor
    this.preferredPaymentMethod = props.preferredPaymentMethod
    this._status = props.status
    this._paymentId = props.paymentId
    this.criadoEm = props.criadoEm
    this._atualizadoEm = props.atualizadoEm
  }

  static create(id: string, dto: CreateInscriptionDTO): Inscription {
    // Validate: must have either userId or guestData
    if (!dto.userId && !dto.guestData) {
      throw new Error('Inscrição deve ter userId ou guestData')
    }
    if (dto.userId && dto.guestData) {
      throw new Error('Inscrição não pode ter userId e guestData ao mesmo tempo')
    }

    const now = new Date()
    return new Inscription({
      id,
      eventId: dto.eventId,
      categoryId: dto.categoryId,
      userId: dto.userId,
      guestData: dto.guestData ? GuestData.create(dto.guestData) : undefined,
      valor: Money.fromCents(dto.valor),
      preferredPaymentMethod: dto.preferredPaymentMethod || 'PIX',
      status: 'pendente',
      criadoEm: now,
      atualizadoEm: now,
    })
  }

  static fromPersistence(data: {
    id: string
    eventId: string
    userId?: string
    categoryId: string
    guestData?: {
      nome: string
      email: string
      telefone: string
      cpf: string
      dataNascimento: Date
      sexo: Gender
    }
    valor: number
    status: InscriptionStatus
    paymentId?: string
    preferredPaymentMethod?: InscriptionPaymentMethod
    criadoEm: Date
    atualizadoEm: Date
  }): Inscription {
    return new Inscription({
      id: data.id,
      eventId: data.eventId,
      userId: data.userId,
      categoryId: data.categoryId,
      guestData: data.guestData ? GuestData.fromPersistence(data.guestData) : undefined,
      valor: Money.fromCents(data.valor),
      preferredPaymentMethod: data.preferredPaymentMethod || 'PIX',
      status: data.status,
      paymentId: data.paymentId,
      criadoEm: data.criadoEm,
      atualizadoEm: data.atualizadoEm,
    })
  }

  // Getters
  get status(): InscriptionStatus {
    return this._status
  }

  get statusLabel(): string {
    return INSCRIPTION_STATUS_LABELS[this._status]
  }

  get paymentId(): string | undefined {
    return this._paymentId
  }

  get atualizadoEm(): Date {
    return this._atualizadoEm
  }

  get valorCents(): number {
    return this.valor.getCents()
  }

  get valorFormatado(): string {
    return this.valor.getFormatted()
  }

  // Business logic
  isGuest(): boolean {
    return !this.userId && !!this.guestData
  }

  isPending(): boolean {
    return this._status === 'pendente'
  }

  isConfirmed(): boolean {
    return this._status === 'confirmado'
  }

  isCancelled(): boolean {
    return this._status === 'cancelado'
  }

  canCancel(): boolean {
    return this._status === 'pendente'
  }

  isCashPayment(): boolean {
    return this.preferredPaymentMethod === 'CASH'
  }

  isPixPayment(): boolean {
    return this.preferredPaymentMethod === 'PIX'
  }

  getCPF(): string | undefined {
    return this.guestData?.cpf.getValue()
  }

  getParticipantName(): string | undefined {
    return this.guestData?.nome
  }

  getParticipantEmail(): string | undefined {
    return this.guestData?.email.getValue()
  }

  // State transitions
  confirm(paymentId: string): void {
    if (this._status !== 'pendente') {
      throw new Error('Apenas inscrições pendentes podem ser confirmadas')
    }
    this._status = 'confirmado'
    this._paymentId = paymentId
    this._atualizadoEm = new Date()
  }

  confirmManually(confirmedBy: string): void {
    if (this._status !== 'pendente') {
      throw new Error('Apenas inscrições pendentes podem ser confirmadas')
    }
    this._status = 'confirmado'
    this._paymentId = `MANUAL-${confirmedBy}-${Date.now()}`
    this._atualizadoEm = new Date()
  }

  cancel(): void {
    if (this._status === 'confirmado') {
      throw new Error('Inscrição confirmada não pode ser cancelada')
    }
    this._status = 'cancelado'
    this._atualizadoEm = new Date()
  }

  setPaymentId(paymentId: string): void {
    this._paymentId = paymentId
    this._atualizadoEm = new Date()
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      eventId: this.eventId,
      userId: this.userId,
      categoryId: this.categoryId,
      guestData: this.guestData?.toJSON(),
      valor: this.valor.getCents(),
      valorFormatado: this.valor.getFormatted(),
      preferredPaymentMethod: this.preferredPaymentMethod,
      status: this._status,
      statusLabel: this.statusLabel,
      paymentId: this._paymentId,
      criadoEm: this.criadoEm,
      atualizadoEm: this._atualizadoEm,
    }
  }
}
