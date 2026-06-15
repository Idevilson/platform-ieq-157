import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/server/domain/shared/errors'
import { DELIVER_KITS_PERMISSION } from '@/shared/constants'
import { resolveActor, deliverFullKit } from '../../../../../_perm-shared'

interface RouteParams {
  params: Promise<{ eventId: string; inscriptionId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const actor = await resolveActor(request)
    if (!actor) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }
    const { eventId, inscriptionId } = await params
    if (!actor.isAdmin && !actor.hasPermission(DELIVER_KITS_PERMISSION, eventId)) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    }
    const result = await deliverFullKit.execute({
      eventId,
      target: { kind: 'inscription', inscriptionId },
      actorUserId: actor.uid,
      actorNome: actor.nome,
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Inscription Kit] Erro:', error)
    return NextResponse.json({ error: 'Erro ao registrar entrega' }, { status: 500 })
  }
}
