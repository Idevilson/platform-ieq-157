import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { InscriptionStatus } from '@/server/domain/shared/types'
import { InscriptionPaymentMethod, KitDeliveryDTO, Gender } from '@/shared/constants'
import { toInscriptionWithDetails } from './toInscriptionWithDetails'

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
  sexo?: Gender
  status: InscriptionStatus
  statusLabel: string
  valor: number
  valorFormatado: string
  cidade?: string
  paymentId?: string
  preferredPaymentMethod: InscriptionPaymentMethod
  tamanho?: string
  temBrinde?: boolean
  perkId?: string
  brindeAlocadoEm?: Date
  confirmadoPorNome?: string
  confirmadoEm?: Date
  kitDeliveries?: KitDeliveryDTO[]
  pendingUpgrade?: PendingUpgradeDetails
  criadoEm: Date
  atualizadoEm: Date
}

export interface PendingUpgradeDetails {
  targetCategoryId: string
  targetCategoryNome: string
  targetValorCents: number
  diferencaBaseCents: number
  adjustmentPaymentId: string
  metodo: InscriptionPaymentMethod
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
      inscriptions.push(await toInscriptionWithDetails(inscription, event, this.userRepository))
    }

    return {
      inscriptions,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    }
  }
}
