'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

interface UseRequirePermissionOptions {
  eventId?: string
  redirectTo?: string
}

export function useRequirePermission(permission: string, options: UseRequirePermissionOptions = {}) {
  const { eventId, redirectTo = '/minha-conta' } = options
  const { user, loading, profileLoading, isAuthenticated, isAdmin, hasPermission } = useAuth()
  const router = useRouter()

  const allowed = isAdmin || hasPermission(permission, eventId)

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (profileLoading || !user?.profile) return
    if (!allowed) router.push(redirectTo)
  }, [loading, profileLoading, isAuthenticated, allowed, user?.profile, redirectTo, router])

  return {
    loading: loading || profileLoading,
    isAuthenticated,
    allowed,
  }
}
