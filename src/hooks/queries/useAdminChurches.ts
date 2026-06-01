import { useQuery } from '@tanstack/react-query'
import { churchService } from '@/lib/services/churchService'

export const adminChurchKeys = {
  all: ['admin', 'churches'] as const,
  lists: () => [...adminChurchKeys.all, 'list'] as const,
}

export function useAdminChurches() {
  return useQuery({
    queryKey: adminChurchKeys.lists(),
    queryFn: () => churchService.listAdminChurches(),
    staleTime: 2 * 60 * 1000,
  })
}
