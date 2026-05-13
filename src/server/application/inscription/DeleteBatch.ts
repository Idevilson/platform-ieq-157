import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { ValidationError } from '@/server/domain/shared/errors'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'

export interface DeleteBatchInput {
  batchId: string
}

export interface DeleteBatchOutput {
  success: boolean
  asaasPaymentCancelled: boolean
  deletedInscriptions: number
}

export class DeleteBatch {
  constructor(
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
  ) {}

  async execute(input: DeleteBatchInput): Promise<DeleteBatchOutput> {
    const batch = await this.batchRepository.findById(input.batchId)
    if (!batch) {
      throw new ValidationError('Lote de inscrições não encontrado')
    }

    const asaasPaymentCancelled = await this.cancelPaymentIfExists(batch.paymentId)

    await Promise.all(
      batch.inscriptionIds.map(id =>
        this.inscriptionRepository.delete(id, batch.eventId).catch(() => null)
      )
    )

    await this.batchRepository.delete(input.batchId)

    return { success: true, asaasPaymentCancelled, deletedInscriptions: batch.inscriptionIds.length }
  }

  private async cancelPaymentIfExists(asaasPaymentId?: string): Promise<boolean> {
    if (!asaasPaymentId || asaasPaymentId.startsWith('MANUAL-')) return false
    try {
      await asaasService.cancelPayment(asaasPaymentId)
      return true
    } catch {
      return false
    }
  }
}
