import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { InscriptionStatus, PaymentStatus } from '@/server/domain/shared/types'

export interface ListUserInscriptionsInput {
  userId: string
  status?: InscriptionStatus
}

export interface PaymentInfo {
  id: string
  status: PaymentStatus
  statusLabel: string
  metodoPagamento: string
  pixCopiaECola?: string
  boletoUrl?: string
  valor: string
  dataVencimento: Date
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
  payment?: PaymentInfo
  criadoEm: Date
  atualizadoEm: Date
}

export interface ListUserInscriptionsOutput {
  inscriptions: UserInscriptionDTO[]
}

export class ListUserInscriptions {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository,
    private readonly paymentRepository?: IPaymentRepository
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
      const payment = await this.getPaymentInfo(inscription.id, inscription.eventId)

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
        payment,
        criadoEm: inscription.criadoEm,
        atualizadoEm: inscription.atualizadoEm,
      })
    }

    // Sort: pending payments first, then by date descending
    result.sort((a, b) => {
      const aIsPending = a.payment?.status === 'PENDING'
      const bIsPending = b.payment?.status === 'PENDING'

      if (aIsPending && !bIsPending) return -1
      if (!aIsPending && bIsPending) return 1

      return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    })

    return { inscriptions: result }
  }

  private async getPaymentInfo(inscriptionId: string, eventId: string): Promise<PaymentInfo | undefined> {
    if (!this.paymentRepository) return undefined

    const payment = await this.paymentRepository.findByInscriptionId(inscriptionId, eventId)
    if (!payment) return undefined

    const json = payment.toJSON()
    return {
      id: json.id,
      status: json.status,
      statusLabel: json.statusLabel,
      metodoPagamento: json.metodoPagamento,
      pixCopiaECola: json.pixCopiaECola,
      boletoUrl: json.boletoUrl,
      valor: json.valorFormatado,
      dataVencimento: json.dataVencimento as Date,
    }
  }
}
