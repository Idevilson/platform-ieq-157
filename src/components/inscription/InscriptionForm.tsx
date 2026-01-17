'use client'

import { useState } from 'react'
import { CategorySelector } from './CategorySelector'
import { useAuth, useCreateInscription } from '@/hooks'

interface Category {
  id: string
  nome: string
  descricao?: string
  valor: number
  valorFormatado: string
  ordem?: number
}

interface InscriptionFormProps {
  eventId: string
  categories: Category[]
  onSuccess?: (inscriptionId: string) => void
}

export function InscriptionForm({
  eventId,
  categories,
  onSuccess,
}: InscriptionFormProps) {
  const { user, isProfileComplete } = useAuth()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const createInscription = useCreateInscription()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryId) {
      setError('Selecione uma categoria')
      return
    }

    setError(null)

    createInscription.mutate(
      { eventId, categoryId: selectedCategoryId },
      {
        onSuccess: (inscription) => {
          onSuccess?.(inscription.id)
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Erro ao criar inscrição')
        },
      }
    )
  }

  const isLoading = createInscription.isPending

  if (!isProfileComplete) {
    return (
      <div className="inscription-form inscription-form--incomplete-profile">
        <div className="warning-box">
          <h4>Perfil incompleto</h4>
          <p>
            Para se inscrever neste evento, você precisa completar seu perfil com CPF, telefone e outros dados.
          </p>
          <a href="/minha-conta/perfil?complete=true" className="btn-primary">
            Completar perfil
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="inscription-form">
      <div className="inscription-form__user-info">
        <h4>Seus dados</h4>
        <p><strong>Nome:</strong> {user?.profile?.nome}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>CPF:</strong> {user?.profile?.cpfFormatado}</p>
      </div>

      <CategorySelector
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
        disabled={isLoading}
      />

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        disabled={isLoading || !selectedCategoryId}
        className="btn-primary btn-large"
      >
        {isLoading ? 'Processando...' : 'Confirmar inscrição'}
      </button>
    </form>
  )
}
