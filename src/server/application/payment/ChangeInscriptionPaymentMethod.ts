import { Payment } from '@/server/domain/payment/entities/Payment'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { ValidationError } from '@/server/domain/shared/errors'
import { InscriptionPaymentMethod } from '@/shared/constants'
import { CreatePaymentForInscription } from './CreatePaymentForInscription'

export interface ChangeInscriptionPaymentMethodInput {
  eventId: string
  inscriptionId: string
  metodo: InscriptionPaymentMethod
}

export interface ChangeInscriptionPaymentMethodOutput {
  preferredPaymentMethod: InscriptionPaymentMethod
  payment: ReturnType<Payment['toJSON']> | null
}

const CASH_ASAAS_PREFIX = 'CASH:'

/**
 * Troca o meio de pagamento de uma inscrição PENDENTE e regenera a cobrança:
 * cancela/remove a cobrança online anterior (se houver), atualiza o método e,
 * para PIX/cartão, gera a nova cobrança. Para dinheiro, apenas marca o método.
 */
export class ChangeInscriptionPaymentMethod {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly createPayment: CreatePaymentForInscription,
  ) {}

  async execute(input: ChangeInscriptionPaymentMethodInput): Promise<ChangeInscriptionPaymentMethodOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) throw new ValidationError('Inscrição não encontrada')
    if (!inscription.isPending()) {
      throw new ValidationError('Apenas inscrições pendentes podem trocar o meio de pagamento')
    }
    if (inscription.preferredPaymentMethod === input.metodo) {
      throw new ValidationError('O meio de pagamento já é o selecionado')
    }

    await this.removeExistingPayment(input)

    inscription.changePaymentMethod(input.metodo)
    await this.inscriptionRepository.update(inscription)

    if (input.metodo === 'CASH') {
      return { preferredPaymentMethod: input.metodo, payment: null }
    }

    const result = await this.createPayment.execute({
      eventId: input.eventId,
      inscriptionId: input.inscriptionId,
      metodo: input.metodo,
    })
    return { preferredPaymentMethod: input.metodo, payment: result.payment }
  }

  private async removeExistingPayment(input: ChangeInscriptionPaymentMethodInput): Promise<void> {
    const existing = await this.paymentRepository.findByInscriptionId(input.inscriptionId, input.eventId)
    if (!existing) return
    if (existing.isConfirmed()) {
      throw new ValidationError('Pagamento já confirmado; não é possível trocar o meio de pagamento')
    }
    if (!existing.asaasPaymentId.startsWith(CASH_ASAAS_PREFIX)) {
      try {
        await asaasService.cancelPayment(existing.asaasPaymentId)
      } catch {
        // Cobrança já cancelada/inexistente no Asaas — prossegue.
      }
    }
    await this.paymentRepository.delete(existing.id, input.eventId, existing.inscriptionId)
  }
}
