import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import { listChurchesSchema, ListChurchesInput } from './schemas'
import { ValidationError } from '@/server/domain/shared/errors'

export interface ListChurchesOutput {
  items: Array<{
    id: string
    nome: string
    slug: string
    cidade?: string
    estado?: string
    ativo: boolean
    totalMembros: number
    criadoEm: string
    atualizadoEm: string
  }>
  total: number
  limit: number
  offset: number
}

export class ListChurches {
  constructor(private readonly churchRepository: IChurchRepository) {}

  async execute(input: ListChurchesInput = {}): Promise<ListChurchesOutput> {
    const parseResult = listChurchesSchema.safeParse(input)
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.issues[0].message)
    }

    const result = await this.churchRepository.findAll(parseResult.data)

    return {
      items: result.items.map((c) => ({
        id: c.id,
        nome: c.nome,
        slug: c.slug,
        cidade: c.cidade,
        estado: c.estado,
        ativo: c.ativo,
        totalMembros: c.totalMembros,
        criadoEm: c.criadoEm.toISOString(),
        atualizadoEm: c.atualizadoEm.toISOString(),
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  }
}
