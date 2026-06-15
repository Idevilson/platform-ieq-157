import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { ValidationError } from '@/server/domain/shared/errors'
import { KitItemDef } from '@/shared/constants'

export interface ConfigureEventKitInput {
  eventId: string
  items: KitItemDef[]
}

function slug(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export class ConfigureEventKit {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(input: ConfigureEventKitInput) {
    const event = await this.eventRepository.findById(input.eventId)
    if (!event) throw new ValidationError('Evento não encontrado')

    const seen = new Set<string>()
    const items: KitItemDef[] = input.items
      .filter((it) => it.nome?.trim())
      .map((it) => {
        let id = (it.id?.trim() || slug(it.nome)) || 'item'
        while (seen.has(id)) id = `${id}-2`
        seen.add(id)
        return { id, nome: it.nome.trim(), condicionalAoBrinde: !!it.condicionalAoBrinde, porTamanho: !!it.porTamanho }
      })

    event.setKitItems(items)
    await this.eventRepository.update(event)
    return { kitItems: event.kitItems }
  }
}
