import { useQuery } from '@tanstack/react-query'
import { inscriptionService } from '@/lib/services/inscriptionService'

export const inscriptionKeys = {
  all: ['inscriptions'] as const,
  detail: (inscriptionId: string) => [...inscriptionKeys.all, inscriptionId] as const,
  lookup: (cpf: string) => [...inscriptionKeys.all, 'lookup', cpf] as const,
  lookupWithEvent: (cpf: string, eventId: string) => [...inscriptionKeys.all, 'lookup', cpf, eventId] as const,
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
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
