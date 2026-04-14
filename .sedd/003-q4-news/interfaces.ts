// ============================================================
// Q4-News — Jornal Digital da Igreja
// Feature 003 — TypeScript Interfaces
// ============================================================

// ---- Status & Constants ----

export type NewsStatus = 'rascunho' | 'publicado'

export const NEWS_STATUSES: readonly NewsStatus[] = ['rascunho', 'publicado'] as const

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
}

// ---- Domain Entity Props ----

export interface NewsPostProps {
  id: string
  titulo: string
  descricao: string
  conteudo: string
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl: string
  status: NewsStatus
  autorId: string
  autorNome: string
  criadoEm: Date
  atualizadoEm: Date
  publicadoEm: Date | null
}

// ---- Domain DTOs ----

export interface CreateNewsPostDTO {
  titulo: string
  descricao: string
  conteudo: string
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl: string
  status: NewsStatus
  autorId: string
  autorNome: string
}

export interface UpdateNewsPostDTO {
  titulo?: string
  descricao?: string
  conteudo?: string
  youtubeUrl?: string
  youtubeVideoId?: string
  thumbnailUrl?: string
  status?: NewsStatus
}

// ---- Repository Interface ----

export interface ListNewsPostsParams {
  status?: NewsStatus
  limit?: number
  offset?: number
}

export interface PaginatedNewsResult {
  items: NewsPostDTO[]
  total: number
  limit: number
  offset: number
}

export interface INewsPostRepository {
  findById(id: string): Promise<NewsPostProps | null>
  findAll(params?: ListNewsPostsParams): Promise<PaginatedNewsResult>
  save(post: NewsPostProps): Promise<void>
  update(post: NewsPostProps): Promise<void>
  delete(id: string): Promise<void>
}

// ---- API DTOs (Frontend) ----

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
  criadoEm: string
  atualizadoEm: string
  publicadoEm: string | null
}

export interface NewsPostSummaryDTO {
  id: string
  titulo: string
  descricao: string
  youtubeVideoId: string
  thumbnailUrl: string
  status: NewsStatus
  autorNome: string
  publicadoEm: string | null
}

// ---- API Request/Response ----

export interface CreateNewsPostRequest {
  slug?: string
  titulo: string
  descricao: string
  conteudo: string
  youtubeUrl: string
}

export interface UpdateNewsPostRequest {
  titulo?: string
  descricao?: string
  conteudo?: string
  youtubeUrl?: string
  status?: NewsStatus
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

export interface NewsPostListResponse {
  items: NewsPostSummaryDTO[]
  total: number
  limit: number
  offset: number
}

export interface NewsPostDetailResponse {
  post: NewsPostDTO
}

// ---- Permission ----

export const Q4_NEWS_PERMISSION = 'adm-q4-news'

// ---- YouTube Utilities ----

export interface YouTubeVideoInfo {
  videoId: string
  thumbnailUrl: string
  embedUrl: string
}
