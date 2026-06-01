import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import { UserNotFoundError } from '@/server/domain/shared/errors'

export class ClearUserChurch {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly churchRepository: IChurchRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new UserNotFoundError(userId)

    const currentChurchId = user.getChurchId()
    if (currentChurchId === null) return

    await this.churchRepository.transferUserChurch({
      userId,
      oldChurchId: currentChurchId,
      newChurchId: null,
    })
  }
}
