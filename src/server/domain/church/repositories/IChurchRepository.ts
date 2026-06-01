import { Church } from '../entities/Church'

export interface ListChurchesParams {
  ativo?: boolean
  limit?: number
  offset?: number
}

export interface PaginatedChurchResult {
  items: Church[]
  total: number
  limit: number
  offset: number
}

export interface ChurchMemberRow {
  userId: string
  nome: string
  email: string
  vinculadoEm?: Date
}

export interface ListChurchMembersParams {
  churchId: string
  search?: string
  limit?: number
  offset?: number
}

export interface PaginatedChurchMembersResult {
  items: ChurchMemberRow[]
  total: number
  limit: number
  offset: number
}

export interface TransferUserChurchInput {
  userId: string
  oldChurchId: string | null
  newChurchId: string | null
}

export interface IChurchRepository {
  findById(id: string): Promise<Church | null>
  findBySlug(slug: string): Promise<Church | null>
  findAll(params?: ListChurchesParams): Promise<PaginatedChurchResult>
  countMembers(churchId: string): Promise<number>
  listMembers(params: ListChurchMembersParams): Promise<PaginatedChurchMembersResult>
  save(church: Church): Promise<void>
  update(church: Church): Promise<void>
  delete(id: string): Promise<void>
  transferUserChurch(input: TransferUserChurchInput): Promise<void>
}
