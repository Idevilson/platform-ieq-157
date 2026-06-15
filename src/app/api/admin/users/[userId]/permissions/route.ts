import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/server/domain/shared/errors'
import { verifyAdmin, setUserPermissions } from '../../../_perm-shared'

interface RouteParams {
  params: Promise<{ userId: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  try {
    const { userId } = await params
    const body = await request.json().catch(() => ({}))
    const result = await setUserPermissions.execute({ targetUserId: userId, grants: body.grants ?? [] })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Users Permissions] Erro:', error)
    return NextResponse.json({ error: 'Erro ao atualizar permissões' }, { status: 500 })
  }
}
