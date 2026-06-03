import { IBatchInscriptionRepository } from '@/server/domain/inscription/repositories/IBatchInscriptionRepository'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { ValidationError } from '@/server/domain/shared/errors'

export interface UpdateBatchResponsavelInput {
  batchId: string
  nome?: string
  cpf?: string
}

export class UpdateBatchResponsavel {
  constructor(private readonly batchRepository: IBatchInscriptionRepository) {}

  async execute(input: UpdateBatchResponsavelInput): Promise<void> {
    const batch = await this.batchRepository.findById(input.batchId)
    if (!batch) throw new ValidationError('Lote não encontrado')

    const nome = input.nome?.trim()
    if (nome !== undefined && !nome) throw new ValidationError('Nome não pode ser vazio')

    const cpf = input.cpf !== undefined ? CPF.clean(input.cpf) : undefined
    if (input.cpf !== undefined && !cpf) throw new ValidationError('CPF inválido')

    batch.updateResponsavel({ nome, cpf })
    await this.batchRepository.update(batch)
  }
}
