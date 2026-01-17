'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { firebaseAuthService, AuthResult } from '@/lib/firebase'
import { api } from '@/lib/api-client'
import { UserDTO } from '@/shared/types'

export interface AuthUser extends AuthResult {
  profile?: UserDTO
}

interface UpdateProfileInput {
  nome?: string
  cpf?: string
  telefone?: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  profileLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string, nome: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: UpdateProfileInput) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const userProfileKeys = {
  all: ['user-profile'] as const,
  byId: (userId: string) => ['user-profile', userId] as const,
}

async function fetchUserProfile(): Promise<UserDTO | null> {
  const result = await api.get<{ user: UserDTO }>('/auth/me')

  if (!result.success) return null

  return result.data.user
}

async function syncProfile(email: string, displayName: string): Promise<UserDTO> {
  const result = await api.post<{ user: UserDTO }>('/auth/sync-profile', { email, displayName })

  if (!result.success) throw new Error(result.error)

  return result.data.user
}

async function updateUserProfile(data: UpdateProfileInput): Promise<UserDTO> {
  const result = await api.patch<{ user: UserDTO }>('/auth/profile', data)

  if (!result.success) throw new Error(result.error)

  return result.data.user
}

function useAuthState() {
  const [authState, setAuthState] = useState<AuthResult | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((authResult) => {
      setAuthState(authResult)
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  return { authState, setAuthState, authLoading, setAuthLoading, error, setError }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { authState, setAuthState, authLoading, setAuthLoading, error, setError } = useAuthState()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: userProfileKeys.byId(authState?.uid ?? ''),
    queryFn: fetchUserProfile,
    enabled: !!authState?.uid,
    staleTime: 5 * 60 * 1000,
  })

  const user: AuthUser | null = authState ? { ...authState, profile: profile ?? undefined } : null

  const refreshProfile = useCallback(async () => {
    if (!authState?.uid) return

    await queryClient.invalidateQueries({ queryKey: userProfileKeys.byId(authState.uid) })
  }, [authState?.uid, queryClient])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setAuthLoading(true)

    try {
      const authResult = await firebaseAuthService.loginWithEmail({ email, password })
      setAuthState(authResult)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(message)
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [setAuthState, setAuthLoading, setError])

  const loginWithGoogle = useCallback(async () => {
    setError(null)
    setAuthLoading(true)

    try {
      const authResult = await firebaseAuthService.loginWithGoogle()
      const userProfile = await syncProfile(authResult.email, authResult.displayName ?? 'Usuario')

      queryClient.setQueryData(userProfileKeys.byId(authResult.uid), userProfile)
      setAuthState(authResult)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login com Google'
      setError(message)
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [queryClient, setAuthState, setAuthLoading, setError])

  const register = useCallback(async (email: string, password: string, nome: string) => {
    setError(null)
    setAuthLoading(true)

    try {
      const authResult = await firebaseAuthService.registerWithEmail({ email, password })
      const userProfile = await syncProfile(authResult.email, nome)

      queryClient.setQueryData(userProfileKeys.byId(authResult.uid), userProfile)
      setAuthState(authResult)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar'
      setError(message)
      throw err
    } finally {
      setAuthLoading(false)
    }
  }, [queryClient, setAuthState, setAuthLoading, setError])

  const logoutUser = useCallback(async () => {
    setError(null)

    try {
      await firebaseAuthService.logout()
      queryClient.clear()
      setAuthState(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sair'
      setError(message)
      throw err
    }
  }, [queryClient, setAuthState, setError])

  const resetPassword = useCallback(async (email: string) => {
    setError(null)

    try {
      await firebaseAuthService.sendPasswordReset(email)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar email de recuperacao'
      setError(message)
      throw err
    }
  }, [setError])

  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    if (!authState) throw new Error('Usuario nao autenticado')

    setError(null)

    try {
      const updatedProfile = await updateUserProfile(data)
      queryClient.setQueryData(userProfileKeys.byId(authState.uid), updatedProfile)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      setError(message)
      throw err
    }
  }, [authState, queryClient, setError])

  const value: AuthContextValue = {
    user,
    loading: authLoading,
    profileLoading: !!authState && profileLoading,
    error,
    login,
    loginWithGoogle,
    register,
    logout: logoutUser,
    resetPassword,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuthContext must be used within an AuthProvider')

  return context
}
