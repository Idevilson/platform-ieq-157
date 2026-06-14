import { NextRequest, NextResponse } from 'next/server'
import { CreatePaymentForInscription } from '@/server/application/payment/CreatePaymentForInscription'
import { ChangeInscriptionPaymentMethod } from '@/server/application/payment/ChangeInscriptionPaymentMethod'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { asaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'
import { InscriptionPaymentMethod, INSCRIPTION_PAYMENT_METHODS } from '@/shared/constants'

const paymentRepository = new FirebasePaymentRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()

const createPayment = new CreatePaymentForInscription(
  paymentRepository,
  inscriptionRepository,
  userRepository,
  asaasFeeCalculator,
)
const changePaymentMethod = new ChangeInscriptionPaymentMethod(
  paymentRepository,
  inscriptionRepository,
  createPayment,
)

interface RouteParams {
  params: Promise<{ eventId: string; inscriptionId: string }>
}

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    const user = await userRepository.findById(decoded.uid)
    return user?.isAdmin() ?? false
  } catch {
    return false
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { eventId, inscriptionId } = await params
    const body = await request.json().catch(() => ({}))
    const metodo = body.metodo as InscriptionPaymentMethod
    if (!metodo || !(INSCRIPTION_PAYMENT_METHODS as readonly string[]).includes(metodo)) {
      return NextResponse.json({ error: 'Meio de pagamento inválido' }, { status: 400 })
    }

    const result = await changePaymentMethod.execute({ eventId, inscriptionId, metodo })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Change Payment Method] Erro:', error)
    return NextResponse.json({ error: 'Erro ao trocar o meio de pagamento' }, { status: 500 })
  }
}
