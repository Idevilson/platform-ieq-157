import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/lib/services/adminService'
import { EventStatus, InscriptionStatus } from '@/shared/constants'

export const adminEventKeys = {
  all: ['admin', 'events'] as const,
  lists: () => [...adminEventKeys.all, 'list'] as const,
  list: (params?: { status?: EventStatus }) => [...adminEventKeys.lists(), params] as const,
  inscriptions: (eventId: string) => [...adminEventKeys.all, eventId, 'inscriptions'] as const,
  inscriptionsList: (eventId: string, params?: { status?: InscriptionStatus }) =>
    [...adminEventKeys.inscriptions(eventId), params] as const,
}

export function useAdminEventsList(params?: { status?: EventStatus; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: adminEventKeys.list(params),
    queryFn: () => adminService.listEvents(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useAdminEventInscriptions(
  eventId: string,
  params?: { status?: InscriptionStatus; limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: adminEventKeys.inscriptionsList(eventId, params),
    queryFn: () => adminService.listEventInscriptions(eventId, params),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000,
  })
}
