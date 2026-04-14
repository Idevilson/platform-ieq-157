import { INewsPostRepository } from '@/server/domain/q4news/repositories/INewsPostRepository'
import { NewsNotFoundError } from '@/server/domain/shared/errors'

export class DeleteNewsPost {
  constructor(private readonly newsPostRepository: INewsPostRepository) {}

  async execute(newsId: string): Promise<void> {
    const post = await this.newsPostRepository.findById(newsId)
    if (!post) throw new NewsNotFoundError(newsId)

    await this.newsPostRepository.delete(newsId)
  }
}
