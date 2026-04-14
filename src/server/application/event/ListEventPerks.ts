import { EventPerk } from '@/server/domain/event/entities/EventPerk'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'

export class ListEventPerks {
  constructor(private readonly perkRepository: IEventPerkRepository) {}

  async execute(eventId: string): Promise<ReturnType<EventPerk['toJSON']>[]> {
    const perks = await this.perkRepository.findByEventId(eventId)
    return perks.map((p) => p.toJSON())
  }
}
