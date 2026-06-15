import { NextRequest, NextResponse } from 'next/server'
import { resolveActor, listEvents, canOperate } from '../_shared'

export async function GET(request: NextRequest) {
  const actor = await resolveActor(request)
  if (!actor) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  const { events } = await listEvents.execute({})
  const operable = events
    .filter((e) => canOperate(actor, e.id))
    .map((e) => ({ id: e.id, titulo: e.titulo, status: e.status, kitItems: e.kitItems ?? [] }))

  return NextResponse.json({ events: operable })
}
