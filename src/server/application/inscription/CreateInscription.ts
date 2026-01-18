import { v4 as uuidv4 } from 'uuid'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { User } from '@/server/domain/user/entities/User'
import { Event } from '@/server/domain/event/entities/Event'
import {
  EventNotFoundError,
  EventNotOpenError,
  CategoryNotFoundError,
  DuplicateInscriptionError,
  UserNotFoundError,
} from '@/server/domain/shared/errors'
import { InscriptionPaymentMethod } from '@/shared/constants'

export interface CreateInscriptionInput {
  userId: string
  eventId: string
  categoryId: string
  preferredPaymentMethod?: InscriptionPaymentMethod
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
    const user = await this.findUser(input.userId)
    await this.findOpenEvent(input.eventId)
    const category = await this.findCategory(input.eventId, input.categoryId)

    await this.ensureNoDuplicateByUserId(input.eventId, input.userId)
    await this.ensureNoDuplicateByCPF(input.eventId, user)

    const inscription = this.createInscription(input, category.valorCents)
    await this.inscriptionRepository.save(inscription)

    return { inscription: inscription.toJSON() }
  }

  private async findUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundError(userId)
    }
    return user
  }

  private async findOpenEvent(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId)
    if (!event) {
      throw new EventNotFoundError(eventId)
    }
    if (!event.isOpen()) {
      throw new EventNotOpenError()
    }
    return event
  }

  private async findCategory(eventId: string, categoryId: string) {
    const category = await this.eventRepository.findCategoryById(eventId, categoryId)
    if (!category) {
      throw new CategoryNotFoundError(categoryId)
    }
    return category
  }

  private async ensureNoDuplicateByUserId(eventId: string, userId: string): Promise<void> {
    const existingInscription = await this.inscriptionRepository.findByEventIdAndUserId(eventId, userId)
    if (existingInscription) {
      throw new DuplicateInscriptionError()
    }
  }

  private async ensureNoDuplicateByCPF(eventId: string, user: User): Promise<void> {
    const userCPF = user.toJSON().cpf
    if (!userCPF) {
      return
    }

    // Check if there's a guest inscription with the same CPF
    const existingGuestInscription = await this.inscriptionRepository.findByEventIdAndCPF(eventId, userCPF)
    if (existingGuestInscription) {
      throw new DuplicateInscriptionError()
    }
  }

  private createInscription(input: CreateInscriptionInput, valorCents: number): Inscription {
    return Inscription.create(uuidv4(), {
      eventId: input.eventId,
      categoryId: input.categoryId,
      userId: input.userId,
      valor: valorCents,
      preferredPaymentMethod: input.preferredPaymentMethod,
    })
  }
}
