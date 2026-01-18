// Aviso service for frontend

import { apiClient } from './api'

export interface Aviso {
  id: string
  titulo: string
  descricao: string
  data: string
  categoria: string
  destaque?: boolean
}

export interface AvisosResponse {
  avisos: Aviso[]
}

export const avisoService = {
  async listAvisos(): Promise<Aviso[]> {
    const response = await apiClient.get<AvisosResponse>('/avisos')
    if (response.success && response.data) {
      return response.data.avisos
    }
    throw new Error(response.error || 'Erro ao carregar avisos')
  },
}
