'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks'
import Link from 'next/link'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { login, error: authError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await login(data.email, data.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email inválido',
            },
          })}
          placeholder="seu@email.com"
          disabled={isLoading}
          className="input"
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
          Senha
        </label>
        <input
          id="password"
          type="password"
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter pelo menos 6 caracteres',
            },
          })}
          placeholder="••••••••"
          disabled={isLoading}
          className="input"
        />
        {errors.password && (
          <span className="text-xs text-red-500">{errors.password.message}</span>
        )}
      </div>

      {(error || authError) && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500 text-center">
          {error || authError}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>

      <div className="flex items-center justify-center gap-3 text-sm pt-2">
        <Link href="/recuperar-senha" className="text-text-secondary hover:text-gold transition-colors no-underline">
          Esqueci minha senha
        </Link>
        <span className="text-text-muted">|</span>
        <Link href="/cadastro" className="text-text-secondary hover:text-gold transition-colors no-underline">
          Criar conta
        </Link>
      </div>
    </form>
  )
}
