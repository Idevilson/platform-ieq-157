import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/server/domain/shared/errors'
import { DELIVER_KITS_PERMISSION } from '@/shared/constants'
import { resolveActor, deliverFullKit, batchRepository } from '../../../_perm-shared'

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
    if (!actor.isAdmin && !actor.hasPermission(DELIVER_KITS_PERMISSION, batch.eventId)) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    }
    const result = await deliverFullKit.execute({
      eventId: batch.eventId,
      target: { kind: 'batch', batchId },
      actorUserId: actor.uid,
      actorNome: actor.nome,
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Batch Kit] Erro:', error)
    return NextResponse.json({ error: 'Erro ao registrar entrega' }, { status: 500 })
  }
}
