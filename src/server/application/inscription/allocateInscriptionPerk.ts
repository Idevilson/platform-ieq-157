import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IEventPerkRepository } from '@/server/domain/event/repositories/IEventPerkRepository'

export async function allocateInscriptionPerk(
  perkRepository: IEventPerkRepository,
  eventId: string,
  inscription: Inscription,
): Promise<boolean> {
  const perk = await perkRepository.findPrimaryByEventId(eventId)
  if (!perk) {
    inscription.markBrindeUnavailable()
    return false
  }

  const result = await perkRepository.allocateToInscription(eventId, perk.id, inscription.id)
  if (result.alreadyProcessed) return inscription.temBrinde === true
  if (result.allocated && result.perkId) {
    inscription.markBrindeAllocated(result.perkId, new Date())
    return true
  }

  inscription.markBrindeUnavailable()
  return false
}
