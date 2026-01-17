// Inscription service for frontend

import { apiClient } from './api'
import { InscriptionDTO, CreateInscriptionRequest, GuestDataDTO } from '@/shared/types'

export interface CreateInscriptionResponse {
  inscription: InscriptionDTO
}

export interface InscriptionLookupResponse {
  inscriptions: InscriptionDTO[]
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
    guestData: GuestDataDTO
  ): Promise<InscriptionDTO> {
    const response = await apiClient.post<CreateInscriptionResponse>('/inscriptions', {
      eventId,
      categoryId,
      guestData,
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
    const response = await apiClient.post<InscriptionLookupResponse>('/inscriptions/lookup', { cpf })
    if (response.success && response.data) {
      return response.data.inscriptions
    }
    throw new Error(response.error || 'Erro ao buscar inscrições')
  },
}
