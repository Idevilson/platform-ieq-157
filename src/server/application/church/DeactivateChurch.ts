import { IChurchRepository } from '@/server/domain/church/repositories/IChurchRepository'
import { ChurchNotFoundError } from '@/server/domain/shared/errors'

export class DeactivateChurch {
  constructor(private readonly churchRepository: IChurchRepository) {}

  async execute(churchId: string): Promise<void> {
    const church = await this.churchRepository.findById(churchId)
    if (!church) throw new ChurchNotFoundError(churchId)

    church.deactivate()
    await this.churchRepository.update(church)
  }
}
