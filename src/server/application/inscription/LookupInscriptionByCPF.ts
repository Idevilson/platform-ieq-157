import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { EventNotFoundError, ValidationError } from '@/server/domain/shared/errors'

export interface LookupInscriptionByCPFInput {
  cpf: string
  eventId?: string // Optional: filter by specific event
}

export interface InscriptionWithEvent {
  inscription: ReturnType<Inscription['toJSON']>
  eventTitle?: string
  categoryName?: string
}

export interface LookupInscriptionByCPFOutput {
  inscriptions: InscriptionWithEvent[]
}

export class LookupInscriptionByCPF {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(input: LookupInscriptionByCPFInput): Promise<LookupInscriptionByCPFOutput> {
    // Validate CPF
    if (!CPF.isValid(input.cpf)) {
      throw new ValidationError('CPF inválido', {
        cpf: 'O CPF informado é inválido',
      })
    }

    const cleanCpf = CPF.clean(input.cpf)

    // If specific event requested, validate it exists
    if (input.eventId) {
      const event = await this.eventRepository.findById(input.eventId)
      if (!event) {
        throw new EventNotFoundError(input.eventId)
      }

      const inscription = await this.inscriptionRepository.findByEventIdAndCPF(
        input.eventId,
        cleanCpf
      )

      if (!inscription) {
        return { inscriptions: [] }
      }

      const category = await this.eventRepository.findCategoryById(
        inscription.eventId,
        inscription.categoryId
      )

      return {
        inscriptions: [{
          inscription: inscription.toJSON(),
          eventTitle: event.titulo,
          categoryName: category?.toJSON().nome,
        }],
      }
    }

    // Find all inscriptions with this CPF
    const inscriptions = await this.inscriptionRepository.findByCPF(cleanCpf)

    // Enrich with event data
    const enrichedInscriptions: InscriptionWithEvent[] = []
    for (const inscription of inscriptions) {
      const event = await this.eventRepository.findById(inscription.eventId)
      const category = event
        ? await this.eventRepository.findCategoryById(inscription.eventId, inscription.categoryId)
        : null

      enrichedInscriptions.push({
        inscription: inscription.toJSON(),
        eventTitle: event?.titulo,
        categoryName: category?.toJSON().nome,
      })
    }

    return { inscriptions: enrichedInscriptions }
  }
}
