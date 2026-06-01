import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import {
  ChurchInactiveError,
  ChurchNotFoundError,
  UserNotFoundError,
  ValidationError,
} from '@/server/domain/shared/errors'
import { setUserChurchSchema, SetUserChurchInput } from '../church/schemas'

export class SetUserChurch {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly churchRepository: IChurchRepository
  ) {}

  async execute(userId: string, input: SetUserChurchInput): Promise<void> {
    const parseResult = setUserChurchSchema.safeParse(input)
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.issues[0].message)
    }

    const { churchId } = parseResult.data

    const user = await this.userRepository.findById(userId)
    if (!user) throw new UserNotFoundError(userId)

    const church = await this.churchRepository.findById(churchId)
    if (!church) throw new ChurchNotFoundError(churchId)
    if (!church.isActive()) throw new ChurchInactiveError(churchId)

    const currentChurchId = user.getChurchId()
    if (currentChurchId === churchId) return

    await this.churchRepository.transferUserChurch({
      userId,
      oldChurchId: currentChurchId,
      newChurchId: churchId,
    })
  }
}
