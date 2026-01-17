import { Event } from '@/server/domain/event/entities/Event'
import { IEventRepository, ListEventsParams } from '@/server/domain/event/repositories/IEventRepository'
import { EventStatus, PaginatedResult } from '@/server/domain/shared/types'

export interface ListEventsInput {
  status?: EventStatus
  visibleOnly?: boolean
  limit?: number
  offset?: number
}

export interface ListEventsOutput {
  events: ReturnType<Event['toJSON']>[]
  total: number
  limit: number
  offset: number
}

export class ListEvents {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: ListEventsInput = {}): Promise<ListEventsOutput> {
    const params: ListEventsParams = {
      status: input.status,
      visibleOnly: input.visibleOnly,
      limit: input.limit,
      offset: input.offset,
    }

    const result: PaginatedResult<Event> = await this.eventRepository.findAll(params)

    return {
      events: result.items.map(event => event.toJSON()),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  }
}
