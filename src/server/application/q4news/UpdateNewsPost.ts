import { INewsPostRepository } from '@/server/domain/q4news/repositories/INewsPostRepository'
import { UpdateNewsPostDTO } from '@/server/domain/q4news/entities/NewsPost'
import { NewsNotFoundError, ValidationError } from '@/server/domain/shared/errors'
import { parseVideoId, getThumbnailUrl } from '@/lib/utils/youtube'
import { updateNewsPostSchema, UpdateNewsPostInput } from './schemas'

export interface UpdateNewsPostOutput {
  id: string
  titulo: string
  status: string
}

export class UpdateNewsPost {
  constructor(private readonly newsPostRepository: INewsPostRepository) {}

  async execute(newsId: string, input: UpdateNewsPostInput): Promise<UpdateNewsPostOutput> {
    const post = await this.newsPostRepository.findById(newsId)
    if (!post) throw new NewsNotFoundError(newsId)

    const parseResult = updateNewsPostSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      throw new ValidationError(firstError.message)
    }

    const data = parseResult.data
    const dto: UpdateNewsPostDTO = { ...data }

    if (data.youtubeUrl) {
      const videoId = parseVideoId(data.youtubeUrl)
      if (!videoId) throw new ValidationError('URL do YouTube invalida')
      dto.youtubeVideoId = videoId
      dto.thumbnailUrl = getThumbnailUrl(videoId)
    }

    post.update(dto)
    await this.newsPostRepository.update(post)

    return {
      id: post.id,
      titulo: post.titulo,
      status: post.status,
    }
  }
}
