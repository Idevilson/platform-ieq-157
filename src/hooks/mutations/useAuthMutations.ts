import { useMutation, useQueryClient } from '@tanstack/react-query'
import { firebaseAuthService } from '@/lib/firebase'
import { api } from '@/lib/api-client'
import { UserDTO } from '@/shared/types'
import { userProfileKeys } from '../queries/useUserProfile'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  email: string
  password: string
  nome: string
}

interface UpdateProfileInput {
  nome?: string
  cpf?: string
  telefone?: string
}

async function syncUserProfile(email: string, displayName: string): Promise<UserDTO> {
  const result = await api.post<{ user: UserDTO }>('/auth/sync-profile', { email, displayName })

  if (!result.success) throw new Error(result.error)

  return result.data.user
}

async function updateUserProfile(data: UpdateProfileInput): Promise<UserDTO> {
  const result = await api.patch<{ user: UserDTO }>('/auth/profile', data)

  if (!result.success) throw new Error(result.error)

  return result.data.user
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: LoginCredentials) =>
      firebaseAuthService.loginWithEmail({ email, password }),
  })
}

export function useLoginWithGoogleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const authResult = await firebaseAuthService.loginWithGoogle()
      const profile = await syncUserProfile(authResult.email, authResult.displayName ?? 'Usuario')

      return { authResult, profile }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userProfileKeys.byId(data.authResult.uid), data.profile)
    },
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async ({ email, password, nome }: RegisterCredentials) => {
      const authResult = await firebaseAuthService.registerWithEmail({ email, password })
      const profile = await syncUserProfile(authResult.email, nome)

      return { authResult, profile }
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => firebaseAuthService.logout(),
    onSuccess: () => queryClient.clear(),
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => firebaseAuthService.sendPasswordReset(email),
  })
}

export function useUpdateProfileMutation(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateUserProfile(data),
    onSuccess: (profile) => {
      queryClient.setQueryData(userProfileKeys.byId(userId), profile)
    },
  })
}
