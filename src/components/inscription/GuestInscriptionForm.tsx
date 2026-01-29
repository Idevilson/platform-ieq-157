'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CategorySelector } from './CategorySelector'
import { InscriptionLookup } from './InscriptionLookup'
import { useCreateGuestInscription } from '@/hooks'
import { formatCPF, formatPhone } from '@/lib/formatters'
import { Gender, InscriptionPaymentMethod, INSCRIPTION_PAYMENT_METHOD_LABELS } from '@/shared/constants'

const FIELD_LABELS: Record<string, string> = {
  nome: 'Nome completo',
  email: 'Email',
  cpf: 'CPF',
  telefone: 'Telefone',
  idade: 'Idade',
  sexo: 'Sexo',
}

// Converte idade para data de nascimento (1 de janeiro do ano calculado)
function idadeParaDataNascimento(idade: number): string {
  const anoAtual = new Date().getFullYear()
  const anoNascimento = anoAtual - idade
  return `${anoNascimento}-01-01`
}

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
  idade: number
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
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateCpf, setDuplicateCpf] = useState<string>('')

  // Pré-seleciona a categoria individual se existir
  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      const individualCategory = categories.find(c =>
        c.id.toLowerCase().includes('individual') || c.nome.toLowerCase().includes('individual')
      )
      if (individualCategory) {
        setSelectedCategoryId(individualCategory.id)
      }
    }
  }, [categories, selectedCategoryId])
  const [paymentMethod, setPaymentMethod] = useState<InscriptionPaymentMethod>('PIX')
  const [error, setError] = useState<string | null>(null)
  const createGuestInscription = useCreateGuestInscription()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<GuestFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const selectedSexo = watch('sexo')

  const hasErrors = Object.keys(errors).length > 0 || (isSubmitted && !selectedCategoryId)

  // Scroll para o primeiro campo com erro quando tentar submeter
  useEffect(() => {
    if (isSubmitted && Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
    }
  }, [errors, isSubmitted])

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
          dataNascimento: idadeParaDataNascimento(data.idade),
          sexo: data.sexo,
        },
      },
      {
        onSuccess: (inscription) => onSuccess?.(inscription.id),
        onError: (err) => {
          const errorMessage = err instanceof Error ? err.message : 'Erro ao criar inscricao'
          if (errorMessage.includes('já possui uma inscrição') || errorMessage.includes('Já existe uma inscrição')) {
            setDuplicateCpf(data.cpf)
            setShowDuplicateModal(true)
          } else {
            setError(errorMessage)
          }
        },
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
            className={errors.nome ? 'input-error' : ''}
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
            className={errors.email ? 'input-error' : ''}
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
              className={errors.cpf ? 'input-error' : ''}
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
              className={errors.telefone ? 'input-error' : ''}
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

        <div className="form-row form-row-aligned">
          <div className="form-group">
            <label htmlFor="idade">Idade *</label>
            <div className={`age-input-wrapper ${errors.idade ? 'has-error' : ''}`}>
              <input
                id="idade"
                type="number"
                className="age-input"
                min={1}
                max={120}
                placeholder="Ex: 25"
                {...register('idade', {
                  required: 'Idade e obrigatoria',
                  min: { value: 1, message: 'Idade deve ser maior que 0' },
                  max: { value: 120, message: 'Idade invalida' },
                  valueAsNumber: true,
                })}
                disabled={isLoading}
              />
            </div>
            {errors.idade && <span className="error">{errors.idade.message}</span>}
          </div>

          <div className="form-group">
            <label>Sexo *</label>
            <input type="hidden" {...register('sexo', { required: 'Sexo e obrigatorio' })} />
            <div className="gender-selector">
              <button
                type="button"
                className={`gender-option ${selectedSexo === 'masculino' ? 'selected' : ''} ${errors.sexo && !selectedSexo ? 'has-error' : ''}`}
                onClick={() => !isLoading && setValue('sexo', 'masculino', { shouldValidate: true })}
                disabled={isLoading}
              >
                <span className="gender-icon">👨</span>
                <span className="gender-label">Masculino</span>
                {selectedSexo === 'masculino' && <span className="gender-check">✓</span>}
              </button>
              <button
                type="button"
                className={`gender-option ${selectedSexo === 'feminino' ? 'selected' : ''} ${errors.sexo && !selectedSexo ? 'has-error' : ''}`}
                onClick={() => !isLoading && setValue('sexo', 'feminino', { shouldValidate: true })}
                disabled={isLoading}
              >
                <span className="gender-icon">👩</span>
                <span className="gender-label">Feminino</span>
                {selectedSexo === 'feminino' && <span className="gender-check">✓</span>}
              </button>
            </div>
            {errors.sexo && !selectedSexo && <span className="error">{errors.sexo.message}</span>}
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

      {isSubmitted && hasErrors && (
        <div className="validation-summary">
          <div className="validation-summary-header">
            <svg className="validation-summary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Preencha os campos obrigatorios:</span>
          </div>
          <ul className="validation-summary-list">
            {Object.keys(errors).map((field) => (
              <li key={field}>
                <button
                  type="button"
                  onClick={() => {
                    const element = document.getElementById(field)
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      element.focus()
                    }
                  }}
                  className="validation-summary-link"
                >
                  {FIELD_LABELS[field] || field}
                </button>
              </li>
            ))}
            {!selectedCategoryId && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    document.querySelector('.category-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }}
                  className="validation-summary-link"
                >
                  Categoria
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn-primary btn-large">
        {isLoading ? 'Processando...' : 'Confirmar inscricao'}
      </button>

      <p className="form-note">* Campos obrigatorios. Seus dados serao usados apenas para esta inscricao.</p>

      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDuplicateModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg bg-bg-primary border border-gold/20 rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Inscrição já existe!</h3>
              <p className="text-text-secondary text-sm">
                O CPF <strong className="text-gold">{duplicateCpf}</strong> já possui uma inscrição neste evento.
              </p>
            </div>

            <InscriptionLookup
              initialCpf={duplicateCpf}
              autoSearch={true}
              compact={true}
            />

            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false)
                  setValue('cpf', '')
                }}
                className="btn btn-secondary w-full py-3"
              >
                Fazer inscrição com outro CPF
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
