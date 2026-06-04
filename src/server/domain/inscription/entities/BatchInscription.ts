import { Money } from '@/server/domain/shared/value-objects/Money'
import { PaymentBreakdown } from '@/server/domain/shared/value-objects/PaymentBreakdown'
import { Timestamps } from '@/server/domain/shared/types'
import { Gender, InscriptionPaymentMethod } from '@/shared/constants'
import { BatchParticipant, BatchParticipantInput, BatchParticipantData } from '../value-objects/BatchParticipant'

export type BatchInscriptionStatus = 'pendente' | 'confirmado' | 'cancelado'

export interface BatchResponsavelData {
  nome: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: Date
  sexo: Gender
  cidade: string
}

export interface BatchInscriptionProps {
  id: string
  eventId: string
  categoryId: string
  status: BatchInscriptionStatus
  paymentId?: string
  preferredPaymentMethod: InscriptionPaymentMethod
  valorTotal: Money
  responsavel: BatchResponsavelData
  cidade: string
  participantes: BatchParticipant[]
  inscriptionIds: string[]
  pixCopiaECola?: string
  pixQrCode?: string
  checkoutUrl?: string
  dataVencimentoPagamento?: Date
  paymentStatus?: string
  breakdown?: PaymentBreakdown
  criadoEm: Date
  atualizadoEm: Date
}

export interface CreateBatchInscriptionDTO {
  eventId: string
  categoryId: string
  preferredPaymentMethod?: InscriptionPaymentMethod
  valorTotalCents: number
  responsavel: BatchResponsavelData
  cidade: string
  participantes: BatchParticipantInput[]
}

export class BatchInscription implements Timestamps {
  readonly id: string
  readonly eventId: string
  readonly categoryId: string
  readonly preferredPaymentMethod: InscriptionPaymentMethod
  readonly valorTotal: Money
  readonly responsavel: BatchResponsavelData
  readonly cidade: string
  readonly participantes: BatchParticipant[]
  readonly inscriptionIds: string[]
  readonly criadoEm: Date
  private _status: BatchInscriptionStatus
  private _paymentId?: string
  private _pixCopiaECola?: string
  private _pixQrCode?: string
  private _checkoutUrl?: string
  private _dataVencimentoPagamento?: Date
  private _paymentStatus?: string
  private _breakdown?: PaymentBreakdown
  private _atualizadoEm: Date

  private constructor(props: BatchInscriptionProps) {
    this.id = props.id
    this.eventId = props.eventId
    this.categoryId = props.categoryId
    this.preferredPaymentMethod = props.preferredPaymentMethod
    this.valorTotal = props.valorTotal
    this.responsavel = props.responsavel
    this.cidade = props.cidade
    this.participantes = props.participantes
    this.inscriptionIds = props.inscriptionIds
    this.criadoEm = props.criadoEm
    this._status = props.status
    this._paymentId = props.paymentId
    this._pixCopiaECola = props.pixCopiaECola
    this._pixQrCode = props.pixQrCode
    this._checkoutUrl = props.checkoutUrl
    this._dataVencimentoPagamento = props.dataVencimentoPagamento
    this._paymentStatus = props.paymentStatus
    this._breakdown = props.breakdown
    this._atualizadoEm = props.atualizadoEm
  }

  static create(id: string, dto: CreateBatchInscriptionDTO): BatchInscription {
    if (dto.participantes.length < 2) {
      throw new Error('Lote deve ter pelo menos 2 participantes')
    }
    if (dto.participantes.length > 50) {
      throw new Error('Lote não pode ter mais de 50 participantes')
    }

    const participantes = dto.participantes.map(p => BatchParticipant.create(p))
    const now = new Date()

    return new BatchInscription({
      id,
      eventId: dto.eventId,
      categoryId: dto.categoryId,
      preferredPaymentMethod: dto.preferredPaymentMethod || 'PIX',
      valorTotal: Money.fromCents(dto.valorTotalCents),
      responsavel: dto.responsavel,
      cidade: dto.cidade,
      participantes,
      inscriptionIds: [],
      status: 'pendente',
      criadoEm: now,
      atualizadoEm: now,
    })
  }

