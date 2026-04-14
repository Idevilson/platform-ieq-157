
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
}
