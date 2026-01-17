'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

interface UseRequireAdminOptions {
  redirectTo?: string
}

export function useRequireAdmin(options: UseRequireAdminOptions = {}) {
  const { redirectTo = '/' } = options
  const { user, loading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      router.push(redirectTo)
    }
  }, [loading, isAuthenticated, isAdmin, redirectTo, router])

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
  }
}
