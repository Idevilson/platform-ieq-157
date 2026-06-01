import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import { ChurchNotFoundError, ValidationError } from '@/server/domain/shared/errors'
import { listChurchMembersSchema, ListChurchMembersInput } from './schemas'

export interface ListChurchMembersOutput {
  items: Array<{
    userId: string
    nome: string
    email: string
    vinculadoEm?: string
  }>
  total: number
  limit: number
  offset: number
}

export class ListChurchMembers {
  constructor(private readonly churchRepository: IChurchRepository) {}

  async execute(input: ListChurchMembersInput): Promise<ListChurchMembersOutput> {
    const parseResult = listChurchMembersSchema.safeParse(input)
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.issues[0].message)
    }

    const church = await this.churchRepository.findById(parseResult.data.churchId)
    if (!church) throw new ChurchNotFoundError(parseResult.data.churchId)

    const result = await this.churchRepository.listMembers(parseResult.data)

    return {
      items: result.items.map((m) => ({
        userId: m.userId,
        nome: m.nome,
        email: m.email,
        vinculadoEm: m.vinculadoEm?.toISOString(),
      })),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  }
}
