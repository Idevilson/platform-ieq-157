import { NextRequest, NextResponse } from 'next/server'
import { RegeneratePaymentForBatch } from '@/server/application/payment/RegeneratePaymentForBatch'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { AsaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const feeCalculator = new AsaasFeeCalculator()
const regeneratePayment = new RegeneratePaymentForBatch(batchRepository, feeCalculator)

interface RouteParams {
  params: Promise<{ batchId: string }>
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

    const { batchId } = await params
    const result = await regeneratePayment.execute({ batchId })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Regenerate Payment] Erro:', error)
    return NextResponse.json({ error: 'Erro ao regerar pagamento' }, { status: 500 })
  }
}
