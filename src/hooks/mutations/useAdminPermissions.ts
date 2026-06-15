import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/lib/services/adminService'
import { UserPermissionGrant } from '@/shared/constants'

export function useCreatePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { key: string; label: string; description?: string }) => adminService.createPermission(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] }),
  })
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, ...input }: { key: string; label: string; description?: string }) =>
      adminService.updatePermission(key, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] }),
  })
}

export function useDeletePermission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (key: string) => adminService.deletePermission(key),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] }),
  })
}

export function useSetUserPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, grants }: { userId: string; grants: UserPermissionGrant[] }) =>
      adminService.setUserPermissions(userId, grants),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    },
  })
}
