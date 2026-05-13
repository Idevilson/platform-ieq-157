import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'
import { ValidationError } from '@/server/domain/shared/errors'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'

export interface ConfirmBatchCashPaymentInput {
  batchId: string
  confirmedBy: string
}

export interface ConfirmBatchCashPaymentOutput {
  success: boolean
  batchId: string
  status: string
  asaasPaymentCancelled: boolean
  brindesAlocados: number
}

export class ConfirmBatchCashPayment {
  constructor(
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly eventPerkRepository: IEventPerkRepository,
  ) {}

  async execute(input: ConfirmBatchCashPaymentInput): Promise<ConfirmBatchCashPaymentOutput> {
    const batch = await this.batchRepository.findById(input.batchId)
    if (!batch) {
      throw new ValidationError('Lote de inscrições não encontrado')
    }
    if (!batch.isPending()) {
      throw new ValidationError('Apenas lotes pendentes podem ser confirmados')
    }

    const asaasPaymentCancelled = await this.cancelPendingPixIfExists(batch.paymentId)

    batch.confirmCash(input.confirmedBy)

    const { allocated, perkId } = await this.allocateBrindes(batch.eventId, batch.id, batch.totalParticipantes)
    for (let i = 0; i < batch.totalParticipantes; i++) {
      if (i < allocated && perkId) {
        batch.allocateParticipantBrinde(i, perkId)
      } else {
        batch.markParticipantBrindeUnavailable(i)
      }
    }
    const brindesAlocados = allocated

    await this.batchRepository.update(batch)

    return {
      success: true,
      batchId: batch.id,
      status: batch.status,
      asaasPaymentCancelled,
      brindesAlocados,
    }
  }

  private async cancelPendingPixIfExists(asaasPaymentId?: string): Promise<boolean> {
    if (!asaasPaymentId || asaasPaymentId.startsWith('MANUAL-')) return false
    try {
      await asaasService.cancelPayment(asaasPaymentId)
      return true
    } catch {
      return false
    }
  }

  private async allocateBrindes(eventId: string, batchId: string, count: number): Promise<{ allocated: number; perkId: string | null }> {
    const perk = await this.eventPerkRepository.findPrimaryByEventId(eventId)
    if (!perk) return { allocated: 0, perkId: null }

    return this.eventPerkRepository.allocateToBatchParticipants(eventId, perk.id, batchId, count)
  }
}
