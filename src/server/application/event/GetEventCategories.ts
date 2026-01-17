import { EventCategory } from '@/server/domain/event/entities/EventCategory'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { EventNotFoundError } from '@/server/domain/shared/errors'

export interface GetEventCategoriesInput {
  eventId: string
}

export interface GetEventCategoriesOutput {
  categories: ReturnType<EventCategory['toJSON']>[]
}

export class GetEventCategories {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: GetEventCategoriesInput): Promise<GetEventCategoriesOutput> {
    // Verify event exists
    const event = await this.eventRepository.findById(input.eventId)
    if (!event) {
      throw new EventNotFoundError(input.eventId)
    }

    const categories = await this.eventRepository.findCategoriesByEventId(input.eventId)

    return {
      categories: categories.map(category => category.toJSON()),
    }
  }
}
