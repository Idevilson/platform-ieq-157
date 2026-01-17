// User service for frontend

import { firebaseAuthService } from '@/lib/firebase'
import { InscriptionStatus } from '@/shared/constants'

const API_BASE_URL = '/api/users/me'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface UserInscriptionDTO {
  id: string
  eventId: string
  eventTitulo: string
  eventDataInicio: string
  categoryId: string
  categoryNome: string
  valor: number
  valorFormatado: string
  status: InscriptionStatus
  statusLabel: string
  paymentId?: string
  criadoEm: string
  atualizadoEm: string
}

export interface UserInscriptionsResponse {
  inscriptions: UserInscriptionDTO[]
}

async function authFetch<T>(endpoint: string): Promise<ApiResponse<T>> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) {
    return { success: false, error: 'Nao autenticado' }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || `Erro: ${response.status}` }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de rede',
    }
  }
}

export const userService = {
  async getUserInscriptions(params?: {
    status?: InscriptionStatus
  }): Promise<UserInscriptionsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)

    const query = searchParams.toString()
    const endpoint = `/inscriptions${query ? `?${query}` : ''}`

    const response = await authFetch<UserInscriptionsResponse>(endpoint)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao carregar inscricoes')
  },
}
