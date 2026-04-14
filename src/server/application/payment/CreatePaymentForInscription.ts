import { v4 as uuidv4 } from 'uuid'
import { Payment } from '@/server/domain/payment/entities/Payment'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { Money } from '@/server/domain/shared/value-objects/Money'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { IPaymentFeeCalculator } from '@/server/domain/payment/services/IPaymentFeeCalculator'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { ValidationError } from '@/server/domain/shared/errors'
import { PaymentMethod } from '@/shared/constants'

export interface CreatePaymentInput {
  eventId: string
  inscriptionId: string
  metodo?: 'PIX' | 'CREDIT_CARD'
  parcelas?: number
}

export interface CreatePaymentOutput {
  payment: ReturnType<Payment['toJSON']>
}

interface CustomerData {
  name: string
  email: string
  cpfCnpj: string
  phone?: string
}

const MAX_PARCELAS = 12

export class CreatePaymentForInscription {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly userRepository: IUserRepository,
    private readonly feeCalculator: IPaymentFeeCalculator,
  ) {}

  async execute(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) {
      throw new ValidationError('Inscrição não encontrada')
    }

    const existing = await this.paymentRepository.findByInscriptionId(input.inscriptionId, input.eventId)
    if (existing) {
      return this.handleExistingPayment(existing, inscription, input.eventId)
    }

    const metodo: PaymentMethod = input.metodo ?? 'PIX'
    if (metodo === 'CREDIT_CARD') {
      return this.createCardCheckoutPayment(inscription, input)
    }
    return this.createPixPayment(inscription, input)
  }

  private async handleExistingPayment(
    payment: Payment,
    inscription: Inscription,
    eventId: string,
  ): Promise<CreatePaymentOutput> {
    if (payment.isConfirmed()) {
      return { payment: payment.toJSON() }
    }

    const asaasPayment = await asaasService.getPayment(payment.asaasPaymentId)
    const isPaid = asaasPayment.status === 'RECEIVED' || asaasPayment.status === 'CONFIRMED'

    if (!isPaid) {
      return { payment: payment.toJSON() }
    }

    this.syncPaymentFromAsaas(payment, asaasPayment)
    await this.paymentRepository.update(payment, eventId)

    return { payment: payment.toJSON() }
  }

  private syncPaymentFromAsaas(payment: Payment, asaasPayment: { status: string; paymentDate?: string }): void {
    const paymentDate = asaasPayment.paymentDate ? new Date(asaasPayment.paymentDate) : new Date()
    if (asaasPayment.status === 'RECEIVED') {
      payment.markAsReceived(paymentDate)
      return
    }
    payment.markAsConfirmed(paymentDate)
  }

  private async createPixPayment(
    inscription: Inscription,
    input: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    const valorBase = Money.fromCents(inscription.valorCents)
    const breakdown = this.feeCalculator.calculateBreakdown(valorBase, 'PIX')
    const customer = await this.findOrCreateAsaasCustomer(inscription)
    const dueDate = this.calculateDueDate()
    const dueDateStr = dueDate.toISOString().split('T')[0]

    const asaasPayment = await asaasService.createPayment({
      customer: customer.id,
      billingType: 'PIX',
      value: breakdown.valorTotal.getReais(),
      dueDate: dueDateStr,
      description: `Inscrição - ${input.eventId}`.substring(0, 100),
      externalReference: `${input.eventId}:${input.inscriptionId}`,
    })

    const pixData = await asaasService.getPixQrCode(asaasPayment.id)

    const payment = Payment.create(uuidv4(), {
      inscriptionId: input.inscriptionId,
      userId: inscription.userId,
      asaasPaymentId: asaasPayment.id,
      valor: breakdown.valorTotal.getCents(),
      breakdown,
      metodoPagamento: 'PIX',
      dataVencimento: dueDate,
      pixQrCode: pixData.encodedImage,
      pixCopiaECola: pixData.payload,
    })

    await this.paymentRepository.save(payment, input.eventId)
    return { payment: payment.toJSON() }
  }

  private async createCardCheckoutPayment(
    inscription: Inscription,
    input: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    const valorBase = Money.fromCents(inscription.valorCents)
    const breakdown = this.feeCalculator.calculateBreakdown(valorBase, 'CREDIT_CARD', 1)
    const customerData = await this.getCustomerData(inscription)
    const asaasCustomer = await asaasService.findOrCreateCustomer(customerData)
    const dueDate = this.calculateDueDate()
    const dueDateStr = dueDate.toISOString().split('T')[0]

    const externalReference = `${input.eventId}:${input.inscriptionId}`

    const asaasPayment = await asaasService.createPayment({
      customer: asaasCustomer.id,
      billingType: 'CREDIT_CARD',
      value: breakdown.valorTotal.getReais(),
      dueDate: dueDateStr,
      description: `Inscrição - ${input.eventId}`.substring(0, 100),
      externalReference,
    })

    const payment = Payment.create(uuidv4(), {
      inscriptionId: input.inscriptionId,
      userId: inscription.userId,
      asaasPaymentId: asaasPayment.id,
      valor: breakdown.valorTotal.getCents(),
      breakdown,
      metodoPagamento: 'CREDIT_CARD',
      dataVencimento: dueDate,
      checkoutUrl: asaasPayment.invoiceUrl,
    })

    await this.paymentRepository.save(payment, input.eventId)
    return { payment: payment.toJSON() }
  }

  private normalizeParcelas(parcelas?: number): number {
    if (parcelas === undefined || parcelas === null) return 1
    if (parcelas < 1) return 1
    if (parcelas > MAX_PARCELAS) return MAX_PARCELAS
    return Math.floor(parcelas)
  }

  private buildCallbackUrl(eventId: string, inscriptionId: string, kind: 'success' | 'cancel' | 'expired'): string {
    const candidates = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ]
    const base = candidates.find((u) => u && u.startsWith('https://') && !u.includes('localhost'))
    if (!base) {
      throw new Error('NEXT_PUBLIC_APP_URL deve ser configurada com uma URL HTTPS válida para pagamentos com cartão. Ex: NEXT_PUBLIC_APP_URL=https://ieq157.vercel.app')
    }
    return `${base}/eventos/${eventId}/confirmado?inscriptionId=${inscriptionId}&checkout=${kind}`
  }

  private async findOrCreateAsaasCustomer(inscription: Inscription) {
    const customerData = await this.getCustomerData(inscription)
    return asaasService.findOrCreateCustomer(customerData)
  }

  private async getCustomerData(inscription: Inscription): Promise<CustomerData> {
    if (inscription.userId) {
      const user = await this.userRepository.findById(inscription.userId)
      if (!user) throw new ValidationError('Usuário não encontrado')
      const userData = user.toJSON()
      if (!userData.cpf) throw new ValidationError('Usuário não possui CPF cadastrado')
      return {
        name: userData.nome,
        email: userData.email,
        cpfCnpj: userData.cpf,
        phone: userData.telefone,
      }
    }
    if (inscription.guestData) {
      const guest = inscription.guestData.toJSON()
      return {
        name: guest.nome,
        email: guest.email,
        cpfCnpj: guest.cpf,
        phone: guest.telefone,
      }
    }
    throw new ValidationError('Inscrição sem dados de usuário ou visitante')
  }

  private calculateDueDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date
  }
}
