import { useQuery } from '@tanstack/react-query'
import { churchService } from '@/lib/services/churchService'

export const churchKeys = {
  all: ['churches'] as const,
  publicList: () => [...churchKeys.all, 'public'] as const,
}

export function usePublicChurches() {
  return useQuery({
    queryKey: churchKeys.publicList(),
    queryFn: () => churchService.listPublic(),
    staleTime: 5 * 60 * 1000,
  })
}
