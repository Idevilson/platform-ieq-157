import { v4 as uuidv4 } from 'uuid'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { Email } from '@/server/domain/shared/value-objects/Email'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { Phone } from '@/server/domain/shared/value-objects/Phone'
import {
  EventNotFoundError,
  EventNotOpenError,
  CategoryNotFoundError,
  DuplicateInscriptionError,
  ValidationError,
} from '@/server/domain/shared/errors'

export interface CreateGuestInscriptionInput {
  eventId: string
  categoryId: string
  guestData: {
    nome: string
    email: string
    cpf: string
    telefone: string
  }
}

export interface CreateGuestInscriptionOutput {
  inscription: ReturnType<Inscription['toJSON']>
}

export class CreateGuestInscription {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(input: CreateGuestInscriptionInput): Promise<CreateGuestInscriptionOutput> {
    // Validate guest data
    const validationErrors: Record<string, string> = {}

    // Validate email
    if (!Email.isValid(input.guestData.email)) {
      validationErrors.email = 'Email inválido'
    }

    // Validate CPF
    if (!CPF.isValid(input.guestData.cpf)) {
      validationErrors.cpf = 'CPF inválido'
    }

    // Validate phone
    if (!Phone.isValid(input.guestData.telefone)) {
      validationErrors.telefone = 'Telefone inválido'
    }

    // Validate name
    if (!input.guestData.nome || input.guestData.nome.trim().length < 2) {
      validationErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError('Dados inválidos', validationErrors)
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

    // Check for duplicate inscription by CPF
    const cleanCpf = CPF.clean(input.guestData.cpf)
    const existingInscription = await this.inscriptionRepository.findByEventIdAndCPF(
      input.eventId,
      cleanCpf
    )
    if (existingInscription) {
      throw new DuplicateInscriptionError()
    }

    // Create inscription with guest data - valor comes from category
    const inscription = Inscription.create(uuidv4(), {
      eventId: input.eventId,
      categoryId: input.categoryId,
      valor: category.valorCents,
      guestData: {
        nome: input.guestData.nome.trim(),
        email: input.guestData.email,
        cpf: cleanCpf,
        telefone: Phone.clean(input.guestData.telefone),
      },
    })

    // Save inscription
    await this.inscriptionRepository.save(inscription)

    return { inscription: inscription.toJSON() }
  }
}
