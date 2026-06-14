import { NextRequest } from 'next/server'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { asaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { RequestInscriptionUpgrade } from '@/server/application/inscription/RequestInscriptionUpgrade'
import { ConfirmUpgradeCashPayment } from '@/server/application/inscription/ConfirmUpgradeCashPayment'
import { CancelInscriptionUpgrade } from '@/server/application/inscription/CancelInscriptionUpgrade'

export const paymentRepository = new FirebasePaymentRepositoryAdmin()
export const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
export const userRepository = new FirebaseUserRepositoryAdmin()
export const eventRepository = new FirebaseEventRepositoryAdmin()

export const requestInscriptionUpgrade = new RequestInscriptionUpgrade(
  paymentRepository,
  inscriptionRepository,
  eventRepository,
  userRepository,
  asaasFeeCalculator,
)
export const confirmUpgradeCashPayment = new ConfirmUpgradeCashPayment(paymentRepository, inscriptionRepository)
export const cancelInscriptionUpgrade = new CancelInscriptionUpgrade(paymentRepository, inscriptionRepository)

/** Valida o token (Bearer ou query) e retorna o uid do admin, ou null. */
export async function resolveAdminUid(token: string | undefined): Promise<string | null> {
  if (!token) return null
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const user = await userRepository.findById(decoded.uid)
    return user?.isAdmin() ? decoded.uid : null
  } catch {
    return null
  }
}

export function bearerToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return undefined
  return authHeader.split('Bearer ')[1]
}
