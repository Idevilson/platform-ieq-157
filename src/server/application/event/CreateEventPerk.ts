import { v4 as uuidv4 } from 'uuid'
import { EventPerk } from '@/server/domain/event/entities/EventPerk'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { EventNotFoundError } from '@/server/domain/shared/errors'
import { createPerkSchema, CreatePerkInput } from './schemas'

export interface CreateEventPerkInput extends CreatePerkInput {
  eventId: string
}

export class CreateEventPerk {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly perkRepository: IEventPerkRepository,
  ) {}

  async execute(input: CreateEventPerkInput): Promise<ReturnType<EventPerk['toJSON']>> {
    const data = createPerkSchema.parse(input)

    const event = await this.eventRepository.findById(input.eventId)
    if (!event) {
      throw new EventNotFoundError(input.eventId)
    }

    const perk = EventPerk.create(uuidv4(), {
      eventId: input.eventId,
      nome: data.nome,
      descricao: data.descricao,
      limiteEstoque: data.limiteEstoque,
      categoriaId: data.categoriaId ?? null,
    })

    await this.perkRepository.save(perk)
    return perk.toJSON()
  }
}
