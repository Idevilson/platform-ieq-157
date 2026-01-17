
import { User, UpdateUserDTO } from '@/server/domain/user/entities/User'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { UserNotFoundError, CPFAlreadyInUseError, ValidationError } from '@/server/domain/shared/errors'
import { CPF } from '@/server/domain/shared/value-objects/CPF'

export interface UpdateProfileInput {
  userId: string
  nome?: string
  telefone?: string
  cpf?: string
}

export interface UpdateProfileOutput {
  user: ReturnType<User['toJSON']>
}

export class UpdateProfile {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateProfileInput): Promise<UpdateProfileOutput> {
    const user = await this.userRepository.findById(input.userId)

    if (!user) {
      throw new UserNotFoundError(input.userId)
    }

    // Validate CPF format if provided
    if (input.cpf) {
      if (!CPF.isValid(input.cpf)) {
        throw new ValidationError('CPF inválido', { cpf: 'CPF inválido' })
      }

      // Check if CPF is already in use by another user
      const cleanCpf = CPF.clean(input.cpf)
      const existingUserWithCpf = await this.userRepository.findByCPF(cleanCpf)
      if (existingUserWithCpf && existingUserWithCpf.id !== user.id) {
        throw new CPFAlreadyInUseError()
      }
    }

    // Update user profile
    const updateDto: UpdateUserDTO = {}
    if (input.nome !== undefined) updateDto.nome = input.nome
    if (input.telefone !== undefined) updateDto.telefone = input.telefone
    if (input.cpf !== undefined) updateDto.cpf = input.cpf ? CPF.clean(input.cpf) : undefined

    user.updateProfile(updateDto)
    await this.userRepository.update(user)

    return { user: user.toJSON() }
  }
}
