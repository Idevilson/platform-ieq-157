import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IPaymentFeeCalculator } from '@/server/domain/payment/services/IPaymentFeeCalculator'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { ValidationError } from '@/server/domain/shared/errors'
import { Money } from '@/server/domain/shared/value-objects/Money'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'

export interface RegeneratePaymentForBatchInput {
  batchId: string
}

export interface RegeneratePaymentForBatchOutput {
  batch: ReturnType<BatchInscription['toJSON']>
}

export class RegeneratePaymentForBatch {
  constructor(
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly feeCalculator: IPaymentFeeCalculator,
  ) {}

  async execute(input: RegeneratePaymentForBatchInput): Promise<RegeneratePaymentForBatchOutput> {
    const batch = await this.batchRepository.findById(input.batchId)
    if (!batch) throw new ValidationError('Lote não encontrado')
    if (batch.isConfirmed()) throw new ValidationError('Lote já confirmado não pode ter pagamento regerado')
    if (batch.isCashPayment()) throw new ValidationError('Lote com pagamento em dinheiro não requer pagamento online')

    if (batch.paymentId) {
      try {
        await asaasService.cancelPayment(batch.paymentId)
      } catch {
        // Pagamento já cancelado ou não encontrado — prossegue
      }
    }

    batch.resetPaymentData()
    await this.batchRepository.update(batch)

    const valorBase = Money.fromCents(batch.valorTotalCents)
    const isCard = batch.isCardPayment()
    const breakdown = isCard
      ? this.feeCalculator.calculateBreakdown(valorBase, 'CREDIT_CARD', 1)
      : this.feeCalculator.calculateBreakdown(valorBase, 'PIX')

    const asaasCustomer = await asaasService.findOrCreateCustomer({
      name: batch.responsavel.nome,
      email: batch.responsavel.email,
      cpfCnpj: batch.responsavel.cpf,
      phone: batch.responsavel.telefone,
    })

    const dueDate = this.calculateDueDate()

    const asaasPayment = await asaasService.createPayment({
      customer: asaasCustomer.id,
      billingType: isCard ? 'CREDIT_CARD' : 'PIX',
      value: breakdown.valorTotal.getReais(),
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Inscrição Coletiva - ${batch.totalParticipantes} participantes`.substring(0, 100),
      externalReference: `${batch.eventId}:batch:${batch.id}`,
    })

    if (isCard) {
      batch.setCardPaymentData(asaasPayment.id, asaasPayment.invoiceUrl ?? '', dueDate, breakdown)
    } else {
      const pixData = await asaasService.getPixQrCode(asaasPayment.id)
      batch.setPixPaymentData(asaasPayment.id, pixData.payload, pixData.encodedImage, dueDate, breakdown)
    }

    await this.batchRepository.update(batch)

    return { batch: batch.toJSON() }
  }

  private calculateDueDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date
  }
}
