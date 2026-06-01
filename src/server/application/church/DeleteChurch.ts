import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import {
  CannotDeleteChurchWithMembersError,
  ChurchNotFoundError,
} from '@/server/domain/shared/errors'

export class DeleteChurch {
  constructor(private readonly churchRepository: IChurchRepository) {}

  async execute(churchId: string): Promise<void> {
    const church = await this.churchRepository.findById(churchId)
    if (!church) throw new ChurchNotFoundError(churchId)

    if (church.hasMembers()) {
      throw new CannotDeleteChurchWithMembersError(church.totalMembros)
    }

    await this.churchRepository.delete(churchId)
  }
}
