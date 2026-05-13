import { BatchInscription } from '../entities/BatchInscription'

export interface IBatchInscriptionRepository {
  findById(id: string): Promise<BatchInscription | null>
  findByEventId(eventId: string): Promise<BatchInscription[]>
  findByResponsavelCPF(cpf: string): Promise<BatchInscription[]>
  save(batch: BatchInscription): Promise<void>
  update(batch: BatchInscription): Promise<void>
  delete(id: string): Promise<void>
}
