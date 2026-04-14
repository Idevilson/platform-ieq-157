import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/lib/services/adminService'
import { NewsStatus } from '@/shared/constants'

export const adminQ4newsKeys = {
  all: ['admin', 'q4news'] as const,
  lists: () => [...adminQ4newsKeys.all, 'list'] as const,
}

export function useAdminQ4NewsList(params?: { status?: NewsStatus; limit?: number }) {
  return useQuery({
    queryKey: [...adminQ4newsKeys.lists(), params],
    queryFn: () => adminService.listNewsPosts(params),
    staleTime: 2 * 60 * 1000,
  })
}
