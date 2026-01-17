
import { User, CreateUserDTO } from '@/server/domain/user/entities/User'
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
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) {
      throw new UserAlreadyExistsError(input.email)
    }

    // Create new user
    const dto: CreateUserDTO = {
      id: input.uid,
      email: input.email,
      nome: input.nome,
      role: 'user',
    }

    const user = User.create(dto)
    await this.userRepository.save(user)

    return { user: user.toJSON() }
  }
}
