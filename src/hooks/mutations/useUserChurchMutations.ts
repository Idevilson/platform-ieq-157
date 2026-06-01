import { useMutation, useQueryClient } from '@tanstack/react-query'
import { churchService } from '@/lib/services/churchService'
import { userChurchKeys } from '@/hooks/queries/useUserChurch'
import { userProfileKeys } from '@/providers/auth-provider'

export function useSetUserChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (churchId: string) => churchService.setUserChurch(churchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userChurchKeys.all })
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all })
    },
  })
}

export function useClearUserChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => churchService.clearUserChurch(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userChurchKeys.all })
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all })
    },
  })
}
