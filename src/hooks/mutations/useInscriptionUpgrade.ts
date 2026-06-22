import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService, RequestUpgradeResponse } from '@/lib/services/adminService'
import { InscriptionPaymentMethod, ShirtSize } from '@/shared/constants'

interface RequestVars {
  eventId: string
  inscriptionId: string
  newCategoryId: string
  metodo: InscriptionPaymentMethod
}

function invalidateInscriptions(queryClient: ReturnType<typeof useQueryClient>, eventId: string) {
  queryClient.invalidateQueries({ queryKey: ['admin', 'events', eventId, 'inscriptions'] })
}

export function useRequestInscriptionUpgrade() {
  const queryClient = useQueryClient()
  return useMutation<RequestUpgradeResponse, Error, RequestVars>({
    mutationFn: ({ eventId, inscriptionId, newCategoryId, metodo }) =>
      adminService.requestInscriptionUpgrade(eventId, inscriptionId, newCategoryId, metodo),
    onSuccess: (_, variables) => invalidateInscriptions(queryClient, variables.eventId),
  })
}

export function useCancelInscriptionUpgrade() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, Error, { eventId: string; inscriptionId: string }>({
    mutationFn: ({ eventId, inscriptionId }) => adminService.cancelInscriptionUpgrade(eventId, inscriptionId),
    onSuccess: (_, variables) => invalidateInscriptions(queryClient, variables.eventId),
  })
}

export function useConfirmUpgradeCash() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean; newCategoryId: string }, Error, { eventId: string; inscriptionId: string }>({
    mutationFn: ({ eventId, inscriptionId }) => adminService.confirmUpgradeCash(eventId, inscriptionId),
    onSuccess: (_, variables) => invalidateInscriptions(queryClient, variables.eventId),
  })
}

export function useUpdateInscriptionDetails() {
  const queryClient = useQueryClient()
  return useMutation<
    void,
    Error,
    { eventId: string; inscriptionId: string; tamanho?: ShirtSize | null; campoMissionario?: string | null }
  >({
    mutationFn: ({ eventId, inscriptionId, tamanho, campoMissionario }) =>
      adminService.updateInscriptionDetails(eventId, inscriptionId, { tamanho, campoMissionario }),
    onSuccess: (_, variables) => invalidateInscriptions(queryClient, variables.eventId),
  })
}

export function useChangeInscriptionPaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation<
    Awaited<ReturnType<typeof adminService.changeInscriptionPaymentMethod>>,
    Error,
    { eventId: string; inscriptionId: string; metodo: InscriptionPaymentMethod }
  >({
    mutationFn: ({ eventId, inscriptionId, metodo }) =>
      adminService.changeInscriptionPaymentMethod(eventId, inscriptionId, metodo),
    onSuccess: (_, variables) => invalidateInscriptions(queryClient, variables.eventId),
  })
}
