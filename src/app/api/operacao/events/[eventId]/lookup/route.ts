import { NextRequest, NextResponse } from 'next/server'
import { resolveActor, operacaoLookup, canOperate } from '../../../_shared'

interface RouteParams {
  params: Promise<{ eventId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const actor = await resolveActor(request)
  if (!actor) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  const { eventId } = await params
  if (!canOperate(actor, eventId)) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
  }

  const query = request.nextUrl.searchParams.get('q') ?? ''
  const result = await operacaoLookup.execute({ eventId, query })
  return NextResponse.json(result)
}
