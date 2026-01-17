
import { Event } from '../entities/Event'
import { EventCategory } from '../entities/EventCategory'
import { EventStatus, PaginationParams, PaginatedResult } from '@/server/domain/shared/types'

export interface ListEventsParams extends PaginationParams {
  status?: EventStatus
  visibleOnly?: boolean
}

export interface IEventRepository {
  findById(id: string): Promise<Event | null>
  findAll(params?: ListEventsParams): Promise<PaginatedResult<Event>>
  findExpiredOpenEvents(): Promise<Event[]>
  save(event: Event): Promise<void>
  update(event: Event): Promise<void>
  delete(id: string): Promise<void>

  // Categories
  findCategoryById(eventId: string, categoryId: string): Promise<EventCategory | null>
  findCategoriesByEventId(eventId: string): Promise<EventCategory[]>
  saveCategory(eventId: string, category: EventCategory): Promise<void>
  deleteCategory(eventId: string, categoryId: string): Promise<void>
}
