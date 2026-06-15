import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { EVENT_OPS_PERMISSIONS, GLOBAL_PERMISSION_SCOPE } from '@/shared/constants'

export interface EventTeamMember {
  userId: string
  nome: string
  email: string
  permissions: string[]
}

export class ListEventTeam {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: { eventId: string }) {
    const values = EVENT_OPS_PERMISSIONS.flatMap((key) => [
      `${key}:${input.eventId}`,
      `${key}:${GLOBAL_PERMISSION_SCOPE}`,
    ])
    const users = await this.userRepository.findByPermissionIndexAny(values)

    const team: EventTeamMember[] = users.map((user) => {
      const json = user.toJSON()
      return {
        userId: json.id,
        nome: json.nome,
        email: json.email,
        permissions: EVENT_OPS_PERMISSIONS.filter((key) => user.hasPermission(key, input.eventId)),
      }
    }).filter((member) => member.permissions.length > 0)

    return { team }
  }
}
