import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { ValidationError } from '@/server/domain/shared/errors'
import { CreatePaymentForInscription, CreatePaymentOutput } from './CreatePaymentForInscription'

export interface RegeneratePaymentForInscriptionInput {
  eventId: string
  inscriptionId: string
}

/**
 * Força a substituição do pagamento de uma inscrição avulsa: cancela a cobrança
 * anterior no Asaas, remove o registro persistido e gera uma nova cobrança.
 * Útil quando o QR/cobrança antigo é inválido (ex.: gerado em sandbox).
 */
export class RegeneratePaymentForInscription {
  constructor(
    private readonly createPayment: CreatePaymentForInscription,
    private readonly paymentRepository: IPaymentRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
  ) {}

  async execute(input: RegeneratePaymentForInscriptionInput): Promise<CreatePaymentOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) {
      throw new ValidationError('Inscrição não encontrada')
    }

    if (inscription.preferredPaymentMethod === 'CASH') {
      throw new ValidationError('Inscrição com pagamento em dinheiro não possui cobrança online')
    }

    const existing = await this.paymentRepository.findByInscriptionId(input.inscriptionId, input.eventId)

    let metodo: 'PIX' | 'CREDIT_CARD' = 'PIX'

    if (existing) {
      if (existing.isConfirmed()) {
        throw new ValidationError('Pagamento já confirmado não pode ser regerado')
      }

      metodo = existing.metodoPagamento === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX'

      try {
        await asaasService.cancelPayment(existing.asaasPaymentId)
      } catch {
        // Cobrança já cancelada ou inexistente no Asaas — prossegue com a regeração
      }

      await this.paymentRepository.delete(existing.id, input.eventId, existing.inscriptionId)
    }

    return this.createPayment.execute({
      eventId: input.eventId,
      inscriptionId: input.inscriptionId,
      metodo,
    })
  }
}
