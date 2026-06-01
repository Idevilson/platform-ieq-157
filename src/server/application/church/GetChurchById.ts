import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import { ChurchNotFoundError } from '@/server/domain/shared/errors'

export interface GetChurchByIdOutput {
  id: string
  nome: string
  slug: string
  cidade?: string
  estado?: string
  ativo: boolean
  totalMembros: number
  criadoEm: string
  atualizadoEm: string
}

export class GetChurchById {
  constructor(private readonly churchRepository: IChurchRepository) {}

  async execute(churchId: string): Promise<GetChurchByIdOutput> {
    const church = await this.churchRepository.findById(churchId)
    if (!church) throw new ChurchNotFoundError(churchId)

    return {
      id: church.id,
      nome: church.nome,
      slug: church.slug,
      cidade: church.cidade,
      estado: church.estado,
      ativo: church.ativo,
      totalMembros: church.totalMembros,
      criadoEm: church.criadoEm.toISOString(),
      atualizadoEm: church.atualizadoEm.toISOString(),
    }
  }
}
