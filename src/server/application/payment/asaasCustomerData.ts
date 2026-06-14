import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { ValidationError } from '@/server/domain/shared/errors'

export interface AsaasCustomerData {
  name: string
  email: string
  cpfCnpj: string
  phone?: string
}

/** Resolve os dados do cliente Asaas a partir do usuário ou do visitante da inscrição. */
export async function buildAsaasCustomerData(
  inscription: Inscription,
  userRepository: IUserRepository,
): Promise<AsaasCustomerData> {
  if (inscription.userId) {
    const user = await userRepository.findById(inscription.userId)
    if (!user) throw new ValidationError('Usuário não encontrado')
    const userData = user.toJSON()
    if (!userData.cpf) throw new ValidationError('Usuário não possui CPF cadastrado')
    return {
      name: userData.nome,
      email: userData.email,
      cpfCnpj: userData.cpf,
      phone: userData.telefone,
    }
  }
  if (inscription.guestData) {
    const guest = inscription.guestData.toJSON()
    return {
      name: guest.nome,
      email: guest.email,
      cpfCnpj: guest.cpf,
      phone: guest.telefone,
    }
  }
  throw new ValidationError('Inscrição sem dados de usuário ou visitante')
}
