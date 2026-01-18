import { useQuery } from '@tanstack/react-query'
import { avisoService } from '@/lib/services/avisoService'

export const avisoKeys = {
  all: ['avisos'] as const,
  lists: () => [...avisoKeys.all, 'list'] as const,
}

export function useAvisosList() {
  return useQuery({
    queryKey: avisoKeys.lists(),
    queryFn: () => avisoService.listAvisos(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
