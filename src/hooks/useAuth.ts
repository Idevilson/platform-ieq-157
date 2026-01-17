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

  return {
    user,
    loading,
    profileLoading,
    error,
    isAuthenticated,
    isProfileComplete,
    isAdmin,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    updateProfile,
    refreshProfile,
  }
}
