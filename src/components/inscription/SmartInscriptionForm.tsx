'use client'

import { useAuth, useUserInscriptionByEvent } from '@/hooks'
import { GuestInscriptionForm } from './GuestInscriptionForm'
import { UserInscriptionForm } from './UserInscriptionForm'
import { AlreadyInscribedCard } from './AlreadyInscribedCard'

interface Category {
  id: string
  nome: string
  valor: number
  valorFormatado: string
  descricao?: string
  ordem?: number
}

interface SmartInscriptionFormProps {
  eventId: string
  eventTitle?: string
  categories: Category[]
  onSuccess?: (inscriptionId: string) => void
}

export function SmartInscriptionForm({
  eventId,
  eventTitle,
  categories,
  onSuccess,
}: SmartInscriptionFormProps) {
  const { user, isAuthenticated, loading: authLoading, profileLoading } = useAuth()

  const {
    data: existingInscription,
    isLoading: inscriptionLoading,
  } = useUserInscriptionByEvent(eventId, { enabled: isAuthenticated })

  const isLoading = authLoading || profileLoading || (isAuthenticated && inscriptionLoading)

  if (isLoading) {
    return (
      <div className="card max-w-xl mx-auto text-center py-12">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Carregando...</p>
      </div>
    )
  }

  if (isAuthenticated && existingInscription) {
    return (
      <AlreadyInscribedCard
        inscription={existingInscription}
        eventTitle={eventTitle}
        categoryName={categories.find(c => c.id === existingInscription.categoryId)?.nome}
      />
    )
  }

  if (isAuthenticated && user?.profile) {
    return (
      <UserInscriptionForm
        eventId={eventId}
        categories={categories}
        user={user.profile}
        onSuccess={onSuccess}
      />
    )
  }

  return (
    <GuestInscriptionForm
      eventId={eventId}
      categories={categories}
      onSuccess={onSuccess}
    />
  )
}
