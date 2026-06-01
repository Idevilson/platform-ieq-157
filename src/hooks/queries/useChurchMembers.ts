import { useQuery } from '@tanstack/react-query'
import { churchService } from '@/lib/services/churchService'

export const churchMembersKeys = {
  all: ['admin', 'churches', 'members'] as const,
  list: (churchId: string, params?: { search?: string; limit?: number; offset?: number }) =>
    [...churchMembersKeys.all, churchId, params] as const,
}

export function useChurchMembers(
  churchId: string,
  params?: { search?: string; limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: churchMembersKeys.list(churchId, params),
    queryFn: () => churchService.listChurchMembers(churchId, params),
    enabled: !!churchId,
    staleTime: 2 * 60 * 1000,
  })
}
