import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { InscriptionStatus } from '@/server/domain/shared/types'

export interface ListUserInscriptionsInput {
  userId: string
  status?: InscriptionStatus
}

export interface UserInscriptionDTO {
  id: string
  eventId: string
  eventTitulo: string
  eventDataInicio: Date
  categoryId: string
  categoryNome: string
  valor: number
  valorFormatado: string
  status: InscriptionStatus
  statusLabel: string
  paymentId?: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface ListUserInscriptionsOutput {
  inscriptions: UserInscriptionDTO[]
}

export class ListUserInscriptions {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(input: ListUserInscriptionsInput): Promise<ListUserInscriptionsOutput> {
    const inscriptions = await this.inscriptionRepository.findByUserId(input.userId, {
      status: input.status,
    })

    const result: UserInscriptionDTO[] = []

    for (const inscription of inscriptions) {
      const event = await this.eventRepository.findById(inscription.eventId)
      if (!event) continue

      const category = event.getCategory(inscription.categoryId)

      result.push({
        id: inscription.id,
        eventId: inscription.eventId,
        eventTitulo: event.titulo,
        eventDataInicio: event.dataInicio,
        categoryId: inscription.categoryId,
        categoryNome: category?.nome || '',
        valor: inscription.valorCents,
        valorFormatado: inscription.valorFormatado,
        status: inscription.status,
        statusLabel: inscription.statusLabel,
        paymentId: inscription.paymentId,
        criadoEm: inscription.criadoEm,
        atualizadoEm: inscription.atualizadoEm,
      })
    }

    return { inscriptions: result }
  }
}
