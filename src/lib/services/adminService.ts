import { firebaseAuthService } from '@/lib/firebase'
import { EventDTO } from '@/shared/types'
import { EventStatus, InscriptionStatus } from '@/shared/constants'

const API_BASE_URL = '/api/admin'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface EventWithStats extends EventDTO {
  stats: {
    total: number
    confirmado: number
    pendente: number
  }
}

export interface AdminEventListResponse {
  events: EventWithStats[]
  total: number
  limit: number
  offset: number
}

export interface InscriptionWithDetails {
  id: string
  eventId: string
  eventTitulo: string
  categoryId: string
  categoryNome: string
  categoryValor: number
  nome: string
  email: string
  cpf: string
  telefone: string
  status: InscriptionStatus
  statusLabel: string
  valor: number
  valorFormatado: string
  paymentId?: string
  criadoEm: string
  atualizadoEm: string
}

export interface AdminInscriptionListResponse {
  inscriptions: InscriptionWithDetails[]
  total: number
  limit: number
  offset: number
}

export interface CreateEventInput {
  titulo: string
  subtitulo?: string
  descricao: string
  descricaoCompleta?: string
  dataInicio: string
  dataFim?: string
  local: string
  endereco: string
  googleMapsUrl?: string
  whatsappContato?: string
  metodosPagamento?: string[]
  imagemUrl?: string
  categorias?: {
    nome: string
    valor: number // em centavos
    descricao?: string
  }[]
}

export interface CreateEventResponse {
  id: string
  titulo: string
  status: string
  categorias: number
}

export interface UpdateEventStatusResponse {
  id: string
  titulo: string
  status: string
  statusLabel: string
}

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) {
    return { success: false, error: 'Não autenticado' }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
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

export const adminService = {
  async listEvents(params?: {
    status?: EventStatus
    limit?: number
    offset?: number
  }): Promise<AdminEventListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    const endpoint = `/events${query ? `?${query}` : ''}`

    const response = await authFetch<AdminEventListResponse>(endpoint)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao carregar eventos')
  },

  async listEventInscriptions(
    eventId: string,
    params?: {
      status?: InscriptionStatus
      limit?: number
      offset?: number
    }
  ): Promise<AdminInscriptionListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    const endpoint = `/events/${eventId}/inscriptions${query ? `?${query}` : ''}`

    const response = await authFetch<AdminInscriptionListResponse>(endpoint)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao carregar inscrições')
  },

  async createEvent(input: CreateEventInput): Promise<CreateEventResponse> {
    const response = await authFetch<CreateEventResponse>('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao criar evento')
  },

  async updateEventStatus(eventId: string, status: EventStatus): Promise<UpdateEventStatusResponse> {
    const response = await authFetch<UpdateEventStatusResponse>(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })

    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao atualizar status do evento')
  },
}
