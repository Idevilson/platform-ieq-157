import { v4 as uuidv4 } from 'uuid'
import { Payment } from '@/server/domain/payment/entities/Payment'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { PendingUpgrade } from '@/server/domain/inscription/value-objects/PendingUpgrade'
import { Money } from '@/server/domain/shared/value-objects/Money'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { IPaymentFeeCalculator } from '@/server/domain/payment/services/IPaymentFeeCalculator'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { ValidationError } from '@/server/domain/shared/errors'
import { InscriptionPaymentMethod } from '@/shared/constants'
import { computeUpgradePreview, UpgradePreviewResult } from './computeUpgradePreview'
import { buildAsaasCustomerData } from '../payment/asaasCustomerData'

export interface RequestInscriptionUpgradeInput {
  eventId: string
  inscriptionId: string
  newCategoryId: string
  metodo: InscriptionPaymentMethod
}

export interface RequestInscriptionUpgradeOutput {
  preview: UpgradePreviewResult
  payment?: ReturnType<Payment['toJSON']>
  pendingUpgrade?: ReturnType<PendingUpgrade['toJSON']>
}

/** Pagamentos de ajuste em dinheiro não têm cobrança Asaas; usamos este prefixo no id. */
const CASH_ASAAS_PREFIX = 'CASH:'

export class RequestInscriptionUpgrade {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository,
    private readonly userRepository: IUserRepository,
    private readonly feeCalculator: IPaymentFeeCalculator,
  ) {}

  /** Calcula o preview da diferença sem efeitos colaterais (usado pela rota GET). */
  async preview(input: RequestInscriptionUpgradeInput): Promise<UpgradePreviewResult> {
    return (await this.loadValidated(input)).preview
  }

  private async loadValidated(
    input: RequestInscriptionUpgradeInput,
  ): Promise<{ inscription: Inscription; newCategoryId: string; preview: UpgradePreviewResult }> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) throw new ValidationError('Inscrição não encontrada')
    if (!inscription.isConfirmed()) {
      throw new ValidationError('Apenas inscrições confirmadas (pagas) podem trocar de categoria')
    }

    const newCategory = await this.eventRepository.findCategoryById(input.eventId, input.newCategoryId)
    if (!newCategory) throw new ValidationError('Categoria de destino não encontrada')
    if (newCategory.id === inscription.categoryId) {
      throw new ValidationError('A nova categoria deve ser diferente da atual')
    }

    const preview = computeUpgradePreview(inscription, newCategory, input.metodo, this.feeCalculator)
    return { inscription, newCategoryId: newCategory.id, preview }
  }

  async execute(input: RequestInscriptionUpgradeInput): Promise<RequestInscriptionUpgradeOutput> {
    const { inscription, newCategoryId, preview } = await this.loadValidated(input)

    // Downgrade: troca direta de categoria, sem cobrança. Estorno é manual (fora de escopo).
    if (preview.isDowngrade) {
      inscription.changeCategory(newCategoryId, preview.targetValorCents)
      await this.inscriptionRepository.update(inscription)
      return { preview }
    }

    // Já existe um upgrade pendente: regenera (cancela o anterior) em vez de duplicar.
    if (inscription.hasPendingUpgrade()) {
      await this.cancelExistingAdjustment(inscription, input.eventId)
    }

    const payment = await this.createAdjustmentPayment(inscription, input, preview)

    const pending = PendingUpgrade.create({
      targetCategoryId: newCategoryId,
      targetValorCents: preview.targetValorCents,
      diferencaBaseCents: preview.diferencaBaseCents,
      adjustmentPaymentId: payment.id,
      metodo: input.metodo,
      criadoEm: new Date(),
    })
    inscription.requestUpgrade(pending)
    await this.inscriptionRepository.update(inscription)

    return { preview, payment: payment.toJSON(), pendingUpgrade: pending.toJSON() }
  }

  private async cancelExistingAdjustment(inscription: Inscription, eventId: string): Promise<void> {
    const pending = inscription.pendingUpgrade
    if (!pending) return
    const existing = await this.paymentRepository.findById(pending.adjustmentPaymentId, eventId, inscription.id)
    if (existing) {
      if (!existing.asaasPaymentId.startsWith(CASH_ASAAS_PREFIX)) {
        try {
          await asaasService.cancelPayment(existing.asaasPaymentId)
        } catch {
          // Cobrança já cancelada/inexistente no Asaas — prossegue.
        }
      }
      await this.paymentRepository.delete(existing.id, eventId, inscription.id)
    }
    inscription.cancelUpgrade()
  }

  private async createAdjustmentPayment(
    inscription: Inscription,
    input: RequestInscriptionUpgradeInput,
    preview: UpgradePreviewResult,
  ): Promise<Payment> {
    const base = Money.fromCents(preview.diferencaBaseCents)
    const id = uuidv4()
    const dueDate = this.calculateDueDate()
    const externalReference = `${input.eventId}:adjustment:${input.inscriptionId}`

    if (input.metodo === 'CASH') {
      const breakdown = this.feeCalculator.calculateBreakdown(base, 'CASH')
      const payment = Payment.create(id, {
        inscriptionId: input.inscriptionId,
        userId: inscription.userId,
        asaasPaymentId: `${CASH_ASAAS_PREFIX}${id}`,
        valor: breakdown.valorTotal.getCents(),
        breakdown,
        metodoPagamento: 'CASH',
        tipo: 'AJUSTE',
        dataVencimento: dueDate,
      })
      await this.paymentRepository.save(payment, input.eventId)
      return payment
    }

    const billingType = input.metodo === 'PIX' ? 'PIX' : 'CREDIT_CARD'
    const breakdown = this.feeCalculator.calculateBreakdown(base, billingType)
    const customerData = await buildAsaasCustomerData(inscription, this.userRepository)
    const customer = await asaasService.findOrCreateCustomer(customerData)

    const asaasPayment = await asaasService.createPayment({
      customer: customer.id,
      billingType,
      value: breakdown.valorTotal.getReais(),
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Upgrade de categoria - ${input.eventId}`.substring(0, 100),
      externalReference,
    })

    let pixQrCode: string | undefined
    let pixCopiaECola: string | undefined
    let checkoutUrl: string | undefined
    if (billingType === 'PIX') {
      const pixData = await asaasService.getPixQrCode(asaasPayment.id)
      pixQrCode = pixData.encodedImage
      pixCopiaECola = pixData.payload
    } else {
      checkoutUrl = asaasPayment.invoiceUrl
    }

    const payment = Payment.create(id, {
      inscriptionId: input.inscriptionId,
      userId: inscription.userId,
      asaasPaymentId: asaasPayment.id,
      valor: breakdown.valorTotal.getCents(),
      breakdown,
      metodoPagamento: billingType,
      tipo: 'AJUSTE',
      dataVencimento: dueDate,
      pixQrCode,
      pixCopiaECola,
      checkoutUrl,
    })
    await this.paymentRepository.save(payment, input.eventId)
    return payment
  }

  private calculateDueDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date
  }
}
