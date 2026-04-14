import { NewsPost } from '@/server/domain/q4news/entities/NewsPost'
import { INewsPostRepository, ListNewsPostsParams } from '@/server/domain/q4news/repositories/INewsPostRepository'
import { NewsStatus } from '@/server/domain/q4news/entities/NewsPost'

export interface ListNewsPostsInput {
  status?: NewsStatus
  limit?: number
  offset?: number
  full?: boolean
}

export interface ListNewsPostsOutput {
  posts: ReturnType<NewsPost['toSummary']>[]
  total: number
  limit: number
  offset: number
}

export class ListNewsPosts {
  constructor(private readonly newsPostRepository: INewsPostRepository) {}

  async execute(input: ListNewsPostsInput = {}): Promise<ListNewsPostsOutput> {
    const params: ListNewsPostsParams = {
      status: input.status,
      limit: input.limit,
      offset: input.offset,
    }

    const result = await this.newsPostRepository.findAll(params)

    return {
      posts: result.items.map(post => input.full ? post.toJSON() : post.toSummary()),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  }
}
