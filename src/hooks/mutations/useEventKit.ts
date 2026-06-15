import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/lib/services/adminService'
import { KitItemDef } from '@/shared/constants'

export function useConfigureEventKit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, items }: { eventId: string; items: KitItemDef[] }) =>
      adminService.configureEventKit(eventId, items),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] }),
  })
}

export function useDeliverInscriptionKit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, inscriptionId }: { eventId: string; inscriptionId: string }) =>
      adminService.deliverInscriptionKit(eventId, inscriptionId),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['admin', 'events', variables.eventId, 'inscriptions'] }),
  })
}

export function useDeliverBatchKit(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ batchId }: { batchId: string }) =>
      adminService.deliverBatchKit(batchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'batches', eventId] }),
  })
}
