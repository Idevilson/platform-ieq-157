import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { ReportAccountProfile } from './BuildInscriptionsPdf'

// Inscrições de conta logada não carregam guestData; nome/CPF/telefone vivem na coleção users.
export async function loadAccountProfiles(
  inscriptions: Inscription[],
  userRepository: IUserRepository,
): Promise<Map<string, ReportAccountProfile>> {
  const userIds = [
    ...new Set(
      inscriptions
        .filter((i) => !i.guestData && i.userId)
        .map((i) => i.userId as string),
    ),
  ]

  const profiles = new Map<string, ReportAccountProfile>()
  if (userIds.length === 0) return profiles

  const users = await Promise.all(userIds.map((id) => userRepository.findById(id)))
  for (const user of users) {
    if (!user) continue
    const data = user.toJSON()
    profiles.set(data.id, {
      nome: data.nome,
      cpf: data.cpf,
      telefone: data.telefone,
    })
  }
  return profiles
}
