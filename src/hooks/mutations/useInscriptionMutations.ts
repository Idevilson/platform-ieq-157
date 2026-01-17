import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inscriptionService } from '@/lib/services/inscriptionService'
import { CreateInscriptionRequest, GuestDataDTO } from '@/shared/types'
import { inscriptionKeys } from '../queries/useInscriptions'

interface CreateGuestInscriptionParams {
  eventId: string
  categoryId: string
  guestData: GuestDataDTO
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
    mutationFn: ({ eventId, categoryId, guestData }: CreateGuestInscriptionParams) =>
      inscriptionService.createGuestInscription(eventId, categoryId, guestData),
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
