import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { getAdminFirestore } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

export interface DeleteInscriptionInput {
  eventId: string
  inscriptionId: string
}

export interface DeleteInscriptionOutput {
  inscriptionDeleted: boolean
  paymentCancelled: boolean
  asaasPaymentCancelled: boolean
  brindeReverted: boolean
}

export class DeleteInscription {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly perkRepository: IEventPerkRepository,
  ) {}

  async execute(input: DeleteInscriptionInput): Promise<DeleteInscriptionOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) throw new ValidationError('Inscrição não encontrada')

    // Uma inscrição pode ter mais de um pagamento (original + cobrança de ajuste de
    // upgrade). Cancela na Asaas e remove TODOS, evitando cobranças/docs órfãos.
    const { asaasPaymentCancelled, paymentCancelled } = await this.cleanupPayments(input)
    const brindeReverted = await this.revertPerkAllocation(input, inscription.perkId)

    await this.inscriptionRepository.delete(input.inscriptionId, input.eventId)

    return { inscriptionDeleted: true, paymentCancelled, asaasPaymentCancelled, brindeReverted }
  }

  private async cleanupPayments(
    input: DeleteInscriptionInput,
  ): Promise<{ asaasPaymentCancelled: boolean; paymentCancelled: boolean }> {
    const payments = await this.paymentRepository.findAllByInscriptionId(input.inscriptionId, input.eventId)
    let asaasPaymentCancelled = false
    let paymentCancelled = false

    for (const payment of payments) {
      if (!payment.isConfirmed() && !payment.asaasPaymentId.startsWith('CASH:')) {
        try {
          await asaasService.cancelPayment(payment.asaasPaymentId)
          asaasPaymentCancelled = true
        } catch {
          // Cobrança já cancelada/inexistente no Asaas — prossegue.
        }
      }
      await this.paymentRepository.delete(payment.id, input.eventId, input.inscriptionId)
      paymentCancelled = true
    }

    return { asaasPaymentCancelled, paymentCancelled }
  }

  private async revertPerkAllocation(input: DeleteInscriptionInput, perkId?: string): Promise<boolean> {
    if (!perkId) return false

    const db = getAdminFirestore()
    const perkRef = db.collection('events').doc(input.eventId).collection('perks').doc(perkId)
    const allocationRef = perkRef.collection('allocations').doc(input.inscriptionId)

    return db.runTransaction(async (tx) => {
      const [perkSnap, allocationSnap] = await Promise.all([
        tx.get(perkRef),
        tx.get(allocationRef),
      ])

      if (!allocationSnap.exists) return false

      tx.delete(allocationRef)

      if (perkSnap.exists) {
        const current = perkSnap.data()!.quantidadeAlocada ?? 0
        tx.update(perkRef, { quantidadeAlocada: Math.max(current - 1, 0) })
      }

      return true
    })
  }
}
