
import { Payment } from '../entities/Payment'
import { PaymentStatus, PaginationParams } from '@/server/domain/shared/types'

export interface ListPaymentsParams extends PaginationParams {
  status?: PaymentStatus
}

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>
  findByAsaasPaymentId(asaasPaymentId: string): Promise<Payment | null>
  findByInscriptionId(inscriptionId: string): Promise<Payment | null>
  findByUserId(userId: string, params?: ListPaymentsParams): Promise<Payment[]>
  save(payment: Payment): Promise<void>
  update(payment: Payment): Promise<void>
  delete(id: string): Promise<void>

  // Stats
  sumConfirmedByEventId(eventId: string): Promise<number>
}
