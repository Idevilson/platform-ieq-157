import { EventDTO } from './event'
import { InscriptionDTO, BatchInscriptionDTO } from './inscription'

export interface InscriptionsSnapshotV1 {
  version: 1
  capturedAt: string
  event: EventDTO
  inscriptions: InscriptionDTO[]
  batches: BatchInscriptionDTO[]
}
