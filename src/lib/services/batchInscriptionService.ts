import { firebaseAuthService } from '@/lib/firebase'
import {
  CreateBatchInscriptionRequest,
  BatchInscriptionDTO,
  BatchLookupResult,
} from '@/shared/types/inscription'

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) return { success: false, error: 'Não autenticado' }

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })
    const data = await response.json()
    if (!response.ok) return { success: false, error: data.error || `Erro: ${response.status}` }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro de rede' }
  }
}

async function publicFetch<T>(
  endpoint: string,
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`/api${endpoint}`)
    const data = await response.json()
    if (!response.ok) return { success: false, error: data.error || `Erro: ${response.status}` }
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro de rede' }
  }
}

export const batchInscriptionService = {
  async createBatch(data: CreateBatchInscriptionRequest): Promise<BatchInscriptionDTO> {
    const result = await authFetch<{ batch: BatchInscriptionDTO }>('/batch-inscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!result.success || !result.data) throw new Error(result.error ?? 'Erro ao criar lote')
    return result.data.batch
  },

  async createPayment(batchId: string): Promise<BatchInscriptionDTO> {
    const result = await authFetch<{ batch: BatchInscriptionDTO }>(
      `/batch-inscriptions/${batchId}/payment`,
      { method: 'POST' },
    )
    if (!result.success || !result.data) throw new Error(result.error ?? 'Erro ao criar pagamento')
    return result.data.batch
  },

  async lookupByResponsavelCPF(cpf: string): Promise<BatchLookupResult[]> {
    const result = await publicFetch<{ batches: BatchLookupResult[] }>(
      `/batch-inscriptions/lookup?cpf=${encodeURIComponent(cpf)}`,
    )
    if (!result.success || !result.data) return []
    return result.data.batches
  },
}
