import { v4 as uuidv4 } from 'uuid'
import { Payment } from '@/server/domain/payment/entities/Payment'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { ValidationError } from '@/server/domain/shared/errors'

export interface CreatePaymentInput {
  eventId: string
  inscriptionId: string
}

export interface CreatePaymentOutput {
  payment: ReturnType<Payment['toJSON']>
}

interface InscriptionData {
  userId?: string
  guestData?: {
    nome: string
    email: string
    cpf: string
    telefone: string
  }
}

export class CreatePaymentForInscription {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) {
      throw new ValidationError('Inscrição não encontrada')
    }

    const existingPayment = await this.paymentRepository.findByInscriptionId(input.inscriptionId, input.eventId)
    if (existingPayment) {
      return this.handleExistingPayment(existingPayment, inscription, input.eventId)
    }

    return this.createNewPayment(inscription, input)
  }

  private async handleExistingPayment(
    payment: Payment,
    inscription: Awaited<ReturnType<IInscriptionRepository['findById']>> & object,
    eventId: string
  ): Promise<CreatePaymentOutput> {
    if (payment.isConfirmed()) {
      return { payment: payment.toJSON() }
    }

    const asaasPayment = await asaasService.getPayment(payment.asaasPaymentId)
    const isPaidInAsaas = asaasPayment.status === 'RECEIVED' || asaasPayment.status === 'CONFIRMED'

    if (!isPaidInAsaas) {
      return { payment: payment.toJSON() }
    }

    this.syncPaymentFromAsaas(payment, asaasPayment)
    await this.paymentRepository.update(payment, eventId)

    this.confirmInscriptionIfPending(inscription, payment.id)
    await this.inscriptionRepository.update(inscription)

    console.log(`[Payment] Synced from Asaas: ${payment.id} → ${asaasPayment.status}`)
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

  private confirmInscriptionIfPending(inscription: NonNullable<Awaited<ReturnType<IInscriptionRepository['findById']>>>, paymentId: string): void {
    if (!inscription.isPending()) {
      return
    }
    inscription.confirm(paymentId)
  }

  private async createNewPayment(
    inscription: NonNullable<Awaited<ReturnType<IInscriptionRepository['findById']>>>,
    input: CreatePaymentInput
  ): Promise<CreatePaymentOutput> {
    const inscriptionData = inscription.toJSON()
    const customerData = await this.getCustomerData(inscriptionData)
    const asaasCustomer = await asaasService.findOrCreateCustomer(customerData)

    const dueDate = this.calculateDueDate()
    const valorInReais = inscription.valorCents / 100

    const asaasPayment = await asaasService.createPayment({
      customer: asaasCustomer.id,
      billingType: 'PIX',
      value: valorInReais,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Inscrição - Evento`,
      externalReference: `${input.eventId}:${input.inscriptionId}`,
    })

    const pixQrCode = await asaasService.getPixQrCode(asaasPayment.id)

    const payment = Payment.create(uuidv4(), {
      inscriptionId: input.inscriptionId,
      userId: inscription.userId,
      asaasPaymentId: asaasPayment.id,
      valor: inscription.valorCents,
      metodoPagamento: 'PIX',
      dataVencimento: dueDate,
      pixQrCode: pixQrCode.encodedImage,
      pixCopiaECola: pixQrCode.payload,
    })

    await this.paymentRepository.save(payment, input.eventId)

    return { payment: payment.toJSON() }
  }

  private async getCustomerData(inscriptionData: InscriptionData) {
    if (inscriptionData.userId) {
      const user = await this.userRepository.findById(inscriptionData.userId)
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

    if (inscriptionData.guestData) {
      return {
        name: inscriptionData.guestData.nome,
        email: inscriptionData.guestData.email,
        cpfCnpj: inscriptionData.guestData.cpf,
        phone: inscriptionData.guestData.telefone,
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
