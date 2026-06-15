import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/lib/services/adminService'

export function useAuditLogs(limit = 100) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', limit],
    queryFn: () => adminService.listAuditLogs(limit),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  })
}
