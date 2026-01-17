import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { InscriptionStatus } from '@/server/domain/shared/types'

export interface ListEventInscriptionsInput {
  eventId: string
  status?: InscriptionStatus
  limit?: number
  offset?: number
}

export interface InscriptionWithDetails {
  id: string
  eventId: string
  eventTitulo: string
  categoryId: string
  categoryNome: string
  categoryValor: number
  nome: string
  email: string
  cpf: string
  telefone: string
  status: InscriptionStatus
  statusLabel: string
  valor: number
  valorFormatado: string
  paymentId?: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface ListEventInscriptionsOutput {
  inscriptions: InscriptionWithDetails[]
  total: number
  limit: number
  offset: number
}

export class ListEventInscriptions {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: ListEventInscriptionsInput): Promise<ListEventInscriptionsOutput> {
    const event = await this.eventRepository.findById(input.eventId)
    if (!event) {
      throw new Error('Evento não encontrado')
    }

    const result = await this.inscriptionRepository.findByEventId(input.eventId, {
      status: input.status,
      limit: input.limit,
      offset: input.offset,
    })

    const inscriptions: InscriptionWithDetails[] = []

    for (const inscription of result.items) {
      const category = event.getCategory(inscription.categoryId)

      let nome = ''
      let email = ''
      let cpf = ''
      let telefone = ''

      if (inscription.guestData) {
        nome = inscription.guestData.nome
        email = inscription.guestData.email.getValue()
        cpf = inscription.guestData.cpf.getValue()
        telefone = inscription.guestData.telefone.getValue()
      } else if (inscription.userId) {
        const user = await this.userRepository.findById(inscription.userId)
        if (user) {
          nome = user.nome
          email = user.email.getValue()
          cpf = user.cpf?.getValue() || ''
          telefone = user.telefone?.getValue() || ''
        }
      }

      inscriptions.push({
        id: inscription.id,
        eventId: inscription.eventId,
        eventTitulo: event.titulo,
        categoryId: inscription.categoryId,
        categoryNome: category?.nome || '',
        categoryValor: category?.valorCents || 0,
        nome,
        email,
        cpf,
        telefone,
        status: inscription.status,
        statusLabel: inscription.statusLabel,
        valor: inscription.valorCents,
        valorFormatado: inscription.valorFormatado,
        paymentId: inscription.paymentId,
        criadoEm: inscription.criadoEm,
        atualizadoEm: inscription.atualizadoEm,
      })
    }

    return {
      inscriptions,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  }
}
