import { useQuery } from '@tanstack/react-query'
import { inscriptionService } from '@/lib/services/inscriptionService'

export const inscriptionKeys = {
  all: ['inscriptions'] as const,
  detail: (inscriptionId: string) => [...inscriptionKeys.all, inscriptionId] as const,
  lookup: (cpf: string) => [...inscriptionKeys.all, 'lookup', cpf] as const,
  lookupWithEvent: (cpf: string, eventId: string) => [...inscriptionKeys.all, 'lookup', cpf, eventId] as const,
  batchLookup: (cpf: string) => ['batches', 'lookup', cpf] as const,
  myBatches: (eventId?: string) => ['batches', 'my', eventId ?? ''] as const,
}

export function useInscriptionById(inscriptionId?: string) {
  return useQuery({
    queryKey: inscriptionKeys.detail(inscriptionId!),
    queryFn: () => inscriptionService.getInscriptionById(inscriptionId!),
    enabled: !!inscriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useInscriptionLookup(cpf?: string, enabled = true) {
  return useQuery({
    queryKey: inscriptionKeys.lookup(cpf!),
    queryFn: () => inscriptionService.lookupByCPF(cpf!),
    enabled: !!cpf && enabled,
    staleTime: 2 * 60 * 1000,
  })
}

export function useBatchLookup(cpf?: string, eventId?: string) {
  return useQuery({
    queryKey: inscriptionKeys.batchLookup(cpf!),
    queryFn: async () => {
      const all = await inscriptionService.lookupBatchByCPF(cpf!)
      return eventId ? all.filter(b => b.eventId === eventId) : all
    },
    enabled: !!cpf,
    staleTime: 2 * 60 * 1000,
  })
}

export function useMyBatches(eventId?: string, enabled = true) {
  return useQuery({
    queryKey: inscriptionKeys.myBatches(eventId),
    queryFn: () => inscriptionService.getMyBatches(eventId),
    enabled,
    staleTime: 2 * 60 * 1000,
  })
}
