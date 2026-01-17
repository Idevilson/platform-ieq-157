import { useQuery } from '@tanstack/react-query'
import { eventService } from '@/lib/services/eventService'

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  detail: (eventId: string) => [...eventKeys.all, eventId] as const,
  categories: (eventId: string) => [...eventKeys.all, eventId, 'categories'] as const,
}

export function useEventsList() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => eventService.listEvents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useEventById(eventId?: string) {
  return useQuery({
    queryKey: eventKeys.detail(eventId!),
    queryFn: () => eventService.getEventById(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useEventCategories(eventId?: string) {
  return useQuery({
    queryKey: eventKeys.categories(eventId!),
    queryFn: () => eventService.getEventCategories(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
