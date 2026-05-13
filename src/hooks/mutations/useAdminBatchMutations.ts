import { useMutation, useQueryClient } from '@tanstack/react-query'
import { firebaseAuthService } from '@/lib/firebase'

async function adminFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) throw new Error('Não autenticado')

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Erro: ${res.status}`)
  return data as T
}

export function useAdminConfirmBatchCash(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (batchId: string) =>
      adminFetch(`/api/admin/batch-inscriptions/${batchId}/confirm-cash`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches', eventId] })
    },
  })
}

export function useAdminDeleteBatch(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (batchId: string) =>
      adminFetch(`/api/admin/batch-inscriptions/${batchId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches', eventId] })
    },
  })
}
