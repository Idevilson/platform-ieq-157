// Shared Church types - used by both frontend and backend

export const SEDE_REDENCAO_SLUG = 'sede-redencao'

export const CHURCH_MODAL_DISMISS_KEY = 'church_modal_dismissed_session'

export interface ChurchDTO {
  id: string
  nome: string
  slug: string
  cidade?: string
  estado?: string
  ativo: boolean
  totalMembros: number
  criadoEm: string
  atualizadoEm: string
}

export interface ChurchSummaryDTO {
  id: string
  nome: string
  slug: string
  cidade?: string
  estado?: string
  ativo: boolean
}

export interface ChurchMemberDTO {
  userId: string
  nome: string
  email: string
  vinculadoEm?: string
}

export interface CreateChurchRequest {
  nome: string
  slug?: string
  cidade?: string
  estado?: string
}

export interface UpdateChurchRequest {
  nome?: string
  cidade?: string
  estado?: string
  ativo?: boolean
}

export interface SetUserChurchRequest {
  churchId: string
}

export interface PublicChurchListResponse {
  items: ChurchSummaryDTO[]
}

export interface UserChurchResponse {
  churchId: string | null
  church: ChurchSummaryDTO | null
}

export interface AdminChurchListResponse {
  items: ChurchDTO[]
}

export interface ChurchDetailResponse {
  church: ChurchDTO
}

export interface ChurchMembersResponse {
  items: ChurchMemberDTO[]
  total: number
  limit: number
  offset: number
}

export interface CreateChurchResponse {
  id: string
  slug: string
  nome: string
}

export interface UpdateChurchResponse {
  id: string
  slug: string
  nome: string
  ativo: boolean
}

export type ChurchBadgeVariant = 'header' | 'account' | 'home' | 'compact'

export type ChurchErrorCode =
  | 'CHURCH_NOT_FOUND'
  | 'CHURCH_SLUG_ALREADY_EXISTS'
  | 'CANNOT_DELETE_CHURCH_WITH_MEMBERS'
  | 'USER_NOT_LINKED_TO_CHURCH'
  | 'CHURCH_INACTIVE'
