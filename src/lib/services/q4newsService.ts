import { apiClient } from './api'
import { NewsPostSummaryDTO, NewsPostDTO, NewsPostListResponse, NewsPostDetailResponse } from '@/shared/types'

export const q4newsService = {
  async listPublished(limit?: number): Promise<NewsPostSummaryDTO[]> {
    const params = new URLSearchParams()
    if (limit) params.set('limit', limit.toString())
    const query = params.toString()
    const response = await apiClient.get<NewsPostListResponse>(`/q4news${query ? `?${query}` : ''}`)
    if (response.success && response.data) {
      const data = response.data as unknown as { items?: NewsPostSummaryDTO[]; posts?: NewsPostSummaryDTO[] }
      const items = data.items ?? data.posts ?? []
      return items
    }
    throw new Error(response.error || 'Erro ao carregar noticias')
  },

  async getById(id: string): Promise<NewsPostDTO> {
    const response = await apiClient.get<NewsPostDetailResponse>(`/q4news/${id}`)
    if (response.success && response.data) return response.data.post
    throw new Error(response.error || 'Erro ao carregar noticia')
  },
}
