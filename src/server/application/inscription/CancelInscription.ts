import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import {
  InscriptionNotFoundError,
  ValidationError,
} from '@/server/domain/shared/errors'

export interface CancelInscriptionInput {
  inscriptionId: string
  userId?: string // For authorization - if provided, checks ownership
}

export interface CancelInscriptionOutput {
  inscription: ReturnType<Inscription['toJSON']>
}

export class CancelInscription {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository
  ) {}

  async execute(input: CancelInscriptionInput): Promise<CancelInscriptionOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId)

    if (!inscription) {
      throw new InscriptionNotFoundError(input.inscriptionId)
    }

    // Check ownership if userId is provided
    if (input.userId && inscription.userId !== input.userId) {
      throw new ValidationError('Não autorizado', {
        authorization: 'Você não tem permissão para cancelar esta inscrição',
      })
    }

    // Check if inscription can be cancelled
    if (!inscription.isPending) {
      throw new ValidationError('Inscrição não pode ser cancelada', {
        status: 'Apenas inscrições pendentes podem ser canceladas',
      })
    }

    // Cancel inscription
    inscription.cancel()

    // Save updated inscription
    await this.inscriptionRepository.update(inscription)

    return { inscription: inscription.toJSON() }
  }
}
