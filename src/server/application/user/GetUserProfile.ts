
import { User } from '@/server/domain/user/entities/User'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { UserNotFoundError } from '@/server/domain/shared/errors'

export interface GetUserProfileInput {
  userId: string
}

export interface GetUserProfileOutput {
  user: ReturnType<User['toJSON']>
}

export class GetUserProfile {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
    const user = await this.userRepository.findById(input.userId)

    if (!user) {
      throw new UserNotFoundError(input.userId)
    }

    return { user: user.toJSON() }
  }
}
