
import { Money } from '@/server/domain/shared/value-objects/Money'
import { PaymentStatus, PaymentMethod, Timestamps, PAYMENT_STATUS_LABELS } from '@/server/domain/shared/types'

export interface PaymentProps {
  id: string
  inscriptionId: string
  userId?: string
  asaasPaymentId: string
  valor: Money
  status: PaymentStatus
  metodoPagamento: PaymentMethod
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
  dataVencimento: Date
  dataPagamento?: Date
  criadoEm: Date
  atualizadoEm: Date
}

export interface CreatePaymentDTO {
  inscriptionId: string
  userId?: string
  asaasPaymentId: string
  valor: number // in cents
  metodoPagamento: PaymentMethod
  dataVencimento: Date
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
}

export class Payment implements Timestamps {
  readonly id: string
  readonly inscriptionId: string
  readonly userId?: string
  readonly asaasPaymentId: string
  readonly valor: Money
  private _status: PaymentStatus
  readonly metodoPagamento: PaymentMethod
  private _pixQrCode?: string
  private _pixCopiaECola?: string
  private _boletoUrl?: string
  readonly dataVencimento: Date
  private _dataPagamento?: Date
  readonly criadoEm: Date
  private _atualizadoEm: Date

  private constructor(props: PaymentProps) {
    this.id = props.id
    this.inscriptionId = props.inscriptionId
    this.userId = props.userId
    this.asaasPaymentId = props.asaasPaymentId
    this.valor = props.valor
    this._status = props.status
    this.metodoPagamento = props.metodoPagamento
    this._pixQrCode = props.pixQrCode
    this._pixCopiaECola = props.pixCopiaECola
    this._boletoUrl = props.boletoUrl
    this.dataVencimento = props.dataVencimento
    this._dataPagamento = props.dataPagamento
    this.criadoEm = props.criadoEm
    this._atualizadoEm = props.atualizadoEm
  }

  static create(id: string, dto: CreatePaymentDTO): Payment {
    const now = new Date()
    return new Payment({
      id,
      inscriptionId: dto.inscriptionId,
      userId: dto.userId,
      asaasPaymentId: dto.asaasPaymentId,
      valor: Money.fromCents(dto.valor),
      status: 'PENDING',
      metodoPagamento: dto.metodoPagamento,
      pixQrCode: dto.pixQrCode,
      pixCopiaECola: dto.pixCopiaECola,
      boletoUrl: dto.boletoUrl,
      dataVencimento: dto.dataVencimento,
      criadoEm: now,
      atualizadoEm: now,
    })
  }

  static fromPersistence(data: {
    id: string
    inscriptionId: string
    userId?: string
    asaasPaymentId: string
    valor: number
    status: PaymentStatus
    metodoPagamento: PaymentMethod
    pixQrCode?: string
    pixCopiaECola?: string
    boletoUrl?: string
    dataVencimento: Date
    dataPagamento?: Date
    criadoEm: Date
    atualizadoEm: Date
  }): Payment {
    return new Payment({
      id: data.id,
      inscriptionId: data.inscriptionId,
      userId: data.userId,
      asaasPaymentId: data.asaasPaymentId,
      valor: Money.fromCents(data.valor),
      status: data.status,
      metodoPagamento: data.metodoPagamento,
      pixQrCode: data.pixQrCode,
      pixCopiaECola: data.pixCopiaECola,
      boletoUrl: data.boletoUrl,
      dataVencimento: data.dataVencimento,
      dataPagamento: data.dataPagamento,
      criadoEm: data.criadoEm,
      atualizadoEm: data.atualizadoEm,
    })
  }

  // Getters
  get status(): PaymentStatus {
    return this._status
  }

  get statusLabel(): string {
    return PAYMENT_STATUS_LABELS[this._status]
  }

  get pixQrCode(): string | undefined {
    return this._pixQrCode
  }

  get pixCopiaECola(): string | undefined {
    return this._pixCopiaECola
  }

  get boletoUrl(): string | undefined {
    return this._boletoUrl
  }

  get dataPagamento(): Date | undefined {
    return this._dataPagamento
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
  isPending(): boolean {
    return this._status === 'PENDING'
  }

  isConfirmed(): boolean {
    return this._status === 'CONFIRMED' || this._status === 'RECEIVED'
  }

  isOverdue(): boolean {
    return this._status === 'OVERDUE'
  }

  isCancelled(): boolean {
    return this._status === 'CANCELLED'
  }

  isPix(): boolean {
    return this.metodoPagamento === 'PIX'
  }

  isBoleto(): boolean {
    return this.metodoPagamento === 'BOLETO'
  }

  isCreditCard(): boolean {
    return this.metodoPagamento === 'CREDIT_CARD'
  }

  // State transitions based on Asaas webhook events
  markAsReceived(dataPagamento: Date): void {
    this._status = 'RECEIVED'
    this._dataPagamento = dataPagamento
    this._atualizadoEm = new Date()
  }

  markAsConfirmed(dataPagamento?: Date): void {
    this._status = 'CONFIRMED'
    if (dataPagamento) {
      this._dataPagamento = dataPagamento
    }
    this._atualizadoEm = new Date()
  }

  markAsOverdue(): void {
    this._status = 'OVERDUE'
    this._atualizadoEm = new Date()
  }

  markAsRefunded(): void {
    this._status = 'REFUNDED'
    this._atualizadoEm = new Date()
  }

  markAsCancelled(): void {
    this._status = 'CANCELLED'
    this._atualizadoEm = new Date()
  }

  updateStatus(status: PaymentStatus, dataPagamento?: Date): void {
    this._status = status
    if (dataPagamento) {
      this._dataPagamento = dataPagamento
    }
    this._atualizadoEm = new Date()
  }

  setPixData(qrCode: string, copiaECola: string): void {
    this._pixQrCode = qrCode
    this._pixCopiaECola = copiaECola
    this._atualizadoEm = new Date()
  }

  setBoletoUrl(url: string): void {
    this._boletoUrl = url
    this._atualizadoEm = new Date()
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      inscriptionId: this.inscriptionId,
      userId: this.userId,
      asaasPaymentId: this.asaasPaymentId,
      valor: this.valor.getCents(),
      valorFormatado: this.valor.getFormatted(),
      status: this._status,
      statusLabel: this.statusLabel,
      metodoPagamento: this.metodoPagamento,
      pixQrCode: this._pixQrCode,
      pixCopiaECola: this._pixCopiaECola,
      boletoUrl: this._boletoUrl,
      dataVencimento: this.dataVencimento,
      dataPagamento: this._dataPagamento,
      criadoEm: this.criadoEm,
      atualizadoEm: this._atualizadoEm,
    }
  }
}
