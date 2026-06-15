import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, listEventTeam } from '../../../_perm-shared'

interface RouteParams {
  params: Promise<{ eventId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  const { eventId } = await params
  const result = await listEventTeam.execute({ eventId })
  return NextResponse.json(result)
}
