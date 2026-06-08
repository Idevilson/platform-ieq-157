import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inscriptionService } from '@/lib/services/inscriptionService'
import { CreateInscriptionRequest, GuestDataDTO } from '@/shared/types'
import { InscriptionPaymentMethod, ShirtSize } from '@/shared/constants'
import { inscriptionKeys } from '../queries/useInscriptions'
import { userInscriptionKeys } from '../queries/useUserInscriptions'

interface CreateGuestInscriptionParams {
  eventId: string
  categoryId: string
  guestData: GuestDataDTO
  preferredPaymentMethod?: InscriptionPaymentMethod
  tamanho?: ShirtSize
  campoMissionario?: string
}

interface CreateUserInscriptionParams {
  eventId: string
  categoryId: string
  preferredPaymentMethod?: InscriptionPaymentMethod
  tamanho?: ShirtSize
  campoMissionario?: string
  profileUpdate?: {
    cpf?: string
    telefone?: string
    dataNascimento?: string
    sexo?: 'masculino' | 'feminino'
  }
}

export function useCreateInscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInscriptionRequest) => inscriptionService.createInscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inscriptionKeys.all })
    },
  })
}

export function useCreateGuestInscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, categoryId, guestData, preferredPaymentMethod, tamanho, campoMissionario }: CreateGuestInscriptionParams) =>
      inscriptionService.createGuestInscription(eventId, categoryId, guestData, preferredPaymentMethod, tamanho, campoMissionario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inscriptionKeys.all })
    },
  })
}

export function useCancelInscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inscriptionId: string) => inscriptionService.cancelInscription(inscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inscriptionKeys.all })
    },
  })
}

export function useCreateUserInscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateUserInscriptionParams) =>
      inscriptionService.createUserInscription(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inscriptionKeys.all })
      queryClient.invalidateQueries({ queryKey: userInscriptionKeys.all })
    },
  })
}

export function useUpdateCampoMissionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ inscriptionId, eventId, campoMissionario }: { inscriptionId: string; eventId: string; campoMissionario: string }) =>
      inscriptionService.updateCampoMissionario(inscriptionId, eventId, campoMissionario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inscriptionKeys.all })
      queryClient.invalidateQueries({ queryKey: userInscriptionKeys.all })
    },
  })
}
