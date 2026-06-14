import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { ValidationError } from '@/server/domain/shared/errors'

export interface ConfirmUpgradeCashPaymentInput {
  eventId: string
  inscriptionId: string
  confirmedBy: string
}

export interface ConfirmUpgradeCashPaymentOutput {
  success: boolean
  inscriptionId: string
  newCategoryId: string
}

/**
 * Confirma manualmente (pelo admin) o pagamento em dinheiro da diferença de um
 * upgrade e aplica a troca de categoria. Equivalente, para dinheiro, ao que o
 * webhook faz para PIX/cartão.
 */
export class ConfirmUpgradeCashPayment {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
  ) {}

  async execute(input: ConfirmUpgradeCashPaymentInput): Promise<ConfirmUpgradeCashPaymentOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) throw new ValidationError('Inscrição não encontrada')

    const pending = inscription.pendingUpgrade
    if (!pending) throw new ValidationError('Não há upgrade pendente para esta inscrição')
    if (pending.metodo !== 'CASH') {
      throw new ValidationError('O upgrade pendente não é em dinheiro')
    }

    const payment = await this.paymentRepository.findById(
      pending.adjustmentPaymentId,
      input.eventId,
      input.inscriptionId,
    )
    if (payment && !payment.isConfirmed()) {
      payment.markAsConfirmed(new Date())
      await this.paymentRepository.update(payment, input.eventId)
    }

    const newCategoryId = pending.targetCategoryId
    inscription.applyUpgrade()
    await this.inscriptionRepository.update(inscription)

    console.log(
      `[ConfirmUpgradeCashPayment] inscrição ${input.inscriptionId} confirmada em dinheiro por ${input.confirmedBy}`,
    )

    return { success: true, inscriptionId: inscription.id, newCategoryId }
  }
}
