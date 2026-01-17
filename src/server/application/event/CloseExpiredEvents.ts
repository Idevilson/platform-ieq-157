import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'

export interface CloseExpiredEventsOutput {
  closedCount: number
  closedEvents: string[]
}

export class CloseExpiredEvents {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(): Promise<CloseExpiredEventsOutput> {
    const expiredEvents = await this.eventRepository.findExpiredOpenEvents()
    const closedEvents: string[] = []

    for (const event of expiredEvents) {
      event.close()
      await this.eventRepository.update(event)
      closedEvents.push(event.id)
    }

    return {
      closedCount: closedEvents.length,
      closedEvents,
    }
  }
}
