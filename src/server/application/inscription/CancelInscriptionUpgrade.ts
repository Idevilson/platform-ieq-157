import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { ValidationError } from '@/server/domain/shared/errors'

export interface CancelInscriptionUpgradeInput {
  eventId: string
  inscriptionId: string
}

export interface CancelInscriptionUpgradeOutput {
  success: boolean
  asaasPaymentCancelled: boolean
}

const CASH_ASAAS_PREFIX = 'CASH:'

/**
 * Cancela um upgrade pendente: cancela a cobrança de diferença no Asaas, remove o
 * Payment de ajuste e limpa o pendingUpgrade. Não toca na categoria/valor (que só
 * mudariam na confirmação).
 */
export class CancelInscriptionUpgrade {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
  ) {}

  async execute(input: CancelInscriptionUpgradeInput): Promise<CancelInscriptionUpgradeOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) throw new ValidationError('Inscrição não encontrada')

    const pending = inscription.pendingUpgrade
    if (!pending) throw new ValidationError('Não há upgrade pendente para esta inscrição')

    let asaasPaymentCancelled = false
    const payment = await this.paymentRepository.findById(
      pending.adjustmentPaymentId,
      input.eventId,
      input.inscriptionId,
    )
    if (payment) {
      if (payment.isConfirmed()) {
        throw new ValidationError('Pagamento da diferença já confirmado; não é possível cancelar o upgrade')
      }
      if (!payment.asaasPaymentId.startsWith(CASH_ASAAS_PREFIX)) {
        try {
          await asaasService.cancelPayment(payment.asaasPaymentId)
          asaasPaymentCancelled = true
        } catch {
          // Cobrança já cancelada/inexistente no Asaas — prossegue.
        }
      }
      await this.paymentRepository.delete(payment.id, input.eventId, input.inscriptionId)
    }

    inscription.cancelUpgrade()
    await this.inscriptionRepository.update(inscription)

    return { success: true, asaasPaymentCancelled }
  }
}
