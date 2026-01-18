import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { Payment } from '@/server/domain/payment/entities/Payment'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'

// Asaas webhook event types
// https://docs.asaas.com/reference/webhooks
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
  id: string // Unique event identifier for idempotency
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
    externalReference?: string // This is the inscriptionId
    invoiceUrl?: string
    bankSlipUrl?: string
    invoiceNumber?: string
  }
}

export interface ProcessAsaasWebhookInput {
  eventId?: string // For idempotency tracking
  event: AsaasPaymentEvent
  payment: AsaasWebhookPayload['payment']
}

export interface ProcessAsaasWebhookOutput {
  success: boolean
  message: string
  paymentId?: string
  inscriptionId?: string
}

export class ProcessAsaasWebhook {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository
  ) {}

  async execute(input: ProcessAsaasWebhookInput): Promise<ProcessAsaasWebhookOutput> {
    console.log(`[Webhook] Event: ${input.event} | Asaas ID: ${input.payment.id}`)

    if (!this.isPaymentConfirmationEvent(input.event)) {
      return this.ignored(input.event)
    }

    return this.confirmPayment(input)
  }

  private isPaymentConfirmationEvent(event: AsaasPaymentEvent): boolean {
    return event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED'
  }

  private async confirmPayment(input: ProcessAsaasWebhookInput): Promise<ProcessAsaasWebhookOutput> {
    const reference = this.parseExternalReference(input.payment.externalReference)
    if (!reference) {
      return this.invalidReference(input.payment.externalReference)
    }

    const { eventId, inscriptionId } = reference

    const inscription = await this.inscriptionRepository.findById(inscriptionId, eventId)
    if (!inscription) {
      return this.inscriptionNotFound(inscriptionId)
    }

    const payment = await this.paymentRepository.findByInscriptionId(inscriptionId, eventId)
    if (!payment) {
      return this.paymentNotFound(input.payment.id)
    }

    const dataPagamento = this.extractPaymentDate(input.payment)
    this.markPaymentByEvent(payment, input.event, dataPagamento)
    await this.paymentRepository.update(payment, eventId)

    this.confirmInscriptionIfPending(inscription, payment.id)
    await this.inscriptionRepository.update(inscription)

    console.log(`[Webhook] ✓ Payment confirmed | Inscription: ${inscription.id}`)
    return this.success(payment.id, inscription.id)
  }

  private parseExternalReference(externalReference?: string): { eventId: string; inscriptionId: string } | null {
    if (!externalReference) return null
    const parts = externalReference.split(':')
    if (parts.length !== 2) return null
    return { eventId: parts[0], inscriptionId: parts[1] }
  }

  private extractPaymentDate(asaasPayment: ProcessAsaasWebhookInput['payment']): Date {
    const dateString = asaasPayment.paymentDate || asaasPayment.clientPaymentDate
    if (!dateString) {
      return new Date()
    }
    return new Date(dateString)
  }

  private markPaymentByEvent(payment: Payment, event: AsaasPaymentEvent, date: Date): void {
    const markMethods: Record<string, () => void> = {
      'PAYMENT_RECEIVED': () => payment.markAsReceived(date),
      'PAYMENT_CONFIRMED': () => payment.markAsConfirmed(date),
    }
    markMethods[event]()
  }

  private confirmInscriptionIfPending(inscription: Inscription, paymentId: string): void {
    if (!inscription.isPending()) {
      return
    }
    inscription.confirm(paymentId)
  }

  private ignored(event: AsaasPaymentEvent): ProcessAsaasWebhookOutput {
    console.log(`[Webhook] Ignoring event: ${event}`)
    return { success: true, message: `Event ${event} ignored` }
  }

  private paymentNotFound(asaasPaymentId: string): ProcessAsaasWebhookOutput {
    console.log(`[Webhook] Payment not found: ${asaasPaymentId}`)
    return { success: false, message: `Payment not found: ${asaasPaymentId}` }
  }

  private invalidReference(externalReference?: string): ProcessAsaasWebhookOutput {
    console.log(`[Webhook] Invalid external reference: ${externalReference}`)
    return { success: false, message: `Invalid external reference format: ${externalReference}` }
  }

  private inscriptionNotFound(inscriptionId: string): ProcessAsaasWebhookOutput {
    console.log(`[Webhook] Inscription not found: ${inscriptionId}`)
    return { success: false, message: `Inscription not found: ${inscriptionId}` }
  }

  private success(paymentId: string, inscriptionId: string): ProcessAsaasWebhookOutput {
    return {
      success: true,
      message: 'Payment confirmed and inscription updated',
      paymentId,
      inscriptionId,
    }
  }
}
