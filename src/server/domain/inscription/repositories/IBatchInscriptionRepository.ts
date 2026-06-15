import { BatchInscription } from '../entities/BatchInscription'

export interface IBatchInscriptionRepository {
  findById(id: string): Promise<BatchInscription | null>
  findByEventId(eventId: string): Promise<BatchInscription[]>
  findByResponsavelCPF(cpf: string): Promise<BatchInscription[]>
  findByEventIdAndResponsavelCPF(eventId: string, cpf: string): Promise<BatchInscription[]>
  findCashPendingByEvent(eventId: string): Promise<BatchInscription[]>
  findKitPendingByEvent(eventId: string, limit: number): Promise<BatchInscription[]>
  countKitPendingByEvent(eventId: string): Promise<number>
  save(batch: BatchInscription): Promise<void>
  update(batch: BatchInscription): Promise<void>
  delete(id: string): Promise<void>
}
