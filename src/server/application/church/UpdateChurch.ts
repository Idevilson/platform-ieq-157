import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import { ChurchNotFoundError, ValidationError } from '@/server/domain/shared/errors'
import { updateChurchSchema, UpdateChurchInput } from './schemas'

export interface UpdateChurchOutput {
  id: string
  slug: string
  nome: string
  ativo: boolean
}

export class UpdateChurch {
  constructor(private readonly churchRepository: IChurchRepository) {}

  async execute(churchId: string, input: UpdateChurchInput): Promise<UpdateChurchOutput> {
    const parseResult = updateChurchSchema.safeParse(input)
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.issues[0].message)
    }

    const church = await this.churchRepository.findById(churchId)
    if (!church) {
      throw new ChurchNotFoundError(churchId)
    }

    const data = parseResult.data
    church.update({
      nome: data.nome?.trim(),
      cidade: data.cidade?.trim(),
      estado: data.estado?.toUpperCase(),
      ativo: data.ativo,
    })

    await this.churchRepository.update(church)

    return { id: church.id, slug: church.slug, nome: church.nome, ativo: church.ativo }
  }
}
