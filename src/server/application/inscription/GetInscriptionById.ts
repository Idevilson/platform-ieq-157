import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { InscriptionNotFoundError, ValidationError } from '@/server/domain/shared/errors'

export interface GetInscriptionByIdInput {
  inscriptionId: string
  userId?: string // For authorization - if provided, checks ownership
  allowGuest?: boolean // Allow access to guest inscriptions
}

export interface GetInscriptionByIdOutput {
  inscription: ReturnType<Inscription['toJSON']>
}

export class GetInscriptionById {
  constructor(private readonly inscriptionRepository: IInscriptionRepository) {}

  async execute(input: GetInscriptionByIdInput): Promise<GetInscriptionByIdOutput> {
    const inscription = await this.inscriptionRepository.findById(input.inscriptionId)

    if (!inscription) {
      throw new InscriptionNotFoundError(input.inscriptionId)
    }

    // Check authorization
    if (input.userId) {
      // User is logged in, check if they own this inscription
      if (inscription.userId !== input.userId) {
        throw new ValidationError('Não autorizado', {
          authorization: 'Você não tem permissão para visualizar esta inscrição',
        })
      }
    } else if (!input.allowGuest) {
      // No user provided and guest access not allowed
      throw new ValidationError('Não autorizado', {
        authorization: 'Autenticação necessária para visualizar esta inscrição',
      })
    }

    return { inscription: inscription.toJSON() }
  }
}
