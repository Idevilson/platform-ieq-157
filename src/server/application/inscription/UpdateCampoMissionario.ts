import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { InscriptionNotFoundError, ValidationError } from '@/server/domain/shared/errors'

export interface UpdateCampoMissionarioInput {
  inscriptionId: string
  eventId: string
  campoMissionario: string
  userId?: string
}

export class UpdateCampoMissionario {
  constructor(private readonly inscriptionRepository: IInscriptionRepository) {}

  async execute(input: UpdateCampoMissionarioInput): Promise<void> {
    const campo = input.campoMissionario.trim()
    if (!campo) {
      throw new ValidationError('Número do campo missionário é obrigatório')
    }
    if (!/^\d+$/.test(campo)) {
      throw new ValidationError('O campo missionário deve conter apenas números')
    }

    const inscription = await this.inscriptionRepository.findById(input.inscriptionId, input.eventId)
    if (!inscription) {
      throw new InscriptionNotFoundError(input.inscriptionId)
    }

    // Inscrição vinculada a uma conta só pode ser alterada pelo próprio dono autenticado.
    // Inscrição de visitante (sem conta) pode ser preenchida na consulta por CPF sem login.
    if (inscription.userId && inscription.userId !== input.userId) {
      throw new ValidationError('Acesso negado')
    }

    inscription.setCampoMissionario(campo)
    await this.inscriptionRepository.update(inscription)
  }
}
