import { IInscriptionRepository } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'
import { ValidationError } from '@/server/domain/shared/errors'
import { InscriptionPaymentMethod, KitDeliveryDTO, KitItemDef, Gender, ShirtSize } from '@/shared/constants'
import { toInscriptionWithDetails } from '../inscription/toInscriptionWithDetails'
import type { InscriptionWithDetails } from '../inscription/ListEventInscriptions'

const KIT_PENDING_LIMIT = 50

export interface OpsBatchDTO {
  id: string
  responsavelNome: string
  responsavelCpf?: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  preferredPaymentMethod: InscriptionPaymentMethod
  totalParticipantes: number
  kitDeliveries?: KitDeliveryDTO[]
  confirmadoPorNome?: string
  participantes: { nome: string; sexo: Gender; tamanho?: ShirtSize; temBrinde?: boolean }[]
}

export interface OperacaoLookupOutput {
  mode: 'search' | 'worklist'
  kitConfigured: boolean
  kitItems: KitItemDef[]
  counts: { cashPending: number; kitPending: number }
  kitPendingCapped: boolean
  inscriptions: InscriptionWithDetails[]
  batches: OpsBatchDTO[]
}

export interface OperacaoLookupInput {
  eventId: string
  query?: string
}

export class OperacaoLookup {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly inscriptionRepository: IInscriptionRepository,
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: OperacaoLookupInput): Promise<OperacaoLookupOutput> {
    const event = await this.eventRepository.findById(input.eventId)
    if (!event) throw new ValidationError('Evento não encontrado')

    const kitConfigured = event.kitItems.length > 0
    const digits = (input.query ?? '').replace(/\D/g, '')

    if (digits.length >= 11) {
      return this.search(input.eventId, digits, event, kitConfigured)
    }
    return this.worklist(input.eventId, event, kitConfigured)
  }

  private async search(
    eventId: string,
    cpf: string,
    event: Awaited<ReturnType<IEventRepository['findById']>>,
    kitConfigured: boolean,
  ): Promise<OperacaoLookupOutput> {
    const found: Inscription[] = []
    const guest = await this.inscriptionRepository.findByEventIdAndCPF(eventId, cpf)
    if (guest) found.push(guest)

    const user = await this.userRepository.findByCPF(cpf)
    if (user) {
      const accountInscription = await this.inscriptionRepository.findByEventIdAndUserId(eventId, user.toJSON().id)
      if (accountInscription && !found.some((f) => f.id === accountInscription.id)) {
        found.push(accountInscription)
      }
    }

    const batchEntities = await this.batchRepository.findByEventIdAndResponsavelCPF(eventId, cpf)

    const inscriptions = await Promise.all(found.map((i) => toInscriptionWithDetails(i, event!, this.userRepository)))
    return {
      mode: 'search',
      kitConfigured,
      kitItems: event!.kitItems,
      counts: { cashPending: 0, kitPending: 0 },
      kitPendingCapped: false,
      inscriptions,
      batches: batchEntities.map(toOpsBatchDTO),
    }
  }

  private async worklist(
    eventId: string,
    event: Awaited<ReturnType<IEventRepository['findById']>>,
    kitConfigured: boolean,
  ): Promise<OperacaoLookupOutput> {
    const [cashInscriptions, cashBatches, kitInscriptions, kitBatches, kitInscCount, kitBatchCount] =
      await Promise.all([
        this.inscriptionRepository.findCashPendingByEvent(eventId),
        this.batchRepository.findCashPendingByEvent(eventId),
        kitConfigured ? this.inscriptionRepository.findKitPendingByEvent(eventId, KIT_PENDING_LIMIT) : Promise.resolve([]),
        kitConfigured ? this.batchRepository.findKitPendingByEvent(eventId, KIT_PENDING_LIMIT) : Promise.resolve([]),
        kitConfigured ? this.inscriptionRepository.countKitPendingByEvent(eventId) : Promise.resolve(0),
        kitConfigured ? this.batchRepository.countKitPendingByEvent(eventId) : Promise.resolve(0),
      ])

    const inscriptionEntities = dedupeById([...cashInscriptions, ...kitInscriptions])
    const batchEntities = dedupeById([...cashBatches, ...kitBatches])

    const inscriptions = await Promise.all(
      inscriptionEntities.map((i) => toInscriptionWithDetails(i, event!, this.userRepository)),
    )

    return {
      mode: 'worklist',
      kitConfigured,
      kitItems: event!.kitItems,
      counts: {
        cashPending: cashInscriptions.length + cashBatches.length,
        kitPending: kitInscCount + kitBatchCount,
      },
      kitPendingCapped: kitInscriptions.length >= KIT_PENDING_LIMIT || kitBatches.length >= KIT_PENDING_LIMIT,
      inscriptions,
      batches: batchEntities.map(toOpsBatchDTO),
    }
  }
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => (seen.has(item.id) ? false : seen.add(item.id)))
}

function toOpsBatchDTO(batch: BatchInscription): OpsBatchDTO {
  const json = batch.toJSON()
  return {
    id: json.id,
    responsavelNome: json.responsavel.nome,
    responsavelCpf: json.responsavel.cpf,
    status: json.status,
    preferredPaymentMethod: json.preferredPaymentMethod,
    totalParticipantes: json.totalParticipantes,
    kitDeliveries: json.kitDeliveries,
    confirmadoPorNome: json.confirmadoPorNome,
    participantes: json.participantes.map((p) => ({ nome: p.nome, sexo: p.sexo, tamanho: p.tamanho ?? undefined, temBrinde: p.temBrinde })),
  }
}
