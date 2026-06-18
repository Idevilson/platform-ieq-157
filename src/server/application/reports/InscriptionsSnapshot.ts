import { Event } from '@/server/domain/event/entities/Event'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'
import { EventDTO } from '@/shared/types/event'
import { InscriptionDTO, BatchInscriptionDTO } from '@/shared/types/inscription'
import { InscriptionsSnapshotV1 } from '@/shared/types/snapshot'

interface BuildSnapshotInput {
  event: Event
  inscriptions: Inscription[]
  batches: BatchInscription[]
}

export function buildInscriptionsSnapshot(input: BuildSnapshotInput): InscriptionsSnapshotV1 {
  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    event: input.event.toJSON() as unknown as EventDTO,
    inscriptions: input.inscriptions.map((i) => i.toJSON() as unknown as InscriptionDTO),
    batches: input.batches.map((b) => b.toJSON() as unknown as BatchInscriptionDTO),
  }
}
