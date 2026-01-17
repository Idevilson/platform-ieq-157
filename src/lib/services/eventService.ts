// Event service for frontend

import { apiClient } from './api'
import { EventDTO, EventSummaryDTO, EventCategoryDTO } from '@/shared/types'

export interface EventListResponse {
  events: EventSummaryDTO[]
}

export interface EventDetailResponse {
  event: EventDTO
}

export interface CategoriesResponse {
  categories: EventCategoryDTO[]
}

export const eventService = {
  async listEvents(): Promise<EventSummaryDTO[]> {
    const response = await apiClient.get<EventListResponse>('/events')
    if (response.success && response.data) {
      return response.data.events
    }
    throw new Error(response.error || 'Erro ao carregar eventos')
  },

  async getEventById(eventId: string): Promise<EventDTO> {
    const response = await apiClient.get<EventDetailResponse>(`/events/${eventId}`)
    if (response.success && response.data) {
      return response.data.event
    }
    throw new Error(response.error || 'Erro ao carregar evento')
  },

  async getEventCategories(eventId: string): Promise<EventCategoryDTO[]> {
    const response = await apiClient.get<CategoriesResponse>(`/events/${eventId}/categories`)
    if (response.success && response.data) {
      return response.data.categories
    }
    throw new Error(response.error || 'Erro ao carregar categorias')
  },
}
