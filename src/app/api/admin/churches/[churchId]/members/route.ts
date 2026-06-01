import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/server/infrastructure/firebase/admin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseChurchRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseChurchRepositoryAdmin'
import { ListChurchMembers } from '@/server/application/church/ListChurchMembers'
import { ChurchNotFoundError, ValidationError } from '@/server/domain/shared/errors'
import { extractBearerToken } from '../../../../auth/shared'

const userRepository = new FirebaseUserRepositoryAdmin()
const churchRepository = new FirebaseChurchRepositoryAdmin()
const listChurchMembers = new ListChurchMembers(churchRepository)

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const token = extractBearerToken(request.headers.get('Authorization'))
  if (!token) return null
  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    const user = await userRepository.findById(decoded.uid)
    if (!user?.isAdmin()) return null
    return decoded.uid
  } catch {
    return null
  }
}

interface RouteContext {
  params: Promise<{ churchId: string }>
}

export async function GET(request: NextRequest, ctx: RouteContext) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  try {
    const { churchId } = await ctx.params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = await listChurchMembers.execute({ churchId, search, limit, offset })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof ChurchNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[GET /api/admin/churches/:id/members]', error)
    return NextResponse.json({ error: 'Erro ao listar membros' }, { status: 500 })
  }
}
