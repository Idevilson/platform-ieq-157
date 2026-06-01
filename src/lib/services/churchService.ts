import { firebaseAuthService } from '@/lib/firebase'
import { apiClient } from './api'
import type {
  ChurchDTO,
  ChurchMembersResponse,
  ChurchSummaryDTO,
  CreateChurchRequest,
  CreateChurchResponse,
  PublicChurchListResponse,
  UpdateChurchRequest,
  UpdateChurchResponse,
  UserChurchResponse,
} from '@/shared/types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) return { success: false, error: 'Não autenticado' }

  try {
    const response = await fetch(`/api${endpoint}`, {
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
    return { success: false, error: error instanceof Error ? error.message : 'Erro de rede' }
  }
}

export const churchService = {
  async listPublic(): Promise<ChurchSummaryDTO[]> {
    const response = await apiClient.get<PublicChurchListResponse>('/churches')
    if (response.success && response.data) return response.data.items
    throw new Error(response.error || 'Erro ao carregar igrejas')
  },

  async getUserChurch(): Promise<UserChurchResponse> {
    const response = await authFetch<UserChurchResponse>('/user/church')
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao buscar igreja do usuário')
  },

  async setUserChurch(churchId: string): Promise<void> {
    const response = await authFetch<{ ok: boolean }>('/user/church', {
      method: 'PUT',
      body: JSON.stringify({ churchId }),
    })
    if (!response.success) throw new Error(response.error || 'Erro ao vincular igreja')
  },

  async clearUserChurch(): Promise<void> {
    const response = await authFetch<{ ok: boolean }>('/user/church', { method: 'DELETE' })
    if (!response.success) throw new Error(response.error || 'Erro ao remover vínculo')
  },

  async listAdminChurches(): Promise<ChurchDTO[]> {
    const response = await authFetch<{ items: ChurchDTO[] }>('/admin/churches')
    if (response.success && response.data) return response.data.items
    throw new Error(response.error || 'Erro ao listar igrejas')
  },

  async createChurch(input: CreateChurchRequest): Promise<CreateChurchResponse> {
    const response = await authFetch<CreateChurchResponse>('/admin/churches', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao criar igreja')
  },

  async updateChurch(churchId: string, input: UpdateChurchRequest): Promise<UpdateChurchResponse> {
    const response = await authFetch<UpdateChurchResponse>(`/admin/churches/${churchId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao atualizar igreja')
  },

  async deleteChurch(churchId: string): Promise<void> {
    const response = await authFetch<{ ok: boolean }>(`/admin/churches/${churchId}`, {
      method: 'DELETE',
    })
    if (!response.success) throw new Error(response.error || 'Erro ao excluir igreja')
  },

  async listChurchMembers(
    churchId: string,
    params?: { search?: string; limit?: number; offset?: number }
  ): Promise<ChurchMembersResponse> {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    const query = searchParams.toString()
    const response = await authFetch<ChurchMembersResponse>(
      `/admin/churches/${churchId}/members${query ? `?${query}` : ''}`
    )
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao listar membros')
  },

  async adminRemoveMember(churchId: string, userId: string): Promise<void> {
    const response = await authFetch<{ ok: boolean }>(
      `/admin/churches/${churchId}/members/${userId}`,
      { method: 'DELETE' }
    )
    if (!response.success) throw new Error(response.error || 'Erro ao remover vínculo')
  },
}
