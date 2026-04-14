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

    const asaasPaymentCancelled = await this.cancelAsaasPayment(input)
    const paymentCancelled = await this.deleteLocalPayment(input)
    const brindeReverted = await this.revertPerkAllocation(input, inscription.perkId)

    await this.inscriptionRepository.delete(input.inscriptionId, input.eventId)

    return { inscriptionDeleted: true, paymentCancelled, asaasPaymentCancelled, brindeReverted }
  }

  private async cancelAsaasPayment(input: DeleteInscriptionInput): Promise<boolean> {
    const payment = await this.paymentRepository.findByInscriptionId(input.inscriptionId, input.eventId)
    if (!payment) return false
    if (payment.isConfirmed()) return false

    try {
      await asaasService.cancelPayment(payment.asaasPaymentId)
      return true
    } catch {
      return false
    }
  }

  private async deleteLocalPayment(input: DeleteInscriptionInput): Promise<boolean> {
    const payment = await this.paymentRepository.findByInscriptionId(input.inscriptionId, input.eventId)
    if (!payment) return false

    await this.paymentRepository.delete(payment.id, input.eventId, input.inscriptionId)
    return true
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
