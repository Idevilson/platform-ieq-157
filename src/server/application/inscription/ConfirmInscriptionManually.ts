import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { InscriptionNotFoundError, ValidationError } from '@/server/domain/shared/errors'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'

export interface ConfirmInscriptionManuallyInput {
  eventId: string
  inscriptionId: string
  confirmedBy: string
}

export interface ConfirmInscriptionManuallyOutput {
  success: boolean
  inscription: {
    id: string
    status: string
    paymentId?: string
  }
  asaasPaymentCancelled?: boolean
}

export class ConfirmInscriptionManually {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository,
    private readonly paymentRepository?: IPaymentRepository
  ) {}

  async execute(input: ConfirmInscriptionManuallyInput): Promise<ConfirmInscriptionManuallyOutput> {
    await this.validateEvent(input.eventId)
    const inscription = await this.findInscription(input.inscriptionId, input.eventId)

    this.validatePendingStatus(inscription)

    const asaasPaymentCancelled = await this.cancelAsaasPaymentIfExists(inscription, input.eventId)

    inscription.confirmManually(input.confirmedBy)
    await this.inscriptionRepository.save(inscription)

    return {
      success: true,
      inscription: {
        id: inscription.id,
        status: inscription.status,
        paymentId: inscription.paymentId,
      },
      asaasPaymentCancelled,
    }
  }

  private async validateEvent(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId)
    if (!event) {
      throw new ValidationError('Evento não encontrado')
    }
  }

  private async findInscription(inscriptionId: string, eventId: string): Promise<Inscription> {
    const inscription = await this.inscriptionRepository.findById(inscriptionId, eventId)
    if (!inscription) {
      throw new InscriptionNotFoundError(inscriptionId)
    }
    return inscription
  }

  private validatePendingStatus(inscription: Inscription): void {
    if (!inscription.isPending()) {
      throw new ValidationError('Apenas inscrições pendentes podem ser confirmadas')
    }
  }

  private async cancelAsaasPaymentIfExists(inscription: Inscription, eventId: string): Promise<boolean> {
    if (!this.paymentRepository) {
      return false
    }

    const payment = await this.paymentRepository.findByInscriptionId(inscription.id, eventId)
    if (!payment) {
      return false
    }

    const asaasPaymentId = payment.asaasPaymentId
    if (!asaasPaymentId) {
      return false
    }

    try {
      await asaasService.cancelPayment(asaasPaymentId)
      payment.markAsCancelled()
      await this.paymentRepository.update(payment, eventId)
      return true
    } catch (error) {
      console.error('Erro ao cancelar pagamento no Asaas:', error)
      return false
    }
  }
}
