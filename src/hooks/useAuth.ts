'use client'

import { useAuthContext } from '@/providers'

export function useAuth() {
  const {
    user,
    loading,
    profileLoading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateProfile,
    refreshProfile,
  } = useAuthContext()

  const isAuthenticated = !!user
  const isProfileComplete = !!user?.profile?.isProfileComplete
  const isAdmin = user?.profile?.role === 'admin'
  const permissions = user?.profile?.permissions ?? []

  const hasPermission = (key: string, eventId?: string): boolean => {
    if (isAdmin) return true
    const grant = permissions.find((g) => g.key === key)
    if (!grant) return false
    if (grant.eventIds.includes('*')) return true
    if (!eventId) return false
    return grant.eventIds.includes(eventId)
  }

  return {
    user,
    loading,
    profileLoading,
    error,
    isAuthenticated,
    isProfileComplete,
    isAdmin,
    permissions,
    hasPermission,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateProfile,
    refreshProfile,
  }
}
