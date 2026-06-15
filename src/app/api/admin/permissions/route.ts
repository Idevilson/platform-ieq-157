import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/server/domain/shared/errors'
import { verifyAdmin, listPermissions, createPermission } from '../_perm-shared'

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  const result = await listPermissions.execute()
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  try {
    const body = await request.json().catch(() => ({}))
    const result = await createPermission.execute({
      key: body.key,
      label: body.label,
      description: body.description,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof Error && /chave|rótulo/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Permissions] Erro:', error)
    return NextResponse.json({ error: 'Erro ao criar permissão' }, { status: 500 })
  }
}
