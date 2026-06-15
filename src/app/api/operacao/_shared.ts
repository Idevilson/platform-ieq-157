import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { ListEvents } from '@/server/application/event/ListEvents'
import { OperacaoLookup } from '@/server/application/operacao/OperacaoLookup'
import { DELIVER_KITS_PERMISSION, CONFIRM_CASH_PERMISSION } from '@/shared/constants'
import { resolveActor, Actor } from '../admin/_perm-shared'

const eventRepository = new FirebaseEventRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
export const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()

export const listEvents = new ListEvents(eventRepository)
export const operacaoLookup = new OperacaoLookup(eventRepository, inscriptionRepository, batchRepository, userRepository)

export function canOperate(actor: Actor, eventId: string): boolean {
  return (
    actor.isAdmin ||
    actor.hasPermission(DELIVER_KITS_PERMISSION, eventId) ||
    actor.hasPermission(CONFIRM_CASH_PERMISSION, eventId)
  )
}

export { resolveActor }
export type { Actor }
