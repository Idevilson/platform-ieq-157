'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

interface UseRequireAdminOptions {
  redirectTo?: string
}

export function useRequireAdmin(options: UseRequireAdminOptions = {}) {
  const { redirectTo = '/' } = options
  const { user, loading, profileLoading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Numa aba nova, a auth resolve antes do perfil (que traz o role). Sem esperar
    // o perfil, isAdmin fica false transitoriamente e redirecionaria por engano.
    if (profileLoading || !user?.profile) return

    if (!isAdmin) {
      router.push(redirectTo)
    }
  }, [loading, profileLoading, isAuthenticated, isAdmin, user?.profile, redirectTo, router])

  return {
    user,
    loading: loading || profileLoading,
    isAuthenticated,
    isAdmin,
  }
}
