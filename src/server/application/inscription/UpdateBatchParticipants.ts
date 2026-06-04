import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'
import { ValidationError } from '@/server/domain/shared/errors'
import { Gender, ShirtSize } from '@/shared/constants'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'

export interface UpdateBatchParticipantsInput {
  batchId: string
  participantes: { nome: string; sexo: Gender; tamanho?: ShirtSize }[]
}

export interface UpdateBatchParticipantsOutput {
  batch: ReturnType<BatchInscription['toJSON']>
  brindesAlocados: number
  brindesLiberados: number
}

export class UpdateBatchParticipants {
  constructor(
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly eventRepository: IEventRepository,
    private readonly eventPerkRepository: IEventPerkRepository,
  ) {}

  async execute(input: UpdateBatchParticipantsInput): Promise<UpdateBatchParticipantsOutput> {
    const batch = await this.batchRepository.findById(input.batchId)
    if (!batch) throw new ValidationError('Lote não encontrado')
    if (batch.isCancelled()) throw new ValidationError('Lote cancelado não pode ser editado')

    const category = await this.eventRepository.findCategoryById(batch.eventId, batch.categoryId)
    if (!category) throw new ValidationError('Categoria não encontrada')

    const categoryPriceCents = category.getCurrentPrice(new Date()).getCents()

    const { oldCount, oldBrindeCount, oldPerkId } = batch.updateParticipants(
      input.participantes,
      categoryPriceCents,
    )

    const newCount = batch.totalParticipantes
    const delta = newCount - oldCount

    let brindesAlocados = 0
    let brindesLiberados = 0
    let newBrindeCount = oldBrindeCount

    if (oldPerkId) {
      if (delta > 0) {
        const result = await this.eventPerkRepository.incrementBatchAllocation(
          batch.eventId, oldPerkId, batch.id, delta,
        )
        brindesAlocados = result.allocated
        newBrindeCount = oldBrindeCount + brindesAlocados
      } else if (delta < 0) {
        const toRemove = Math.min(Math.abs(delta), oldBrindeCount)
        if (toRemove > 0) {
          await this.eventPerkRepository.deallocateFromBatch(
            batch.eventId, oldPerkId, batch.id, toRemove,
          )
          brindesLiberados = toRemove
          newBrindeCount = oldBrindeCount - toRemove
        }
      }

      for (let i = 0; i < newCount; i++) {
        if (i < newBrindeCount) {
          batch.allocateParticipantBrinde(i, oldPerkId)
        } else {
          batch.markParticipantBrindeUnavailable(i)
        }
      }
    }

    await this.batchRepository.update(batch)

    return { batch: batch.toJSON(), brindesAlocados, brindesLiberados }
  }
}
