import { NewsStatus } from '@/shared/constants'

export interface NewsPostDTO {
  id: string
  titulo: string
  descricao: string
  conteudo: string
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl: string
  status: NewsStatus
  statusLabel: string
  autorId: string
  autorNome: string
  criadoEm: string | Date
  atualizadoEm: string | Date
  publicadoEm: string | Date | null
}

export interface NewsPostSummaryDTO {
  id: string
  titulo: string
  descricao: string
  youtubeVideoId: string
  thumbnailUrl: string
  status: NewsStatus
  autorNome: string
  publicadoEm: string | Date | null
}

export interface CreateNewsPostRequest {
  slug?: string
  titulo: string
  descricao: string
  conteudo: string
  youtubeUrl: string
  status?: NewsStatus
}

export interface UpdateNewsPostRequest {
  titulo?: string
  descricao?: string
  conteudo?: string
  youtubeUrl?: string
  status?: NewsStatus
}

export interface NewsPostListResponse {
  items: NewsPostSummaryDTO[]
  total: number
  limit: number
  offset: number
}

export interface NewsPostDetailResponse {
  post: NewsPostDTO
}

export interface CreateNewsPostResponse {
  id: string
  titulo: string
  status: NewsStatus
}

export interface UpdateNewsPostResponse {
  id: string
  titulo: string
  status: NewsStatus
}
