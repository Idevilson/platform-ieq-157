'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CategorySelector } from './CategorySelector'
import { useCreateGuestInscription } from '@/hooks'
import { formatCPF, formatPhone } from '@/lib/formatters'

interface Category {
  id: string
  nome: string
  valor: number
  valorFormatado: string
  descricao?: string
  ordem?: number
}

interface GuestFormData {
  nome: string
  email: string
  cpf: string
  telefone: string
  observacoes?: string
}

interface GuestInscriptionFormProps {
  eventId: string
  categories: Category[]
  onSuccess?: (inscriptionId: string) => void
}

export function GuestInscriptionForm({
  eventId,
  categories,
  onSuccess,
}: GuestInscriptionFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const createGuestInscription = useCreateGuestInscription()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestFormData>()

  const handleCPFChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('cpf', formatCPF(event.target.value))
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('telefone', formatPhone(event.target.value))
  }

  const onSubmit = (data: GuestFormData) => {
    if (!selectedCategoryId) {
      setError('Selecione uma categoria')
      return
    }

    setError(null)

    createGuestInscription.mutate(
      {
        eventId,
        categoryId: selectedCategoryId,
        guestData: {
          nome: data.nome,
          email: data.email,
          cpf: data.cpf.replace(/\D/g, ''),
          telefone: data.telefone.replace(/\D/g, ''),
        },
      },
      {
        onSuccess: (inscription) => onSuccess?.(inscription.id),
        onError: (err) => setError(err instanceof Error ? err.message : 'Erro ao criar inscricao'),
      }
    )
  }

  const isLoading = createGuestInscription.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="guest-inscription-form">
      <div className="form-section">
        <h4>Seus dados</h4>

        <div className="form-group">
          <label htmlFor="nome">Nome completo *</label>
          <input
            id="nome"
            type="text"
            {...register('nome', {
              required: 'Nome e obrigatorio',
              minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
            })}
            placeholder="Seu nome completo"
            disabled={isLoading}
          />
          {errors.nome && <span className="error">{errors.nome.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email e obrigatorio',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalido' },
            })}
            placeholder="seu@email.com"
            disabled={isLoading}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cpf">CPF *</label>
            <input
              id="cpf"
              type="text"
              {...register('cpf', {
                required: 'CPF e obrigatorio',
                pattern: { value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, message: 'CPF invalido' },
              })}
              placeholder="000.000.000-00"
              onChange={handleCPFChange}
              maxLength={14}
              disabled={isLoading}
            />
            {errors.cpf && <span className="error">{errors.cpf.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone *</label>
            <input
              id="telefone"
              type="tel"
              {...register('telefone', {
                required: 'Telefone e obrigatorio',
                pattern: { value: /^\(\d{2}\) \d{4,5}-\d{4}$/, message: 'Telefone invalido' },
              })}
              placeholder="(00) 00000-0000"
              onChange={handlePhoneChange}
              maxLength={15}
              disabled={isLoading}
            />
            {errors.telefone && <span className="error">{errors.telefone.message}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="observacoes">Observacoes (opcional)</label>
        <textarea
          id="observacoes"
          {...register('observacoes')}
          placeholder="Alguma informacao adicional para a organizacao do evento?"
          disabled={isLoading}
          rows={3}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={isLoading || !selectedCategoryId} className="btn-primary btn-large">
        {isLoading ? 'Processando...' : 'Confirmar inscricao'}
      </button>

      <p className="form-note">* Campos obrigatorios. Seus dados serao usados apenas para esta inscricao.</p>
    </form>
  )
}
