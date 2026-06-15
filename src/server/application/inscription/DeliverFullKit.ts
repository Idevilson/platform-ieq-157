import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { IAuditLogRepository } from '@/server/domain/audit/repositories/IAuditLogRepository'
import { AuditLog } from '@/server/domain/audit/entities/AuditLog'
import { ValidationError } from '@/server/domain/shared/errors'
import { KitItemDef } from '@/shared/constants'
import { resolveInscriptionTarget } from '../audit/resolveInscriptionName'

export type KitDeliveryTarget =
  | { kind: 'inscription'; inscriptionId: string }
  | { kind: 'batch'; batchId: string }

export interface DeliverFullKitInput {
  eventId: string
  target: KitDeliveryTarget
  actorUserId: string
  actorNome?: string
}

export class DeliverFullKit {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly auditLogRepository?: IAuditLogRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  async execute(input: DeliverFullKitInput) {
    const event = await this.eventRepository.findById(input.eventId)
    if (!event) throw new ValidationError('Evento não encontrado')
    if (event.kitItems.length === 0) throw new ValidationError('Kit não configurado para este evento')

    const hasLed = event.kitItems.some((i) => i.condicionalAoBrinde)

    if (input.target.kind === 'inscription') {
      const inscription = await this.inscriptionRepository.findById(input.target.inscriptionId, input.eventId)
      if (!inscription) throw new ValidationError('Inscrição não encontrada')
      if (!inscription.isConfirmed()) throw new ValidationError('Apenas inscrições confirmadas recebem o kit')

      const temBrinde = inscription.temBrinde === true
      const aplicaveis = this.applicableItems(event.kitItems, temBrinde)
      const novos = this.markAll(aplicaveis, inscription.kitDeliveries, (id) =>
        inscription.setKitDelivery(id, true, input.actorUserId, input.actorNome),
      )
      inscription.recomputeKitPending(aplicaveis.map((i) => i.id))
      await this.inscriptionRepository.update(inscription)

      const comLed = hasLed ? temBrinde : undefined
      if (novos > 0) {
        const { nome, cpf } = await resolveInscriptionTarget(inscription, this.userRepository)
        await this.registerAudit(input, 'inscription', inscription.id, nome, cpf, comLed)
      }
      return { kitDeliveries: inscription.toJSON().kitDeliveries, comLed }
    }

    const batch = await this.batchRepository.findById(input.target.batchId)
    if (!batch) throw new ValidationError('Lote não encontrado')
    if (!batch.isConfirmed()) throw new ValidationError('Apenas lotes confirmados recebem o kit')

    const brindeCount = batch.participantes.filter((p) => p.temBrinde).length
    const aplicaveis = this.applicableItems(event.kitItems, brindeCount > 0)
    const novos = this.markAll(aplicaveis, batch.kitDeliveries, (id) =>
      batch.setKitDelivery(id, true, input.actorUserId, input.actorNome),
    )
    batch.recomputeKitPending(aplicaveis.map((i) => i.id))
    await this.batchRepository.update(batch)

    const comLed = hasLed ? brindeCount > 0 : undefined
    if (novos > 0) {
      await this.registerAudit(input, 'batch', batch.id, batch.responsavel.nome, batch.responsavel.cpf, comLed, batch.totalParticipantes)
    }
    return { kitDeliveries: batch.toJSON().kitDeliveries, comLed }
  }

  private applicableItems(items: KitItemDef[], temBrinde: boolean): KitItemDef[] {
    return items.filter((i) => !i.condicionalAoBrinde || temBrinde)
  }

  private markAll(
    aplicaveis: KitItemDef[],
    deliveries: { itemId: string; entregue: boolean }[],
    deliver: (itemId: string) => void,
  ): number {
    let novos = 0
    for (const item of aplicaveis) {
      const already = deliveries.some((d) => d.itemId === item.id && d.entregue)
      if (!already) {
        deliver(item.id)
        novos++
      }
    }
    return novos
  }

  private async registerAudit(
    input: DeliverFullKitInput,
    targetKind: 'inscription' | 'batch',
    targetId: string,
    targetNome: string,
    targetCpf: string,
    comLed: boolean | undefined,
    totalParticipantes?: number,
  ): Promise<void> {
    if (!this.auditLogRepository) return
    try {
      await this.auditLogRepository.append(
        AuditLog.create({
          type: 'kit_delivery',
          actorId: input.actorUserId,
          actorNome: input.actorNome ?? '',
          eventId: input.eventId,
          targetKind,
          targetId,
          targetNome,
          targetCpf,
          totalParticipantes,
          comLed,
        }),
      )
    } catch (error) {
      console.error('[DeliverFullKit] Falha ao registrar auditoria:', error)
    }
  }
}
