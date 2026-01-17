import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { Event, CreateEventDTO } from '@/server/domain/event/entities/Event'
import { EventCategory, CreateCategoryDTO } from '@/server/domain/event/entities/EventCategory'
import { ValidationError } from '@/server/domain/shared/errors'
import { createEventSchema, CreateEventInput } from './schemas'

export interface CreateEventOutput {
  id: string
  titulo: string
  status: string
  categorias: number
}

export class CreateEvent {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    // Validate input with Zod
    const parseResult = createEventSchema.safeParse(input)

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]
      throw new ValidationError(firstError.message)
    }

    const data = parseResult.data

    // Generate event ID from title (slug)
    const eventId = this.generateSlug(data.titulo)

    // Check if event already exists
    const existingEvent = await this.eventRepository.findById(eventId)
    if (existingEvent) {
      throw new ValidationError('Ja existe um evento com este titulo')
    }

    // Determine initial status based on dates
    const now = new Date()
    const endDate = data.dataFim || data.dataInicio
    const initialStatus = endDate > now ? 'aberto' : 'encerrado'

    // Create event DTO
    const eventDTO: CreateEventDTO = {
      titulo: data.titulo.trim(),
      subtitulo: data.subtitulo?.trim(),
      descricao: data.descricao.trim(),
      descricaoCompleta: data.descricaoCompleta?.trim(),
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      local: data.local.trim(),
      endereco: data.endereco.trim(),
      googleMapsUrl: data.googleMapsUrl?.trim() || undefined,
      whatsappContato: data.whatsappContato?.trim(),
      metodosPagamento: data.metodosPagamento,
      imagemUrl: data.imagemUrl?.trim(),
      status: initialStatus,
    }

    // Create event entity
    const event = Event.create(eventId, eventDTO)

    // Save event
    await this.eventRepository.save(event)

    // Create categories if provided
    if (data.categorias && data.categorias.length > 0) {
      for (let i = 0; i < data.categorias.length; i++) {
        const catInput = data.categorias[i]
        const categoryId = this.generateSlug(catInput.nome)

        const categoryDTO: CreateCategoryDTO = {
          nome: catInput.nome.trim(),
          valor: catInput.valor,
          descricao: catInput.descricao?.trim(),
          ordem: i + 1,
        }

        const category = EventCategory.create(categoryId, categoryDTO)
        await this.eventRepository.saveCategory(eventId, category)
      }
    }

    return {
      id: event.id,
      titulo: event.titulo,
      status: event.status,
      categorias: data.categorias?.length || 0,
    }
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

// Re-export input type for use in other files
export type { CreateEventInput }
