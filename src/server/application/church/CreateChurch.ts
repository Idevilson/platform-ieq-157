import { Church } from '@/server/domain/church/entities/Church'
import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import { ChurchSlugAlreadyExistsError, ValidationError } from '@/server/domain/shared/errors'
import { createChurchSchema, CreateChurchInput } from './schemas'

export interface CreateChurchOutput {
  id: string
  slug: string
  nome: string
}

export class CreateChurch {
  constructor(private readonly churchRepository: IChurchRepository) {}

  async execute(input: CreateChurchInput): Promise<CreateChurchOutput> {
    const parseResult = createChurchSchema.safeParse(input)
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.issues[0].message)
    }

    const data = parseResult.data
    const slug = data.slug ?? this.generateSlug(data.nome)

    const existing = await this.churchRepository.findBySlug(slug)
    if (existing) {
      throw new ChurchSlugAlreadyExistsError(slug)
    }

    const church = Church.create({
      nome: data.nome.trim(),
      slug,
      cidade: data.cidade?.trim(),
      estado: data.estado?.toUpperCase(),
    })

    await this.churchRepository.save(church)

    return { id: church.id, slug: church.slug, nome: church.nome }
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}
