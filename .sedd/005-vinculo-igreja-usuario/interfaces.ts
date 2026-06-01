// ============================================================
// vinculo-igreja-usuario — Vínculo de Usuário com Igreja
// Feature 005 — TypeScript Interfaces
// ============================================================
//
// Modelo: 1 usuário pertence a, no máximo, 1 igreja por vez.
// O sistema suporta N igrejas cadastradas; o usuário escolhe uma.
// ============================================================

// ---- Constants ----

export const SEDE_REDENCAO_SLUG = 'sede-redencao'

export const CHURCH_MODAL_DISMISS_KEY = 'church_modal_dismissed_session'

// ---- Domain Entity Props ----

export interface ChurchProps {
  id: string
  nome: string
  slug: string
  cidade?: string
  estado?: string
  ativo: boolean
  totalMembros: number
  criadoEm: Date
  atualizadoEm: Date
}

// ---- Domain DTOs ----

export interface CreateChurchDTO {
  nome: string
  slug?: string
  cidade?: string
  estado?: string
}

export interface UpdateChurchDTO {
  nome?: string
  cidade?: string
  estado?: string
  ativo?: boolean
}

// ---- API DTOs (Frontend) ----

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

// ---- Repository ----

export interface ListChurchesParams {
  ativo?: boolean
  limit?: number
  offset?: number
}

export interface PaginatedChurchResult {
  items: ChurchProps[]
  total: number
  limit: number
  offset: number
}

export interface IChurchRepository {
  findById(id: string): Promise<ChurchProps | null>
  findBySlug(slug: string): Promise<ChurchProps | null>
  findAll(params?: ListChurchesParams): Promise<PaginatedChurchResult>
  countMembers(churchId: string): Promise<number>
  save(church: ChurchProps): Promise<void>
  update(church: ChurchProps): Promise<void>
  delete(id: string): Promise<void>
  // Transactional: move user vínculo from oldChurchId (nullable) to newChurchId (nullable).
  // Single transaction that updates user.churchId and adjusts totalMembros on both churches.
  transferUserChurch(input: {
    userId: string
    oldChurchId: string | null
    newChurchId: string | null
  }): Promise<void>
}

// ---- Member Listing ----

export interface ChurchMemberDTO {
  userId: string
  nome: string
  email: string
  vinculadoEm?: string
}

export interface ListChurchMembersParams {
  churchId: string
  search?: string
  limit?: number
  offset?: number
}

export interface PaginatedMembersResult {
  items: ChurchMemberDTO[]
  total: number
  limit: number
  offset: number
}

// ---- User Extension ----
// UserDTO ganha campo `churchId: string | null` em src/shared/types/user.ts.
// Aqui ficam apenas estruturas auxiliares para a UI dessa feature.

export interface UserChurchView {
  churchId: string | null
  church: ChurchSummaryDTO | null
}

// ---- API Requests ----

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

// PUT /api/user/church — define ou troca a igreja do usuário logado.
export interface SetUserChurchRequest {
  churchId: string
}

// DELETE /api/user/church — não requer body; remove o vínculo.

export interface AdminRemoveMemberParams {
  churchId: string
  userId: string
}

// ---- API Responses ----

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

// ---- UI Component Props ----

export type ChurchBadgeVariant = 'header' | 'account' | 'home' | 'compact'

export interface ChurchBadgeProps {
  church: ChurchSummaryDTO | null
  variant: ChurchBadgeVariant
  onSelectClick?: () => void
}

export interface ChurchSelectorModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (churchId: string) => Promise<void>
  currentChurchId?: string | null
  availableChurches: ChurchSummaryDTO[]
  mode: 'initial' | 'change'
}

export interface UserChurchesSectionProps {
  userId: string
}

export interface ChurchMembersListProps {
  churchId: string
}

// ---- Error Discriminators ----
// Erros de domínio que as rotas API devem mapear para status HTTP apropriados.

export type ChurchErrorCode =
  | 'CHURCH_NOT_FOUND'
  | 'CHURCH_SLUG_ALREADY_EXISTS'
  | 'CANNOT_DELETE_CHURCH_WITH_MEMBERS'
  | 'USER_NOT_LINKED_TO_CHURCH'
  | 'CHURCH_INACTIVE'
