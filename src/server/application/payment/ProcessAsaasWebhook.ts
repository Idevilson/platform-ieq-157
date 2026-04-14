import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'
import { Payment } from '@/server/domain/payment/entities/Payment'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'

export type AsaasPaymentEvent =
  | 'PAYMENT_CREATED'
  | 'PAYMENT_AWAITING_RISK_ANALYSIS'
  | 'PAYMENT_APPROVED_BY_RISK_ANALYSIS'
  | 'PAYMENT_REPROVED_BY_RISK_ANALYSIS'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_UPDATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED'
  | 'PAYMENT_ANTICIPATED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_DELETED'
  | 'PAYMENT_RESTORED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_PARTIALLY_REFUNDED'
  | 'PAYMENT_REFUND_IN_PROGRESS'
  | 'PAYMENT_RECEIVED_IN_CASH_UNDONE'
  | 'PAYMENT_CHARGEBACK_REQUESTED'
  | 'PAYMENT_CHARGEBACK_DISPUTE'
  | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
  | 'PAYMENT_DUNNING_RECEIVED'
  | 'PAYMENT_DUNNING_REQUESTED'
  | 'PAYMENT_BANK_SLIP_VIEWED'
  | 'PAYMENT_CHECKOUT_VIEWED'

export interface AsaasWebhookPayload {
  id: string
  event: AsaasPaymentEvent
  payment: {
    object: string
    id: string
    dateCreated: string
    customer: string
    value: number
    netValue: number
    status: string
    billingType: string
    confirmedDate?: string
    paymentDate?: string
    clientPaymentDate?: string
    creditDate?: string
    dueDate: string
    description?: string
    externalReference?: string
    invoiceUrl?: string
    bankSlipUrl?: string
    invoiceNumber?: string
  }
}

export interface ProcessAsaasWebhookInput {
  eventId?: string
  event: AsaasPaymentEvent
  payment: AsaasWebhookPayload['payment']
}

export interface ProcessAsaasWebhookOutput {
  success: boolean
  message: string
  paymentId?: string
  inscriptionId?: string
  brindeAlocado?: boolean
}

export class ProcessAsaasWebhook {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventPerkRepository: IEventPerkRepository,
  ) {}

  async execute(input: ProcessAsaasWebhookInput): Promise<ProcessAsaasWebhookOutput> {
    if (!this.isPaymentConfirmationEvent(input.event)) {
      return { success: true, message: `Event ${input.event} ignored` }
    }
    return this.confirmPayment(input)
  }

  private isPaymentConfirmationEvent(event: AsaasPaymentEvent): boolean {
    return event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED'
  }

  private async confirmPayment(input: ProcessAsaasWebhookInput): Promise<ProcessAsaasWebhookOutput> {
    const reference = this.parseExternalReference(input.payment.externalReference)
    if (!reference) {
      return { success: false, message: `Invalid external reference: ${input.payment.externalReference}` }
    }

    const { eventId, inscriptionId } = reference

    const [inscription, payment] = await Promise.all([
      this.inscriptionRepository.findById(inscriptionId, eventId),
      this.paymentRepository.findByInscriptionId(inscriptionId, eventId),
    ])

    if (!inscription) {
      return { success: false, message: `Inscription not found: ${inscriptionId}` }
    }
    if (!payment) {
      return { success: false, message: `Payment not found: ${input.payment.id}` }
    }

    if (inscription.isBrindeProcessed()) {
      return {
        success: true,
        message: 'Already processed (idempotent)',
        paymentId: payment.id,
        inscriptionId: inscription.id,
        brindeAlocado: inscription.temBrinde,
      }
    }

    const dataPagamento = this.extractPaymentDate(input.payment)
    this.markPaymentByEvent(payment, input.event, dataPagamento)
    await this.paymentRepository.update(payment, eventId)

    if (inscription.isPending()) {
      inscription.confirm(payment.id)
    }

    const brindeAlocado = await this.tryAllocatePerk(eventId, inscription)
    await this.inscriptionRepository.update(inscription)

    return {
      success: true,
      message: 'Payment confirmed and inscription updated',
      paymentId: payment.id,
      inscriptionId: inscription.id,
      brindeAlocado,
    }
  }

  private async tryAllocatePerk(eventId: string, inscription: Inscription): Promise<boolean> {
    const perk = await this.eventPerkRepository.findPrimaryByEventId(eventId)
    if (!perk) {
      inscription.markBrindeUnavailable()
      return false
    }

    const result = await this.eventPerkRepository.allocateToInscription(eventId, perk.id, inscription.id)
    if (result.alreadyProcessed) {
      return inscription.temBrinde === true
    }
    if (result.allocated && result.perkId) {
      inscription.markBrindeAllocated(result.perkId, new Date())
      return true
    }
    inscription.markBrindeUnavailable()
    return false
  }

  private parseExternalReference(externalReference?: string): { eventId: string; inscriptionId: string } | null {
    if (!externalReference) return null
    const parts = externalReference.split(':')
    if (parts.length !== 2) return null
    return { eventId: parts[0], inscriptionId: parts[1] }
  }

  private extractPaymentDate(asaasPayment: ProcessAsaasWebhookInput['payment']): Date {
    const dateString = asaasPayment.paymentDate || asaasPayment.clientPaymentDate
    if (!dateString) return new Date()
    return new Date(dateString)
  }

  private markPaymentByEvent(payment: Payment, event: AsaasPaymentEvent, date: Date): void {
    if (event === 'PAYMENT_RECEIVED') {
      payment.markAsReceived(date)
      return
    }
    payment.markAsConfirmed(date)
  }
}
