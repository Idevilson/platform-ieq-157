import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IPaymentFeeCalculator } from '@/server/domain/payment/services/IPaymentFeeCalculator'
import { Money } from '@/server/domain/shared/value-objects/Money'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { ValidationError } from '@/server/domain/shared/errors'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'

export interface CreatePaymentForBatchInput {
  batchId: string
}

export interface CreatePaymentForBatchOutput {
  batch: ReturnType<BatchInscription['toJSON']>
}

export class CreatePaymentForBatch {
  constructor(
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly feeCalculator: IPaymentFeeCalculator,
  ) {}

  async execute(input: CreatePaymentForBatchInput): Promise<CreatePaymentForBatchOutput> {
    const batch = await this.batchRepository.findById(input.batchId)
    if (!batch) {
      throw new ValidationError('Lote de inscrições não encontrado')
    }
    if (!batch.isPending()) {
      throw new ValidationError('Pagamento já foi criado para este lote')
    }
    if (batch.isCashPayment()) {
      throw new ValidationError('Lote com pagamento em dinheiro não requer pagamento online')
    }

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
