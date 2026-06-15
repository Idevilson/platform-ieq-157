import { User } from '@/server/domain/user/entities/User'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { ValidationError } from '@/server/domain/shared/errors'
import { UserPermissionGrant } from '@/shared/constants'

export interface AdminUserDTO {
  id: string
  nome: string
  email: string
  cpf?: string
  role: string
  permissions: UserPermissionGrant[]
}

function toAdminUserDTO(user: User): AdminUserDTO {
  const json = user.toJSON()
  return {
    id: json.id,
    nome: json.nome,
    email: json.email,
    cpf: json.cpf,
    role: json.role,
    permissions: user.permissions,
  }
}

export class ListUsers {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input?: { query?: string }) {
    const users = await this.userRepository.list()
    const query = input?.query?.trim().toLowerCase()
    if (!query) return { users: users.map(toAdminUserDTO) }

    const digits = query.replace(/\D/g, '')
    const filtered = users.filter((user) => {
      const json = user.toJSON()
      const byName = json.nome?.toLowerCase().includes(query)
      const byEmail = json.email?.toLowerCase().includes(query)
      const byCpf = digits.length > 0 && !!json.cpf?.replace(/\D/g, '').includes(digits)
      return byName || byEmail || byCpf
    })
    return { users: filtered.map(toAdminUserDTO) }
  }
}

export class SetUserPermissions {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: { targetUserId: string; grants: UserPermissionGrant[] }) {
    const user = await this.userRepository.findById(input.targetUserId)
    if (!user) throw new ValidationError('Usuário não encontrado')
    user.setPermissions(input.grants ?? [])
    await this.userRepository.update(user)
    return { user: toAdminUserDTO(user) }
  }
}
