import { useQuery } from '@tanstack/react-query'
import { userService } from '@/lib/services/userService'
import { InscriptionStatus } from '@/shared/constants'

export const userInscriptionKeys = {
  all: ['user-inscriptions'] as const,
  list: (status?: InscriptionStatus) => [...userInscriptionKeys.all, 'list', status] as const,
}

export function useUserInscriptions(params?: {
  status?: InscriptionStatus
  enabled?: boolean
}) {
  return useQuery({
    queryKey: userInscriptionKeys.list(params?.status),
    queryFn: () => userService.getUserInscriptions({ status: params?.status }),
    enabled: params?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
