import { EventPerk } from '@/server/domain/event/entities/EventPerk'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'

export class GetPerkSummary {
  constructor(private readonly perkRepository: IEventPerkRepository) {}

  async execute(eventId: string): Promise<ReturnType<EventPerk['toSummary']> | null> {
    const perk = await this.perkRepository.findPrimaryByEventId(eventId)
    if (!perk) return null
    return perk.toSummary()
  }
}
