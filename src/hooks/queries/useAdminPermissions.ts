import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/lib/services/adminService'

export function usePermissions() {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => adminService.listPermissions(),
  })
}

export function useAdminUsers(query: string) {
  return useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: () => adminService.listUsers(query || undefined),
  })
}

export function useEventTeam(eventId: string) {
  return useQuery({
    queryKey: ['admin', 'events', eventId, 'team'],
    queryFn: () => adminService.listEventTeam(eventId),
    enabled: !!eventId,
  })
}
