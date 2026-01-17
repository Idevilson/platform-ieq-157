import { v4 as uuidv4 } from 'uuid'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import {
  EventNotFoundError,
  EventNotOpenError,
  CategoryNotFoundError,
  DuplicateInscriptionError,
  UserNotFoundError,
} from '@/server/domain/shared/errors'

export interface CreateInscriptionInput {
  userId: string
  eventId: string
  categoryId: string
}

export interface CreateInscriptionOutput {
  inscription: ReturnType<Inscription['toJSON']>
}

export class CreateInscription {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: CreateInscriptionInput): Promise<CreateInscriptionOutput> {
    // Validate user exists and has complete profile
    const user = await this.userRepository.findById(input.userId)
    if (!user) {
      throw new UserNotFoundError(input.userId)
    }

    // Validate event exists and is open
    const event = await this.eventRepository.findById(input.eventId)
    if (!event) {
      throw new EventNotFoundError(input.eventId)
    }

    if (!event.isOpen()) {
      throw new EventNotOpenError()
    }

    // Validate category exists
    const category = await this.eventRepository.findCategoryById(input.eventId, input.categoryId)
    if (!category) {
      throw new CategoryNotFoundError(input.categoryId)
    }

    // Check for duplicate inscription
    const existingInscription = await this.inscriptionRepository.findByEventIdAndUserId(
      input.eventId,
      input.userId
    )
    if (existingInscription) {
      throw new DuplicateInscriptionError()
    }

    // Create inscription - valor comes from category
    const inscription = Inscription.create(uuidv4(), {
      eventId: input.eventId,
      categoryId: input.categoryId,
      userId: input.userId,
      valor: category.valorCents,
    })

    // Save inscription
    await this.inscriptionRepository.save(inscription)

    return { inscription: inscription.toJSON() }
  }
}
