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

export function useAdminUpdateBatchResponsavel(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ batchId, nome, cpf }: { batchId: string; nome?: string; cpf?: string }) =>
      adminFetch(`/api/admin/batch-inscriptions/${batchId}`, {
        method: 'PATCH',
        body: JSON.stringify({ nome, cpf }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches', eventId] })
    },
  })
}

export function useAdminUpdateBatchParticipants(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      participantes,
    }: {
      batchId: string
      participantes: { nome: string; sexo: string; tamanho?: string }[]
    }) =>
      adminFetch(`/api/admin/batch-inscriptions/${batchId}/participants`, {
        method: 'PUT',
        body: JSON.stringify({ participantes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches', eventId] })
    },
  })
}

export function useAdminRegeneratePayment(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (batchId: string) =>
      adminFetch<{ batch: { id: string; eventId: string } }>(
        `/api/admin/batch-inscriptions/${batchId}/regenerate-payment`,
        { method: 'POST' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches', eventId] })
    },
  })
}
