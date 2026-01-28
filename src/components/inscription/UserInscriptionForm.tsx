'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateUserInscription } from '@/hooks/mutations/useInscriptionMutations'
import { formatCPF, formatPhone } from '@/lib/formatters'
import { UserDTO } from '@/shared/types'
import { Gender, InscriptionPaymentMethod, INSCRIPTION_PAYMENT_METHOD_LABELS } from '@/shared/constants'

const FIELD_LABELS: Record<string, string> = {
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

interface MissingFieldsForm {
  cpf?: string
  telefone?: string
  idade?: number
  sexo?: Gender
}

interface UserInscriptionFormProps {
  eventId: string
  categories: Category[]
  user: UserDTO
  onSuccess?: (inscriptionId: string) => void
}

export function UserInscriptionForm({
  eventId,
  categories,
  user,
  onSuccess,
}: UserInscriptionFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

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
  const createUserInscription = useCreateUserInscription()

  const missingCpf = !user.cpf
  const missingTelefone = !user.telefone
  const missingDataNascimento = !user.dataNascimento
  const missingSexo = !user.sexo
  const hasMissingFields = missingCpf || missingTelefone || missingDataNascimento || missingSexo

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<MissingFieldsForm>({
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

  const onSubmit = (data: MissingFieldsForm) => {
    if (!selectedCategoryId) {
      setError('Selecione uma categoria')
      return
    }

    setError(null)

    const profileUpdate: Record<string, string | undefined> = {}
    if (missingCpf && data.cpf) profileUpdate.cpf = data.cpf.replace(/\D/g, '')
    if (missingTelefone && data.telefone) profileUpdate.telefone = data.telefone.replace(/\D/g, '')
    if (missingDataNascimento && data.idade) profileUpdate.dataNascimento = idadeParaDataNascimento(data.idade)
    if (missingSexo && data.sexo) profileUpdate.sexo = data.sexo

    createUserInscription.mutate(
      {
        eventId,
        categoryId: selectedCategoryId,
        preferredPaymentMethod: paymentMethod,
        profileUpdate: Object.keys(profileUpdate).length > 0 ? profileUpdate : undefined,
      },
      {
        onSuccess: (inscription) => onSuccess?.(inscription.id),
        onError: (err) => setError(err instanceof Error ? err.message : 'Erro ao criar inscricao'),
      }
    )
  }

  const isLoading = createUserInscription.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card max-w-xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Seus dados</h3>
        <p className="text-sm text-text-secondary">
          Confirme seus dados para realizar a inscricao.
        </p>
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 mb-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Nome</span>
            <span className="text-sm text-text-primary font-medium">{user.nome}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Email</span>
            <span className="text-sm text-text-primary font-medium">{user.email}</span>
          </div>
          {user.cpf && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">CPF</span>
              <span className="text-sm text-text-primary font-medium">{user.cpfFormatado || formatCPF(user.cpf)}</span>
            </div>
          )}
          {user.telefone && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Telefone</span>
              <span className="text-sm text-text-primary font-medium">{formatPhone(user.telefone)}</span>
            </div>
          )}
        </div>
      </div>

      {hasMissingFields && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Complete os dados faltantes para continuar</span>
          </div>

          {missingCpf && (
            <div className="space-y-2">
              <label htmlFor="cpf" className="block text-sm font-medium text-text-secondary">CPF *</label>
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
                className={`input ${errors.cpf ? 'input-error' : ''}`}
              />
              {errors.cpf && <span className="text-red-400 text-sm">{errors.cpf.message}</span>}
            </div>
          )}

          {missingTelefone && (
            <div className="space-y-2">
              <label htmlFor="telefone" className="block text-sm font-medium text-text-secondary">Telefone *</label>
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
                className={`input ${errors.telefone ? 'input-error' : ''}`}
              />
              {errors.telefone && <span className="text-red-400 text-sm">{errors.telefone.message}</span>}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 items-start">
            {missingDataNascimento && (
              <div className="space-y-2">
                <label htmlFor="idade" className="block text-sm font-medium text-text-secondary">Idade *</label>
                <div className={`flex items-center justify-center h-[5.25rem] rounded-xl border-2 transition-all ${
                  errors.idade
                    ? 'border-red-500/50 bg-white/[0.03]'
                    : 'border-gold/15 bg-white/[0.03] hover:border-gold/40 focus-within:border-gold/40'
                }`}>
                  <input
                    id="idade"
                    type="number"
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
                    className="w-full h-full px-4 bg-transparent border-none text-text-primary text-xl text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-text-muted placeholder:text-base"
                  />
                </div>
                {errors.idade && <span className="text-red-400 text-sm">{errors.idade.message}</span>}
              </div>
            )}

            {missingSexo && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Sexo *</label>
                <input type="hidden" {...register('sexo', { required: 'Sexo e obrigatorio' })} />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`flex flex-col items-center justify-center gap-1 h-[5.25rem] rounded-xl border-2 transition-all ${
                      selectedSexo === 'masculino'
                        ? 'border-gold bg-gold/10'
                        : errors.sexo && !selectedSexo
                        ? 'border-red-500/50 bg-bg-tertiary'
                        : 'border-transparent bg-bg-tertiary hover:border-gold/30'
                    }`}
                    onClick={() => !isLoading && setValue('sexo', 'masculino', { shouldValidate: true })}
                    disabled={isLoading}
                  >
                    <span className="text-2xl">👨</span>
                    <span className={`text-sm font-medium ${selectedSexo === 'masculino' ? 'text-gold' : 'text-text-secondary'}`}>
                      Masculino
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`flex flex-col items-center justify-center gap-1 h-[5.25rem] rounded-xl border-2 transition-all ${
                      selectedSexo === 'feminino'
                        ? 'border-gold bg-gold/10'
                        : errors.sexo && !selectedSexo
                        ? 'border-red-500/50 bg-bg-tertiary'
                        : 'border-transparent bg-bg-tertiary hover:border-gold/30'
                    }`}
                    onClick={() => !isLoading && setValue('sexo', 'feminino', { shouldValidate: true })}
                    disabled={isLoading}
                  >
                    <span className="text-2xl">👩</span>
                    <span className={`text-sm font-medium ${selectedSexo === 'feminino' ? 'text-gold' : 'text-text-secondary'}`}>
                      Feminino
                    </span>
                  </button>
                </div>
                {errors.sexo && !selectedSexo && <span className="text-red-400 text-sm">{errors.sexo.message}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="mb-6">
          <h4 className="text-base font-semibold text-text-primary mb-4">Escolha sua categoria:</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-gold/10 border-gold'
                    : 'bg-bg-tertiary border-transparent hover:border-gold/30'
                }`}
                onClick={() => setSelectedCategoryId(cat.id)}
                disabled={isLoading}
              >
                <h5 className="text-base font-semibold text-text-primary mb-1">{cat.nome}</h5>
                <p className="text-xl font-bold text-gold mb-2">{cat.valorFormatado}</p>
                {cat.descricao && (
                  <p className="text-xs text-text-secondary">{cat.descricao}</p>
                )}
                {selectedCategoryId === cat.id && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gold text-bg-primary text-xs font-bold rounded-full">
                    Selecionado
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-base font-semibold text-text-primary mb-4">Forma de Pagamento:</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
              paymentMethod === 'PIX'
                ? 'bg-gold/10 border-gold'
                : 'bg-bg-tertiary border-transparent hover:border-gold/30'
            }`}
            onClick={() => setPaymentMethod('PIX')}
            disabled={isLoading}
          >
            <svg className="w-10 h-10 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zm1.5 0h1.5V16H16v-1.5zm-3 3H13V19h.5v-1.5zm1.5 0h1.5V19H16v-1.5zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM19 16h.5v.5H19V16zm0 1.5h.5v.5H19v-.5z"/>
            </svg>
            <div className="flex-1">
              <h5 className="text-base font-semibold text-text-primary">{INSCRIPTION_PAYMENT_METHOD_LABELS.PIX}</h5>
              <p className="text-xs text-text-muted">Pagamento instantaneo via QR Code</p>
            </div>
            {paymentMethod === 'PIX' && (
              <span className="text-gold text-xl">✓</span>
            )}
          </button>

          <button
            type="button"
            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
              paymentMethod === 'CASH'
                ? 'bg-gold/10 border-gold'
                : 'bg-bg-tertiary border-transparent hover:border-gold/30'
            }`}
            onClick={() => setPaymentMethod('CASH')}
            disabled={isLoading}
          >
            <svg className="w-10 h-10 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
            <div className="flex-1">
              <h5 className="text-base font-semibold text-text-primary">{INSCRIPTION_PAYMENT_METHOD_LABELS.CASH}</h5>
              <p className="text-xs text-text-muted">Pague presencialmente na igreja</p>
            </div>
            {paymentMethod === 'CASH' && (
              <span className="text-gold text-xl">✓</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {isSubmitted && hasErrors && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Preencha os campos obrigatorios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(errors).map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => {
                  const element = document.getElementById(field)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    element.focus()
                  }
                }}
                className="px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-xs rounded-full hover:bg-red-500/25 transition-colors"
              >
                {FIELD_LABELS[field] || field}
              </button>
            ))}
            {!selectedCategoryId && (
              <button
                type="button"
                onClick={() => {
                  document.querySelector('.category-selector, [class*="grid"][class*="gap-3"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className="px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-xs rounded-full hover:bg-red-500/25 transition-colors"
              >
                Categoria
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-bg-primary font-bold text-lg rounded-xl hover:shadow-gold hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processando...' : 'CONFIRMAR INSCRICAO'}
      </button>

      {hasMissingFields && (
        <p className="mt-4 text-xs text-text-muted text-center">
          * Campos obrigatorios. Seus dados serao salvos no seu perfil.
        </p>
      )}
    </form>
  )
}
