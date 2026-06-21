
import { Inscription } from '../entities/Inscription'
import { InscriptionStatus, PaginationParams, PaginatedResult } from '@/server/domain/shared/types'

export interface ListInscriptionsParams extends PaginationParams {
  status?: InscriptionStatus
}

export interface IInscriptionRepository {
  findById(id: string, eventId?: string): Promise<Inscription | null>
  findByUserId(userId: string, params?: ListInscriptionsParams): Promise<Inscription[]>
  findByEventId(eventId: string, params?: ListInscriptionsParams): Promise<PaginatedResult<Inscription>>
  findAllByEventId(eventId: string): Promise<Inscription[]>
  findByEventIdAndUserId(eventId: string, userId: string): Promise<Inscription | null>
  findByEventIdAndCPF(eventId: string, cpf: string): Promise<Inscription | null>
  findByCPF(cpf: string): Promise<Inscription[]>
  findCashPendingByEvent(eventId: string): Promise<Inscription[]>
  findKitPendingByEvent(eventId: string, limit: number): Promise<Inscription[]>
  countKitPendingByEvent(eventId: string): Promise<number>
  save(inscription: Inscription): Promise<void>
  update(inscription: Inscription): Promise<void>
  delete(id: string, eventId: string): Promise<void>

  // Stats
  countByEventId(eventId: string): Promise<number>
  countByEventIdAndStatus(eventId: string, status: InscriptionStatus): Promise<number>
}
