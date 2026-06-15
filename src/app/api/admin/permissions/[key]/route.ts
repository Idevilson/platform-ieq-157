import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/server/domain/shared/errors'
import { verifyAdmin, updatePermission, deletePermission } from '../../_perm-shared'

interface RouteParams {
  params: Promise<{ key: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  try {
    const { key } = await params
    const body = await request.json().catch(() => ({}))
    const result = await updatePermission.execute({ key, label: body.label, description: body.description })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Permissions PATCH] Erro:', error)
    return NextResponse.json({ error: 'Erro ao atualizar permissão' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  try {
    const { key } = await params
    const result = await deletePermission.execute(key)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Permissions DELETE] Erro:', error)
    return NextResponse.json({ error: 'Erro ao remover permissão' }, { status: 500 })
  }
}