  static fromPersistence(data: {
    id: string
    eventId: string
    categoryId: string
    status: BatchInscriptionStatus
    paymentId?: string
    preferredPaymentMethod?: InscriptionPaymentMethod
    valorTotal: number
    responsavel: BatchResponsavelData
    cidade: string
    participantes: BatchParticipantData[]
    inscriptionIds: string[]
    pixCopiaECola?: string
    pixQrCode?: string
    checkoutUrl?: string
    dataVencimentoPagamento?: Date
    paymentStatus?: string
    breakdown?: { valorBase: number; valorTaxa: number; valorTotal: number; metodo: string; parcelas?: number }
    criadoEm: Date
    atualizadoEm: Date
  }): BatchInscription {
    return new BatchInscription({
      id: data.id,
      eventId: data.eventId,
      categoryId: data.categoryId,
      status: data.status,
      paymentId: data.paymentId,
      preferredPaymentMethod: data.preferredPaymentMethod || 'PIX',
      valorTotal: Money.fromCents(data.valorTotal),
      responsavel: data.responsavel,
      cidade: data.cidade,
      participantes: data.participantes.map(p => BatchParticipant.fromPersistence(p)),
      inscriptionIds: data.inscriptionIds || [],
      pixCopiaECola: data.pixCopiaECola,
      pixQrCode: data.pixQrCode,
      checkoutUrl: data.checkoutUrl,
      dataVencimentoPagamento: data.dataVencimentoPagamento,
      paymentStatus: data.paymentStatus,
      breakdown: data.breakdown ? PaymentBreakdown.fromCents(data.breakdown as Parameters<typeof PaymentBreakdown.fromCents>[0]) : undefined,
      criadoEm: data.criadoEm,
      atualizadoEm: data.atualizadoEm,
    })
  }

  get status(): BatchInscriptionStatus { return this._status }
  get paymentId(): string | undefined { return this._paymentId }
  get pixCopiaECola(): string | undefined { return this._pixCopiaECola }
  get pixQrCode(): string | undefined { return this._pixQrCode }
  get checkoutUrl(): string | undefined { return this._checkoutUrl }
  get dataVencimentoPagamento(): Date | undefined { return this._dataVencimentoPagamento }
  get paymentStatus(): string | undefined { return this._paymentStatus }
  get breakdown(): PaymentBreakdown | undefined { return this._breakdown }
  get atualizadoEm(): Date { return this._atualizadoEm }
  get valorTotalCents(): number { return this.valorTotal.getCents() }
  get valorTotalFormatado(): string { return this.valorTotal.getFormatted() }
  get totalParticipantes(): number { return this.participantes.length }

  isPending(): boolean { return this._status === 'pendente' }
  isConfirmed(): boolean { return this._status === 'confirmado' }
  isCancelled(): boolean { return this._status === 'cancelado' }
  isCashPayment(): boolean { return this.preferredPaymentMethod === 'CASH' }
  isPixPayment(): boolean { return this.preferredPaymentMethod === 'PIX' }
  isCardPayment(): boolean { return this.preferredPaymentMethod === 'CREDIT_CARD' }

  setInscriptionIds(ids: string[]): void {
    (this.inscriptionIds as string[]) = ids
    this._atualizadoEm = new Date()
  }

  setPaymentId(paymentId: string): void {
    this._paymentId = paymentId
    this._atualizadoEm = new Date()
  }

  setPixPaymentData(asaasPaymentId: string, pixCopiaECola: string, pixQrCode: string, dataVencimento: Date, breakdown: PaymentBreakdown): void {
    this._paymentId = asaasPaymentId
    this._pixCopiaECola = pixCopiaECola
    this._pixQrCode = pixQrCode
    this._dataVencimentoPagamento = dataVencimento
    this._paymentStatus = 'PENDING'
    this._breakdown = breakdown
    this._atualizadoEm = new Date()
  }

  setCardPaymentData(asaasPaymentId: string, checkoutUrl: string, dataVencimento: Date, breakdown: PaymentBreakdown): void {
    this._paymentId = asaasPaymentId
    this._checkoutUrl = checkoutUrl
    this._dataVencimentoPagamento = dataVencimento
    this._paymentStatus = 'PENDING'
    this._breakdown = breakdown
    this._atualizadoEm = new Date()
  }

  updatePaymentStatus(status: string): void {
    this._paymentStatus = status
    this._atualizadoEm = new Date()
  }

