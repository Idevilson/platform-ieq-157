'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks'
import Link from 'next/link'

interface RegisterFormData {
  nome: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterForm() {
  const { register: registerUser, error: authError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await registerUser(data.email, data.password, data.nome)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="nome" className="block text-sm font-medium text-text-secondary">
            Nome completo
          </label>
          <input
            id="nome"
            type="text"
            {...register('nome', {
              required: 'Nome é obrigatório',
              minLength: {
                value: 2,
                message: 'Nome deve ter pelo menos 2 caracteres',
              },
            })}
            placeholder="Seu nome completo"
            disabled={isLoading}
            className="input"
          />
          {errors.nome && <span className="text-xs text-red-500">{errors.nome.message}</span>}
        </div>

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
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
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
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: 'Confirmação de senha é obrigatória',
              validate: (value) => value === password || 'As senhas não conferem',
            })}
            placeholder="••••••••"
            disabled={isLoading}
            className="input"
          />
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
          )}
        </div>
      </div>

      {(error || authError) && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500 text-center">
          {error || authError}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
      </button>

      <div className="flex items-center justify-center gap-2 text-sm pt-2">
        <span className="text-text-muted">Já tem uma conta?</span>
        <Link href="/login" className="text-gold hover:text-gold-light transition-colors no-underline">
          Fazer login
        </Link>
      </div>
    </form>
  )
}
