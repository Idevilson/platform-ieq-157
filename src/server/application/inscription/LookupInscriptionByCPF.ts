import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IPaymentRepository } from '@/server/domain/payment/repositories/IPaymentRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { EventNotFoundError, ValidationError } from '@/server/domain/shared/errors'

export interface LookupInscriptionByCPFInput {
  cpf: string
  eventId?: string
}

export interface PaymentInfo {
  id: string
  status: string
  statusLabel: string
  metodoPagamento: string
  pixCopiaECola?: string
  boletoUrl?: string
  valor: string
  dataVencimento: Date
}

export interface InscriptionWithEvent {
  inscription: ReturnType<Inscription['toJSON']>
  eventTitle?: string
  categoryName?: string
  payment?: PaymentInfo
}

export interface LookupInscriptionByCPFOutput {
  inscriptions: InscriptionWithEvent[]
}

export class LookupInscriptionByCPF {
  constructor(
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly eventRepository: IEventRepository,
    private readonly paymentRepository?: IPaymentRepository,
    private readonly userRepository?: IUserRepository
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

      const payment = await this.getPaymentInfo(inscription.id, input.eventId)

      return {
        inscriptions: [{
          inscription: inscription.toJSON(),
          eventTitle: event.titulo,
          categoryName: category?.toJSON().nome,
          payment,
        }],
      }
    }

    // Find all inscriptions with this CPF
    const allInscriptions = await this.findAllInscriptionsByCPF(cleanCpf)

    // Enrich with event and payment data
    const enrichedInscriptions: InscriptionWithEvent[] = []
    for (const inscription of allInscriptions) {
      const event = await this.eventRepository.findById(inscription.eventId)
      const category = event
        ? await this.eventRepository.findCategoryById(inscription.eventId, inscription.categoryId)
        : null
      const payment = await this.getPaymentInfo(inscription.id, inscription.eventId)

      enrichedInscriptions.push({
        inscription: inscription.toJSON(),
        eventTitle: event?.titulo,
        categoryName: category?.toJSON().nome,
        payment,
      })
    }

    return { inscriptions: enrichedInscriptions }
  }

  private async findAllInscriptionsByCPF(cpf: string): Promise<Inscription[]> {
    const guestInscriptions = await this.inscriptionRepository.findByCPF(cpf)
    const userInscriptions = await this.findUserInscriptionsByCPF(cpf)
    return this.mergeInscriptions(guestInscriptions, userInscriptions)
  }

  private async findUserInscriptionsByCPF(cpf: string): Promise<Inscription[]> {
    if (!this.userRepository) return []
    const user = await this.userRepository.findByCPF(cpf)
    if (!user) return []
    return this.inscriptionRepository.findByUserId(user.toJSON().id)
  }

  private mergeInscriptions(first: Inscription[], second: Inscription[]): Inscription[] {
    const inscriptionsMap = new Map<string, Inscription>()
    first.forEach(inscription => inscriptionsMap.set(inscription.id, inscription))
    second.forEach(inscription => inscriptionsMap.set(inscription.id, inscription))
    return Array.from(inscriptionsMap.values())
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
