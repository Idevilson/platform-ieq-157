'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CategorySelector } from './CategorySelector'
import { useCreateGuestInscription } from '@/hooks'
import { formatCPF, formatPhone } from '@/lib/formatters'
import { Gender, InscriptionPaymentMethod, INSCRIPTION_PAYMENT_METHOD_LABELS } from '@/shared/constants'

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
  dataNascimento: string
  sexo: Gender
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
  const [paymentMethod, setPaymentMethod] = useState<InscriptionPaymentMethod>('PIX')
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
        preferredPaymentMethod: paymentMethod,
        guestData: {
          nome: data.nome,
          email: data.email,
          cpf: data.cpf.replace(/\D/g, ''),
          telefone: data.telefone.replace(/\D/g, ''),
          dataNascimento: data.dataNascimento,
          sexo: data.sexo,
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dataNascimento">Data de Nascimento *</label>
            <input
              id="dataNascimento"
              type="date"
              {...register('dataNascimento', {
                required: 'Data de nascimento e obrigatoria',
              })}
              disabled={isLoading}
            />
            {errors.dataNascimento && <span className="error">{errors.dataNascimento.message}</span>}
          </div>

          <div className="form-group">
            <label>Sexo *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="masculino"
                  {...register('sexo', { required: 'Sexo e obrigatorio' })}
                  disabled={isLoading}
                />
                <span>Masculino</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="feminino"
                  {...register('sexo', { required: 'Sexo e obrigatorio' })}
                  disabled={isLoading}
                />
                <span>Feminino</span>
              </label>
            </div>
            {errors.sexo && <span className="error">{errors.sexo.message}</span>}
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

      <div className="form-section">
        <h4>Forma de Pagamento</h4>
        <div className="payment-method-selector">
          <label
            className={`payment-method-option ${paymentMethod === 'PIX' ? 'selected' : ''}`}
            onClick={() => !isLoading && setPaymentMethod('PIX')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="PIX"
              checked={paymentMethod === 'PIX'}
              onChange={() => setPaymentMethod('PIX')}
              disabled={isLoading}
            />
            <div className="payment-method-content">
              <svg className="payment-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zm1.5 0h1.5V16H16v-1.5zm-3 3H13V19h.5v-1.5zm1.5 0h1.5V19H16v-1.5zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM19 16h.5v.5H19V16zm0 1.5h.5v.5H19v-.5z"/>
              </svg>
              <span>{INSCRIPTION_PAYMENT_METHOD_LABELS.PIX}</span>
              <small>Pagamento instantaneo via QR Code</small>
            </div>
          </label>
          <label
            className={`payment-method-option ${paymentMethod === 'CASH' ? 'selected' : ''}`}
            onClick={() => !isLoading && setPaymentMethod('CASH')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="CASH"
              checked={paymentMethod === 'CASH'}
              onChange={() => setPaymentMethod('CASH')}
              disabled={isLoading}
            />
            <div className="payment-method-content">
              <svg className="payment-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
              <span>{INSCRIPTION_PAYMENT_METHOD_LABELS.CASH}</span>
              <small>Pague presencialmente na igreja</small>
            </div>
          </label>
        </div>
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
