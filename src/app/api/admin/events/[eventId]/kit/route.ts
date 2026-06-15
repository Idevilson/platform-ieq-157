import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/server/domain/shared/errors'
import { verifyAdmin, configureEventKit } from '../../../_perm-shared'

interface RouteParams {
  params: Promise<{ eventId: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  try {
    const { eventId } = await params
    const body = await request.json().catch(() => ({}))
    const result = await configureEventKit.execute({ eventId, items: Array.isArray(body.items) ? body.items : [] })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Event Kit] Erro:', error)
    return NextResponse.json({ error: 'Erro ao configurar o kit' }, { status: 500 })
  }
}
