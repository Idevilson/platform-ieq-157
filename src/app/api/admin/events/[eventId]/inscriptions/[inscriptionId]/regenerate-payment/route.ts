import { NextRequest, NextResponse } from 'next/server'
import { CreatePaymentForInscription } from '@/server/application/payment/CreatePaymentForInscription'
import { RegeneratePaymentForInscription } from '@/server/application/payment/RegeneratePaymentForInscription'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { asaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

const paymentRepository = new FirebasePaymentRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()

const createPayment = new CreatePaymentForInscription(
  paymentRepository,
  inscriptionRepository,
  userRepository,
  asaasFeeCalculator,
)

const regeneratePayment = new RegeneratePaymentForInscription(
  createPayment,
  paymentRepository,
  inscriptionRepository,
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
    const result = await regeneratePayment.execute({ eventId, inscriptionId })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Regenerate Inscription Payment] Erro:', error)
    return NextResponse.json({ error: 'Erro ao regerar pagamento' }, { status: 500 })
  }
}
