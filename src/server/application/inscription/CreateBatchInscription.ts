import { v4 as uuidv4 } from 'uuid'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'
import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { Phone } from '@/server/domain/shared/value-objects/Phone'
import {
  EventNotFoundError,
  EventNotOpenError,
  CategoryNotFoundError,
  ValidationError,
} from '@/server/domain/shared/errors'
import { Gender, InscriptionPaymentMethod } from '@/shared/constants'

export interface CreateBatchInscriptionInput {
  eventId: string
  categoryId: string
  preferredPaymentMethod?: InscriptionPaymentMethod
  userId: string
  responsavel: {
    nome: string
    cpf: string
    email: string
    telefone: string
    dataNascimento: Date | string
    sexo: Gender
    cidade: string
  }
  cidade: string
  participantes: { nome: string; sexo: Gender }[]
}

export interface CreateBatchInscriptionOutput {
  batch: ReturnType<BatchInscription['toJSON']>
}

export class CreateBatchInscription {
  constructor(
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(input: CreateBatchInscriptionInput): Promise<CreateBatchInscriptionOutput> {
    this.validateParticipantCount(input.participantes.length)

    const category = await this.findOpenEventAndCategory(input.eventId, input.categoryId)
    const priceCents = category.getCurrentPrice(new Date()).getCents()
    const totalCents = priceCents * input.participantes.length

    if (!input.responsavel.nome.trim()) {
      throw new ValidationError('Nome do responsável é obrigatório')
    }

    const cleanCpf = CPF.clean(input.responsavel.cpf)
    if (!cleanCpf) {
      throw new ValidationError('CPF do responsável é obrigatório para inscrição coletiva')
    }

    const cleanTelefone = Phone.clean(input.responsavel.telefone)
    const dataNascimento = input.responsavel.dataNascimento instanceof Date
      ? input.responsavel.dataNascimento
      : new Date(input.responsavel.dataNascimento)

    const batch = BatchInscription.create(uuidv4(), {
      eventId: input.eventId,
      categoryId: input.categoryId,
      preferredPaymentMethod: input.preferredPaymentMethod,
      valorTotalCents: totalCents,
      responsavel: {
        nome: input.responsavel.nome.trim(),
        cpf: cleanCpf,
        email: input.responsavel.email.trim(),
        telefone: cleanTelefone,
        dataNascimento,
        sexo: input.responsavel.sexo,
        cidade: input.responsavel.cidade.trim(),
      },
      cidade: input.cidade.trim(),
      participantes: input.participantes,
    })

    await this.batchRepository.save(batch)

    return { batch: batch.toJSON() }
  }

  private validateParticipantCount(count: number): void {
    if (count < 2) {
      throw new ValidationError('Lote deve ter pelo menos 2 participantes')
    }
    if (count > 50) {
      throw new ValidationError('Lote não pode ter mais de 50 participantes')
    }
  }

  private async findOpenEventAndCategory(eventId: string, categoryId: string) {
    const event = await this.eventRepository.findById(eventId)
    if (!event) throw new EventNotFoundError(eventId)
    if (!event.isOpen()) throw new EventNotOpenError()

    const category = await this.eventRepository.findCategoryById(eventId, categoryId)
    if (!category) throw new CategoryNotFoundError(categoryId)

    return category
  }
}
