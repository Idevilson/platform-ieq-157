// Inscription service for frontend

import { apiClient } from './api'
import { firebaseAuthService } from '@/lib/firebase'
import { InscriptionDTO, CreateInscriptionRequest, GuestDataDTO } from '@/shared/types'
import { InscriptionPaymentMethod, ShirtSize } from '@/shared/constants'
import { BatchLookupResult } from '@/shared/types/inscription'

export interface CreateInscriptionResponse {
  inscription: InscriptionDTO
}

export interface InscriptionLookupResponse {
  inscriptions: InscriptionDTO[]
  batches?: BatchLookupResult[]
}

async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) {
    return { success: false, error: 'Não autenticado' }
  }

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

    if (!response.ok) {
      return { success: false, error: data.error || `Erro: ${response.status}` }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro de rede' }
  }
}

export const inscriptionService = {
  async createInscription(data: CreateInscriptionRequest): Promise<InscriptionDTO> {
    const response = await apiClient.post<CreateInscriptionResponse>('/inscriptions', data)
    if (response.success && response.data) {
      return response.data.inscription
    }
    throw new Error(response.error || 'Erro ao criar inscrição')
  },

  async createGuestInscription(
    eventId: string,
    categoryId: string,
    guestData: GuestDataDTO,
    preferredPaymentMethod?: InscriptionPaymentMethod,
    tamanho?: ShirtSize,
    campoMissionario?: string
  ): Promise<InscriptionDTO> {
    const response = await apiClient.post<CreateInscriptionResponse>('/inscriptions', {
      eventId,
      categoryId,
      guestData,
      preferredPaymentMethod,
      tamanho,
      campoMissionario,
    })
    if (response.success && response.data) {
      return response.data.inscription
    }
    throw new Error(response.error || 'Erro ao criar inscrição')
  },

  async getInscriptionById(inscriptionId: string): Promise<InscriptionDTO> {
    const response = await apiClient.get<{ inscription: InscriptionDTO }>(`/inscriptions/${inscriptionId}`)
    if (response.success && response.data) {
      return response.data.inscription
    }
    throw new Error(response.error || 'Erro ao carregar inscrição')
  },

  async cancelInscription(inscriptionId: string): Promise<void> {
    const response = await apiClient.delete(`/inscriptions/${inscriptionId}`)
    if (!response.success) {
      throw new Error(response.error || 'Erro ao cancelar inscrição')
    }
  },

  async lookupByCPF(cpf: string): Promise<InscriptionDTO[]> {
    const response = await apiClient.get<InscriptionLookupResponse>(`/inscriptions/lookup?cpf=${encodeURIComponent(cpf)}`)
    if (response.success && response.data) {
      return response.data.inscriptions
    }
    throw new Error(response.error || 'Erro ao buscar inscrições')
  },

  async lookupBatchByCPF(cpf: string): Promise<BatchLookupResult[]> {
    const response = await apiClient.get<{ batches: BatchLookupResult[] }>(`/batch-inscriptions/lookup?cpf=${encodeURIComponent(cpf)}`)
    if (response.success && response.data) {
      return response.data.batches
    }
    throw new Error(response.error || 'Erro ao buscar lotes')
  },

  async getMyBatches(eventId?: string): Promise<BatchLookupResult[]> {
    const qs = eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''
    const response = await authFetch<{ batches: BatchLookupResult[] }>(`/batch-inscriptions/my${qs}`)
    if (response.success && response.data) {
      return response.data.batches
    }
    throw new Error(response.error || 'Erro ao buscar lotes')
  },

  async getUserInscriptionByEvent(eventId: string): Promise<InscriptionDTO | null> {
    const response = await authFetch<{ inscription: InscriptionDTO | null }>(`/inscriptions/by-event/${eventId}`, {
      method: 'GET',
    })
    if (response.success && response.data) {
      return response.data.inscription
    }
    if (response.error === 'Não autenticado') {
      return null
    }
    throw new Error(response.error || 'Erro ao buscar inscrição')
  },

  async createUserInscription(data: {
    eventId: string
    categoryId: string
    preferredPaymentMethod?: InscriptionPaymentMethod
    tamanho?: ShirtSize
    campoMissionario?: string
    profileUpdate?: {
      cpf?: string
      telefone?: string
      dataNascimento?: string
      sexo?: 'masculino' | 'feminino'
    }
  }): Promise<InscriptionDTO> {
    const response = await authFetch<CreateInscriptionResponse>('/inscriptions/user', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (response.success && response.data) {
      return response.data.inscription
    }
    throw new Error(response.error || 'Erro ao criar inscrição')
  },

  async updateCampoMissionario(inscriptionId: string, eventId: string, campoMissionario: string): Promise<void> {
    const response = await authFetch(`/inscriptions/${inscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ campoMissionario, eventId }),
    })
    if (!response.success) {
      throw new Error(response.error || 'Erro ao atualizar campo missionário')
    }
  },
}
