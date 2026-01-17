import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { UserDTO } from '@/shared/types'

export const userProfileKeys = {
  all: ['user-profile'] as const,
  byId: (userId: string) => ['user-profile', userId] as const,
}

async function fetchUserProfile(): Promise<UserDTO | null> {
  const result = await api.get<{ user: UserDTO }>('/auth/me')

  if (!result.success) return null

  return result.data.user
}

export function useUserProfile(userId?: string) {
  return useQuery({
    queryKey: userProfileKeys.byId(userId ?? ''),
    queryFn: fetchUserProfile,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}
