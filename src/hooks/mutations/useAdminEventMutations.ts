import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService, CreateEventInput, CreateEventResponse, SendDailyReportResponse, UpdateEventStatusResponse, ConfirmInscriptionResponse, RegenerateInscriptionPaymentResponse } from '@/lib/services/adminService'
import { EventStatus } from '@/shared/constants'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation<CreateEventResponse, Error, CreateEventInput>({
    mutationFn: (input) => adminService.createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    },
  })
}

export function useChangeEventSlug() {
  const queryClient = useQueryClient()

  return useMutation<{ id: string; oldId: string }, Error, { eventId: string; newSlug: string }>({
    mutationFn: ({ eventId, newSlug }) => adminService.changeEventSlug(eventId, newSlug),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events', data.oldId] })
      queryClient.invalidateQueries({ queryKey: ['events', data.id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient()

  return useMutation<UpdateEventStatusResponse, Error, { eventId: string; status: EventStatus }>({
    mutationFn: ({ eventId, status }) => adminService.updateEventStatus(eventId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events', data.id] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteInscription() {
  const queryClient = useQueryClient()

  return useMutation<
    { inscriptionDeleted: boolean; paymentCancelled: boolean; asaasPaymentCancelled: boolean },
    Error,
    { eventId: string; inscriptionId: string }
  >({
    mutationFn: ({ eventId, inscriptionId }) => adminService.deleteInscription(eventId, inscriptionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', variables.eventId, 'inscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['inscriptions'] })
    },
  })
}

export function useConfirmInscription() {
  const queryClient = useQueryClient()

  return useMutation<ConfirmInscriptionResponse, Error, { inscriptionId: string; eventId: string }>({
    mutationFn: ({ inscriptionId, eventId }) => adminService.confirmInscription(inscriptionId, eventId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', variables.eventId, 'inscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['inscriptions'] })
    },
  })
}

export function useRegenerateInscriptionPayment() {
  const queryClient = useQueryClient()

  return useMutation<RegenerateInscriptionPaymentResponse, Error, { eventId: string; inscriptionId: string }>({
    mutationFn: ({ eventId, inscriptionId }) => adminService.regenerateInscriptionPayment(eventId, inscriptionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', variables.eventId, 'inscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['inscriptions'] })
    },
  })
}

export function useSendDailyReport() {
  return useMutation<SendDailyReportResponse, Error, { eventId?: string; dryRun?: boolean } | void>({
    mutationFn: (vars) => adminService.sendDailyReport(vars ?? undefined),
  })
}
