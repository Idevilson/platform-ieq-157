import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'

export async function resolveInscriptionTarget(
  inscription: Inscription,
  userRepository?: IUserRepository,
): Promise<{ nome: string; cpf: string }> {
  if (inscription.guestData) {
    return { nome: inscription.guestData.nome, cpf: inscription.guestData.cpf.getValue() }
  }
  if (inscription.userId && userRepository) {
    const user = await userRepository.findById(inscription.userId)
    const json = user?.toJSON()
    return { nome: json?.nome ?? '', cpf: json?.cpf ?? '' }
  }
  return { nome: '', cpf: '' }
}
