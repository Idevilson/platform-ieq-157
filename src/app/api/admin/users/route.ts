import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, listUsers } from '../_perm-shared'

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  const query = request.nextUrl.searchParams.get('q') ?? undefined
  const result = await listUsers.execute({ query })
  return NextResponse.json(result)
}
