// Re-export shared constants
export * from '@/shared/constants'

// Domain-specific interfaces
export interface Timestamps {
  criadoEm: Date
  atualizadoEm: Date
}

export interface WithId {
  id: string
}

// Pagination
export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}