  confirm(paymentId: string): void {
    if (this._status !== 'pendente') {
      throw new Error('Apenas lotes pendentes podem ser confirmados')
    }
    this._status = 'confirmado'
    this._paymentId = paymentId
    this._atualizadoEm = new Date()
  }

  confirmCash(confirmedBy: string): void {
    if (this._status !== 'pendente') {
      throw new Error('Apenas lotes pendentes podem ser confirmados')
    }
    this._status = 'confirmado'
    this._paymentId = `MANUAL-${confirmedBy}-${Date.now()}`
    this._atualizadoEm = new Date()
  }

  cancel(): void {
    if (this._status === 'confirmado') {
      throw new Error('Lote confirmado não pode ser cancelado')
    }
    this._status = 'cancelado'
    this._atualizadoEm = new Date()
  }

  updateParticipants(
    newParticipants: BatchParticipantInput[],
    categoryPriceCents: number,
  ): { oldCount: number; oldBrindeCount: number; oldPerkId: string | undefined } {
    if (this._status === 'cancelado') throw new Error('Lote cancelado não pode ser editado')
    if (newParticipants.length < 2) throw new Error('Lote deve ter pelo menos 2 participantes')
    if (newParticipants.length > 50) throw new Error('Lote não pode ter mais de 50 participantes')

    const oldCount = this.participantes.length
    const brindeParticipants = this.participantes.filter(p => p.temBrinde && p.perkId)
    const oldBrindeCount = brindeParticipants.length
    const oldPerkId = brindeParticipants[0]?.perkId

    ;(this.participantes as BatchParticipant[]) = newParticipants.map(p => BatchParticipant.create(p))
    ;(this.valorTotal as Money) = Money.fromCents(categoryPriceCents * newParticipants.length)
    this._atualizadoEm = new Date()

    return { oldCount, oldBrindeCount, oldPerkId }
  }

  updateResponsavel(data: { nome?: string; cpf?: string }): void {
    if (data.nome !== undefined) this.responsavel.nome = data.nome
    if (data.cpf !== undefined) this.responsavel.cpf = data.cpf
    this._atualizadoEm = new Date()
  }

  resetPaymentData(): void {
    this._paymentId = undefined
    this._pixCopiaECola = undefined
    this._pixQrCode = undefined
    this._checkoutUrl = undefined
    this._dataVencimentoPagamento = undefined
    this._paymentStatus = undefined
    this._breakdown = undefined
    this._atualizadoEm = new Date()
  }

  allocateParticipantBrinde(index: number, perkId: string): void {
    if (index < 0 || index >= this.participantes.length) {
      throw new Error(`Índice de participante inválido: ${index}`)
    }
    this.participantes[index].allocateBrinde(perkId)
    this._atualizadoEm = new Date()
  }

  markParticipantBrindeUnavailable(index: number): void {
    if (index < 0 || index >= this.participantes.length) {
      throw new Error(`Índice de participante inválido: ${index}`)
    }
    this.participantes[index].markBrindeUnavailable()
    this._atualizadoEm = new Date()
  }

  toJSON() {
    return {
      id: this.id,
      eventId: this.eventId,
      categoryId: this.categoryId,
      status: this._status,
      paymentId: this._paymentId,
      preferredPaymentMethod: this.preferredPaymentMethod,
      valorTotal: this.valorTotal.getCents(),
      valorTotalFormatado: this.valorTotal.getFormatted(),
      responsavel: {
        ...this.responsavel,
        dataNascimento: this.responsavel.dataNascimento.toISOString(),
      },
      cidade: this.cidade,
      participantes: this.participantes.map(p => p.toJSON()),
      totalParticipantes: this.participantes.length,
      inscriptionIds: this.inscriptionIds,
      pixCopiaECola: this._pixCopiaECola,
      pixQrCode: this._pixQrCode,
      checkoutUrl: this._checkoutUrl,
      dataVencimentoPagamento: this._dataVencimentoPagamento?.toISOString(),
      paymentStatus: this._paymentStatus,
      breakdown: this._breakdown?.toJSON() ?? null,
      criadoEm: this.criadoEm.toISOString(),
      atualizadoEm: this._atualizadoEm.toISOString(),
    }
  }
}
