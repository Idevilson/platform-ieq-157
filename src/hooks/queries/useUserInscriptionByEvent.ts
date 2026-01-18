import { useQuery } from '@tanstack/react-query'
import { inscriptionService } from '@/lib/services/inscriptionService'

export const userInscriptionByEventKeys = {
  all: ['user-inscription-by-event'] as const,
  byEvent: (eventId: string) => [...userInscriptionByEventKeys.all, eventId] as const,
}

export function useUserInscriptionByEvent(eventId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userInscriptionByEventKeys.byEvent(eventId),
    queryFn: () => inscriptionService.getUserInscriptionByEvent(eventId),
    enabled: options?.enabled !== false && !!eventId,
    staleTime: 2 * 60 * 1000,
  })
}
