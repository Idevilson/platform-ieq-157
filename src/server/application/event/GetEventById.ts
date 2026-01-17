import { Event } from '@/server/domain/event/entities/Event'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { EventNotFoundError } from '@/server/domain/shared/errors'

export interface GetEventByIdInput {
  eventId: string
}

export interface GetEventByIdOutput {
  event: ReturnType<Event['toJSON']>
}

export class GetEventById {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: GetEventByIdInput): Promise<GetEventByIdOutput> {
    const event = await this.eventRepository.findById(input.eventId)

    if (!event) {
      throw new EventNotFoundError(input.eventId)
    }

    return { event: event.toJSON() }
  }
}
