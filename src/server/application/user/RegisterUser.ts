import { User } from '@/server/domain/user/entities/User'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { UserAlreadyExistsError } from '@/server/domain/shared/errors'

export interface RegisterUserInput {
  uid: string
  email: string
  nome: string
}

export interface RegisterUserOutput {
  user: ReturnType<User['toJSON']>
}

export class RegisterUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) {
      throw new UserAlreadyExistsError(input.email)
    }

    const user = User.create(input.uid, input.email, input.nome)
    await this.userRepository.save(user)

    return { user: user.toJSON() }
  }
}
