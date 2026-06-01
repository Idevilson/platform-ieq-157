import { useQuery } from '@tanstack/react-query'
import { churchService } from '@/lib/services/churchService'

export const userChurchKeys = {
  all: ['user', 'church'] as const,
  current: () => [...userChurchKeys.all, 'current'] as const,
}

export function useUserChurch(enabled = true) {
  return useQuery({
    queryKey: userChurchKeys.current(),
    queryFn: () => churchService.getUserChurch(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
