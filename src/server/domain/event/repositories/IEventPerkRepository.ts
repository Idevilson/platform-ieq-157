
import { EventPerk } from '../entities/EventPerk'

export interface AllocationResult {
  allocated: boolean
  perkId: string | null
  alreadyProcessed: boolean
}

export interface IEventPerkRepository {
  save(perk: EventPerk): Promise<void>
  findById(eventId: string, perkId: string): Promise<EventPerk | null>
  findByEventId(eventId: string): Promise<EventPerk[]>
  findPrimaryByEventId(eventId: string): Promise<EventPerk | null>
  delete(eventId: string, perkId: string): Promise<void>

  /**
   * Aloca atomicamente um perk a uma inscrição. Idempotente.
   * Implementação DEVE usar transaction para garantir invariante de estoque sob concorrência.
   */
  allocateToInscription(
    eventId: string,
    perkId: string,
    inscriptionId: string,
  ): Promise<AllocationResult>

  /**
   * Aloca atomicamente N unidades do perk para participantes de um lote.
   * Aloca o mínimo entre `count` e o estoque disponível.
   * Retorna quantas unidades foram efetivamente alocadas.
   */
  allocateToBatchParticipants(
    eventId: string,
    perkId: string,
    batchId: string,
    count: number,
  ): Promise<{ allocated: number; perkId: string | null }>

  incrementBatchAllocation(
    eventId: string,
    perkId: string,
    batchId: string,
    delta: number,
  ): Promise<{ allocated: number }>

  deallocateFromBatch(
    eventId: string,
    perkId: string,
    batchId: string,
    count: number,
  ): Promise<void>
}
