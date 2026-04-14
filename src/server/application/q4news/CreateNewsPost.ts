import { INewsPostRepository } from '@/server/domain/q4news/repositories/INewsPostRepository'
import { NewsPost, CreateNewsPostDTO } from '@/server/domain/q4news/entities/NewsPost'
import { ValidationError } from '@/server/domain/shared/errors'
import { parseVideoId, getThumbnailUrl } from '@/lib/utils/youtube'
import { createNewsPostSchema, CreateNewsPostInput } from './schemas'

export interface CreateNewsPostOutput {
  id: string
  titulo: string
  status: string
}

export class CreateNewsPost {
  constructor(private readonly newsPostRepository: INewsPostRepository) {}

  async execute(input: CreateNewsPostInput & { autorId: string; autorNome: string }): Promise<CreateNewsPostOutput> {
    const parseResult = createNewsPostSchema.safeParse(input)
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      throw new ValidationError(firstError.message)
    }

    const data = parseResult.data
    const postId = data.slug || this.generateSlug(data.titulo)

    const existing = await this.newsPostRepository.findById(postId)
    if (existing) {
      throw new ValidationError('Ja existe uma noticia com este titulo')
    }

    const videoId = parseVideoId(data.youtubeUrl)
    if (!videoId) {
      throw new ValidationError('URL do YouTube invalida')
    }

    const dto: CreateNewsPostDTO = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      conteudo: data.conteudo.trim(),
      youtubeUrl: data.youtubeUrl.trim(),
      youtubeVideoId: videoId,
      thumbnailUrl: getThumbnailUrl(videoId),
      status: data.status,
      autorId: input.autorId,
      autorNome: input.autorNome,
    }

    const post = NewsPost.create(postId, dto)
    await this.newsPostRepository.save(post)

    return {
      id: post.id,
      titulo: post.titulo,
      status: post.status,
    }
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

export type { CreateNewsPostInput }
