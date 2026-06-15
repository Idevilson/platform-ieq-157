import { NextRequest, NextResponse } from 'next/server'
import { ConfirmBatchCashPayment } from '@/server/application/inscription/ConfirmBatchCashPayment'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'
import { FirebaseAuditLogRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseAuditLogRepositoryAdmin'
import { ValidationError } from '@/server/domain/shared/errors'
import { CONFIRM_CASH_PERMISSION } from '@/shared/constants'
import { resolveActor } from '../../../_perm-shared'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const perkRepository = new FirebaseEventPerkRepositoryAdmin()
const auditLogRepository = new FirebaseAuditLogRepositoryAdmin()
const confirmBatchCash = new ConfirmBatchCashPayment(batchRepository, perkRepository, auditLogRepository)

interface RouteParams {
  params: Promise<{ batchId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const actor = await resolveActor(request)
    if (!actor) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { batchId } = await params
    const batch = await batchRepository.findById(batchId)
    if (!batch) {
      return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 })
    }
    if (!actor.isAdmin && !actor.hasPermission(CONFIRM_CASH_PERMISSION, batch.eventId)) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    }

    const result = await confirmBatchCash.execute({
      batchId,
      confirmedBy: actor.uid,
      confirmedByNome: actor.nome,
      requireCash: !actor.isAdmin,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Confirm Batch Cash] Erro:', error)
    return NextResponse.json({ error: 'Erro ao confirmar lote' }, { status: 500 })
  }
}
