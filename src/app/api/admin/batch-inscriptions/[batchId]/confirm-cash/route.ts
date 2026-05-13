import { NextRequest, NextResponse } from 'next/server'
import { ConfirmBatchCashPayment } from '@/server/application/inscription/ConfirmBatchCashPayment'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const perkRepository = new FirebaseEventPerkRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const confirmBatchCash = new ConfirmBatchCashPayment(batchRepository, perkRepository)

interface RouteParams {
  params: Promise<{ batchId: string }>
}

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    const user = await userRepository.findById(decoded.uid)
    return user?.isAdmin() ? decoded.uid : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { batchId } = await params
    const result = await confirmBatchCash.execute({ batchId, confirmedBy: adminId })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Confirm Batch Cash] Erro:', error)
    return NextResponse.json({ error: 'Erro ao confirmar lote' }, { status: 500 })
  }
}
