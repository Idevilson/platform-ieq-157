import { NextRequest, NextResponse } from 'next/server'
import { CreatePaymentForBatch } from '@/server/application/payment/CreatePaymentForBatch'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { AsaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const feeCalculator = new AsaasFeeCalculator()
const createPaymentForBatch = new CreatePaymentForBatch(batchRepository, feeCalculator)

interface RouteParams {
  params: Promise<{ batchId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Autenticação obrigatória' }, { status: 401 })
    }
    const token = authHeader.split('Bearer ')[1]
    try {
      await adminAuth.verifyIdToken(token)
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { batchId } = await params
    const result = await createPaymentForBatch.execute({ batchId })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Batch Payment] Erro:', error)
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 })
  }
}
