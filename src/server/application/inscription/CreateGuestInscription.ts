import { v4 as uuidv4 } from 'uuid'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { Phone } from '@/server/domain/shared/value-objects/Phone'
import {
  EventNotFoundError,
  EventNotOpenError,
  CategoryNotFoundError,
  DuplicateInscriptionError,
} from '@/server/domain/shared/errors'
import { Gender, InscriptionPaymentMethod } from '@/shared/constants'

export interface CreateGuestInscriptionInput {
  eventId: string
  categoryId: string
  preferredPaymentMethod?: InscriptionPaymentMethod
  guestData: {
    nome: string
    email: string
    cpf: string
    telefone: string
    dataNascimento: Date | string
    sexo: Gender
  }
}

export interface CreateGuestInscriptionOutput {
  inscription: ReturnType<Inscription['toJSON']>
}

export class CreateGuestInscription {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository,
    private readonly userRepository?: IUserRepository
  ) {}

  async execute(input: CreateGuestInscriptionInput): Promise<CreateGuestInscriptionOutput> {
    await this.findOpenEvent(input.eventId)
    const category = await this.findCategory(input.eventId, input.categoryId)
    await this.ensureNoDuplicate(input.eventId, input.guestData.cpf)

    const inscription = this.createInscription(input, category.valorCents)
    await this.inscriptionRepository.save(inscription)

    return { inscription: inscription.toJSON() }
  }

  private async findOpenEvent(eventId: string) {
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

  private async ensureNoDuplicate(eventId: string, cpf: string): Promise<void> {
    const cleanCpf = CPF.clean(cpf)

    // Check if there's already a guest inscription with this CPF
    const existingGuestInscription = await this.inscriptionRepository.findByEventIdAndCPF(eventId, cleanCpf)
    if (existingGuestInscription) {
      throw new DuplicateInscriptionError()
    }

    // Check if there's a user with this CPF who already has an inscription
    await this.ensureNoUserInscriptionWithCPF(eventId, cleanCpf)
  }

  private async ensureNoUserInscriptionWithCPF(eventId: string, cpf: string): Promise<void> {
    if (!this.userRepository) {
      return
    }

    const user = await this.userRepository.findByCPF(cpf)
    if (!user) {
      return
    }

    const userId = user.toJSON().id
    const existingUserInscription = await this.inscriptionRepository.findByEventIdAndUserId(eventId, userId)
    if (existingUserInscription) {
      throw new DuplicateInscriptionError()
    }
  }

  private createInscription(input: CreateGuestInscriptionInput, valorCents: number): Inscription {
    return Inscription.create(uuidv4(), {
      eventId: input.eventId,
      categoryId: input.categoryId,
      valor: valorCents,
      preferredPaymentMethod: input.preferredPaymentMethod,
      guestData: {
        nome: input.guestData.nome.trim(),
        email: input.guestData.email,
        cpf: CPF.clean(input.guestData.cpf),
        telefone: Phone.clean(input.guestData.telefone),
        dataNascimento: input.guestData.dataNascimento,
        sexo: input.guestData.sexo,
      },
    })
  }
}
