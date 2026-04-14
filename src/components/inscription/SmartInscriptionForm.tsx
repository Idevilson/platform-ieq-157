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
  earlyBirdValor?: number
  earlyBirdValorFormatado?: string
  earlyBirdDeadline?: string
  beneficiosInclusos?: string[]
  valorAtual?: number
  valorAtualFormatado?: string
  earlyBirdAtivo?: boolean
}

interface SmartInscriptionFormProps {
  eventId: string
  eventTitle?: string
  categories: Category[]
  paymentMethods?: string[]
  onSuccess?: (inscriptionId: string) => void
}

export function SmartInscriptionForm({
  eventId,
  eventTitle,
  categories,
  paymentMethods,
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
        eventId={eventId}
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
        paymentMethods={paymentMethods}
        user={user.profile}
        onSuccess={onSuccess}
      />
    )
  }

  return (
    <GuestInscriptionForm
      eventId={eventId}
      categories={categories}
      paymentMethods={paymentMethods}
      onSuccess={onSuccess}
    />
  )
}
