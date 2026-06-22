import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { InscriptionNotFoundError, ValidationError } from '@/server/domain/shared/errors'
import { ShirtSize, SHIRT_SIZES } from '@/shared/constants'

export interface UpdateInscriptionDetailsInput {
  eventId: string
  inscriptionId: string
  tamanho?: ShirtSize | null
  campoMissionario?: string | null
}

export class UpdateInscriptionDetails {
  constructor(private readonly inscriptionRepository: IInscriptionRepository) {}

  async execute(input: UpdateInscriptionDetailsInput): Promise<void> {
    if (input.tamanho === undefined && input.campoMissionario === undefined) {
      throw new ValidationError('Nenhum dado para atualizar')
    }

    if (input.tamanho !== undefined && input.tamanho !== null && !SHIRT_SIZES.includes(input.tamanho)) {
      throw new ValidationError('Tamanho de camiseta inválido')
    }

    const campo = input.campoMissionario?.trim()
    if (campo && !/^\d+$/.test(campo)) {
      throw new ValidationError('O campo missionário deve conter apenas números')
    }

    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) {
      throw new InscriptionNotFoundError(input.inscriptionId)
    }

    if (input.tamanho !== undefined) {
      inscription.setTamanho(input.tamanho ?? undefined)
    }
    if (input.campoMissionario !== undefined) {
      inscription.setCampoMissionario(campo)
    }

    await this.inscriptionRepository.update(inscription)
  }
}
