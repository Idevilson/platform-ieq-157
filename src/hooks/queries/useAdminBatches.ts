import { useQuery } from '@tanstack/react-query'
import { firebaseAuthService } from '@/lib/firebase'
import { AdminBatchListItem } from '@/shared/types/inscription'

async function fetchAdminBatches(eventId: string): Promise<AdminBatchListItem[]> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) throw new Error('Não autenticado')

  const res = await fetch(`/api/admin/events/${eventId}/batch-inscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erro ao buscar lotes')
  return data.batches as AdminBatchListItem[]
}

export function useAdminBatches(eventId: string) {
  return useQuery({
    queryKey: ['admin', 'batches', eventId],
    queryFn: () => fetchAdminBatches(eventId),
    enabled: !!eventId,
    staleTime: 60 * 1000,
  })
}
