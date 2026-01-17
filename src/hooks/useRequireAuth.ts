'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

interface UseRequireAuthOptions {
  redirectTo?: string
  requireProfile?: boolean
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/login', requireProfile = false } = options
  const { user, loading, isAuthenticated, isProfileComplete } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requireProfile && !isProfileComplete) {
      router.push('/minha-conta/perfil?complete=true')
    }
  }, [loading, isAuthenticated, isProfileComplete, requireProfile, redirectTo, router])

  return {
    user,
    loading,
    isAuthenticated,
    isProfileComplete,
  }
}
