import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import {
  UserNotFoundError,
  UserNotLinkedToChurchError,
} from '@/server/domain/shared/errors'

export class AdminRemoveUserFromChurch {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly churchRepository: IChurchRepository
  ) {}

  async execute(userId: string, churchId: string): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new UserNotFoundError(userId)

    const currentChurchId = user.getChurchId()
    if (currentChurchId !== churchId) {
      throw new UserNotLinkedToChurchError(userId, churchId)
    }

    await this.churchRepository.transferUserChurch({
      userId,
      oldChurchId: churchId,
      newChurchId: null,
    })
  }
}
