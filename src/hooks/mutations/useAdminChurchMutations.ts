import { useMutation, useQueryClient } from '@tanstack/react-query'
import { churchService } from '@/lib/services/churchService'
import type { CreateChurchRequest, UpdateChurchRequest } from '@/shared/types'
import { adminChurchKeys } from '@/hooks/queries/useAdminChurches'
import { churchMembersKeys } from '@/hooks/queries/useChurchMembers'
import { churchKeys } from '@/hooks/queries/useChurches'

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: adminChurchKeys.all })
  queryClient.invalidateQueries({ queryKey: churchKeys.all })
}

export function useCreateChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateChurchRequest) => churchService.createChurch(input),
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useUpdateChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ churchId, ...input }: { churchId: string } & UpdateChurchRequest) =>
      churchService.updateChurch(churchId, input),
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useDeleteChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (churchId: string) => churchService.deleteChurch(churchId),
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useAdminRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ churchId, userId }: { churchId: string; userId: string }) =>
      churchService.adminRemoveMember(churchId, userId),
    onSuccess: (_, { churchId }) => {
      queryClient.invalidateQueries({ queryKey: churchMembersKeys.all })
      queryClient.invalidateQueries({ queryKey: adminChurchKeys.all })
      void churchId
    },
  })
}
