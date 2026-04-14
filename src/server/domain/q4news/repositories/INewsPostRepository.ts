import { NewsPost, NewsStatus } from '../entities/NewsPost'

export interface ListNewsPostsParams {
  status?: NewsStatus
  limit?: number
  offset?: number
}

export interface PaginatedNewsResult {
  items: NewsPost[]
  total: number
  limit: number
  offset: number
}

export interface INewsPostRepository {
  findById(id: string): Promise<NewsPost | null>
  findAll(params?: ListNewsPostsParams): Promise<PaginatedNewsResult>
  save(post: NewsPost): Promise<void>
  update(post: NewsPost): Promise<void>
  delete(id: string): Promise<void>
}
