import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { ValidationError } from '@/server/domain/shared/errors'
import { BatchLookupResult } from '@/shared/types/inscription'

export interface LookupBatchByCPFInput {
  cpf: string
}

export interface LookupBatchByCPFOutput {
  batches: BatchLookupResult[]
}

export class LookupBatchByCPF {
  constructor(
    private readonly batchRepository: IBatchInscriptionRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(input: LookupBatchByCPFInput): Promise<LookupBatchByCPFOutput> {
    if (!CPF.isValid(input.cpf)) {
      throw new ValidationError('CPF inválido', { cpf: 'O CPF informado é inválido' })
    }

    const cleanCpf = CPF.clean(input.cpf)
    const batches = await this.batchRepository.findByResponsavelCPF(cleanCpf)

    const results: BatchLookupResult[] = []
    for (const batch of batches) {
      const event = await this.eventRepository.findById(batch.eventId)
      const json = batch.toJSON()

      results.push({
        batchId: batch.id,
        eventId: batch.eventId,
        eventTitle: event?.titulo ?? batch.eventId,
        status: batch.status,
        totalParticipantes: batch.totalParticipantes,
        cidade: batch.cidade,
        valorTotal: batch.valorTotalCents,
        valorTotalFormatado: batch.valorTotalFormatado,
        preferredPaymentMethod: batch.preferredPaymentMethod,
        participantes: json.participantes.map(p => ({ nome: p.nome, sexo: p.sexo })),
        payment: json.paymentId
          ? {
              status: json.paymentStatus ?? 'PENDING',
              pixCopiaECola: json.pixCopiaECola,
              pixQrCode: json.pixQrCode,
              checkoutUrl: json.checkoutUrl,
              dataVencimento: json.dataVencimentoPagamento,
            }
          : undefined,
      })
    }

    return { batches: results }
  }
}
