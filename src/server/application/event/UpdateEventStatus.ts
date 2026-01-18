import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { EventStatus } from '@/server/domain/shared/types'
import { EventNotFoundError, ValidationError } from '@/server/domain/shared/errors'
import { updateEventStatusSchema, UpdateEventStatusInput } from './schemas'

export interface UpdateEventStatusOutput {
  id: string
  titulo: string
  status: string
  statusLabel: string
}

const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  rascunho: ['aberto', 'cancelado'],
  aberto: ['fechado', 'encerrado', 'cancelado'],
  fechado: ['aberto', 'encerrado', 'cancelado'],
  encerrado: [],
  cancelado: [],
}

const STATUS_LABELS: Record<EventStatus, string> = {
  rascunho: 'Rascunho',
  aberto: 'Inscricoes Abertas',
  fechado: 'Inscricoes Encerradas',
  encerrado: 'Evento Encerrado',
  cancelado: 'Evento Cancelado',
}

export class UpdateEventStatus {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: UpdateEventStatusInput): Promise<UpdateEventStatusOutput> {
    // Validate input with Zod
    const parseResult = updateEventStatusSchema.safeParse(input)

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      throw new ValidationError(firstError.message)
    }

    const { eventId, status: newStatus } = parseResult.data

    const event = await this.eventRepository.findById(eventId)

    if (!event) {
      throw new EventNotFoundError(eventId)
    }

    const currentStatus = event.status

    // Validate status transition
    const allowedTransitions = VALID_TRANSITIONS[currentStatus]
    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Nao e possivel alterar o status de "${STATUS_LABELS[currentStatus]}" para "${STATUS_LABELS[newStatus]}"`
      )
    }

    // Update status
    event.update({ status: newStatus })
    await this.eventRepository.update(event)

    return {
      id: event.id,
      titulo: event.titulo,
      status: event.status,
      statusLabel: STATUS_LABELS[event.status],
    }
  }
}

// Re-export input type
export type { UpdateEventStatusInput }
