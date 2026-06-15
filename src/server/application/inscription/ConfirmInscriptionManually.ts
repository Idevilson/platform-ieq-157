import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { IAuditLogRepository } from '@/server/domain/audit/repositories/IAuditLogRepository'
import { AuditLog } from '@/server/domain/audit/entities/AuditLog'
import { InscriptionNotFoundError, ValidationError } from '@/server/domain/shared/errors'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { allocateInscriptionPerk } from './allocateInscriptionPerk'
import { resolveInscriptionTarget } from '../audit/resolveInscriptionName'

export interface ConfirmInscriptionManuallyInput {
  eventId: string
  inscriptionId: string
  confirmedBy: string
  confirmedByNome?: string
  requireCash?: boolean
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
    private readonly paymentRepository?: IPaymentRepository,
    private readonly perkRepository?: IEventPerkRepository,
    private readonly auditLogRepository?: IAuditLogRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  async execute(input: ConfirmInscriptionManuallyInput): Promise<ConfirmInscriptionManuallyOutput> {
    await this.validateEvent(input.eventId)
    const inscription = await this.findInscription(input.inscriptionId, input.eventId)

    this.validatePendingStatus(inscription)
    if (input.requireCash && !inscription.isCashPayment()) {
      throw new ValidationError('Sem permissão para confirmar inscrições que não são em dinheiro')
    }

    const asaasPaymentCancelled = await this.cancelAsaasPaymentIfExists(inscription, input.eventId)

    inscription.confirmManually(input.confirmedBy, input.confirmedByNome)
    if (this.perkRepository) {
      await allocateInscriptionPerk(this.perkRepository, input.eventId, inscription)
    }
    await this.inscriptionRepository.save(inscription)

    await this.registerAudit(inscription, input)

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

  private async registerAudit(inscription: Inscription, input: ConfirmInscriptionManuallyInput): Promise<void> {
    if (!this.auditLogRepository) return
    try {
      const { nome, cpf } = await resolveInscriptionTarget(inscription, this.userRepository)
      await this.auditLogRepository.append(
        AuditLog.create({
          type: 'cash_confirm',
          actorId: input.confirmedBy,
          actorNome: input.confirmedByNome ?? '',
          eventId: input.eventId,
          targetKind: 'inscription',
          targetId: inscription.id,
          targetNome: nome,
          targetCpf: cpf,
        }),
      )
    } catch (error) {
      console.error('[ConfirmInscriptionManually] Falha ao registrar auditoria:', error)
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
