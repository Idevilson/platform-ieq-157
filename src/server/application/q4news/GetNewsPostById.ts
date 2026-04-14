import { NewsPost } from '@/server/domain/q4news/entities/NewsPost'
import { INewsPostRepository } from '@/server/domain/q4news/repositories/INewsPostRepository'
import { NewsNotFoundError } from '@/server/domain/shared/errors'

export interface GetNewsPostByIdInput {
  newsId: string
}

export interface GetNewsPostByIdOutput {
  post: ReturnType<NewsPost['toJSON']>
}

export class GetNewsPostById {
  constructor(private readonly newsPostRepository: INewsPostRepository) {}

  async execute(input: GetNewsPostByIdInput): Promise<GetNewsPostByIdOutput> {
    const post = await this.newsPostRepository.findById(input.newsId)
    if (!post) throw new NewsNotFoundError(input.newsId)

    return { post: post.toJSON() }
  }
}
