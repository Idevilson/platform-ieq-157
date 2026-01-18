import { User } from '@/server/domain/user/entities/User'
import { UpdateUserStateParams } from '@/server/domain/user/value-objects/UserStateParams'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { UserNotFoundError, CPFAlreadyInUseError, ValidationError } from '@/server/domain/shared/errors'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { Gender } from '@/shared/constants'

export interface UpdateProfileInput {
  userId: string
  nome?: string
  telefone?: string
  cpf?: string
  dataNascimento?: Date | string
  sexo?: Gender
}

export interface UpdateProfileOutput {
  user: ReturnType<User['toJSON']>
}

export class UpdateProfile {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateProfileInput): Promise<UpdateProfileOutput> {
    const user = await this.findUser(input.userId)
    const userId = user.toJSON().id
    await this.validateCpfUniqueness(input.cpf, userId)

    this.applyUpdates(user, input)
    await this.userRepository.update(user)

    return { user: user.toJSON() }
  }

  private async findUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new UserNotFoundError(userId)
    return user
  }

  private async validateCpfUniqueness(cpf: string | undefined, userId: string): Promise<void> {
    if (!cpf) return
    if (!CPF.isValid(cpf)) throw new ValidationError('CPF inválido', { cpf: 'CPF inválido' })

    const cleanCpf = CPF.clean(cpf)
    const existingUser = await this.userRepository.findByCPF(cleanCpf)
    if (!existingUser) return
    if (existingUser.toJSON().id === userId) return

    throw new CPFAlreadyInUseError()
  }

  private applyUpdates(user: User, input: UpdateProfileInput): void {
    const params: UpdateUserStateParams = {
      nome: input.nome,
      telefone: input.telefone,
      dataNascimento: input.dataNascimento,
      sexo: input.sexo,
    }
    user.updateProfile(params)
    if (input.cpf !== undefined) user.updateCpf(CPF.clean(input.cpf))
  }
}
