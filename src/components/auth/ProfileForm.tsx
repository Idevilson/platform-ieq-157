'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks'

interface ProfileFormData {
  nome: string
  cpf: string
  telefone: string
}

interface ProfileFormProps {
  onSuccess?: () => void
  isCompletionFlow?: boolean
}

export function ProfileForm({ onSuccess, isCompletionFlow = false }: ProfileFormProps) {
  const { user, updateProfile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>()

  useEffect(() => {
    if (user?.profile) {
      setValue('nome', user.profile.nome || '')
      setValue('cpf', user.profile.cpfFormatado || '')
      setValue('telefone', user.profile.telefone || '')
    }
  }, [user, setValue])

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setValue('cpf', formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue('telefone', formatted)
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await updateProfile({
        nome: data.nome,
        cpf: data.cpf.replace(/\D/g, ''),
        telefone: data.telefone.replace(/\D/g, ''),
      })
      await refreshProfile()
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {isCompletionFlow && (
        <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg text-sm text-text-secondary">
          <p>Complete seu perfil para continuar. Essas informações são necessárias para sua inscrição.</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="nome" className="block text-sm font-medium text-text-secondary">
          Nome completo
        </label>
        <input
          id="nome"
          type="text"
          className="input"
          {...register('nome', {
            required: 'Nome é obrigatório',
            minLength: {
              value: 2,
              message: 'Nome deve ter pelo menos 2 caracteres',
            },
          })}
          placeholder="Seu nome completo"
          disabled={isLoading}
        />
        {errors.nome && (
          <span className="text-sm text-red-500">{errors.nome.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="cpf" className="block text-sm font-medium text-text-secondary">
          CPF
        </label>
        <input
          id="cpf"
          type="text"
          className="input"
          {...register('cpf', {
            required: 'CPF é obrigatório',
            pattern: {
              value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
              message: 'CPF inválido (use o formato 000.000.000-00)',
            },
          })}
          placeholder="000.000.000-00"
          onChange={handleCPFChange}
          maxLength={14}
          disabled={isLoading}
        />
        {errors.cpf && (
          <span className="text-sm text-red-500">{errors.cpf.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="telefone" className="block text-sm font-medium text-text-secondary">
          Telefone
        </label>
        <input
          id="telefone"
          type="tel"
          className="input"
          {...register('telefone', {
            required: 'Telefone é obrigatório',
            pattern: {
              value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
              message: 'Telefone inválido (use o formato (00) 00000-0000)',
            },
          })}
          placeholder="(00) 00000-0000"
          onChange={handlePhoneChange}
          maxLength={15}
          disabled={isLoading}
        />
        {errors.telefone && (
          <span className="text-sm text-red-500">{errors.telefone.message}</span>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-500">
          Perfil atualizado com sucesso!
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </form>
  )
}
