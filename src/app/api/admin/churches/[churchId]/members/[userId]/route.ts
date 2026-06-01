import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/server/infrastructure/firebase/admin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseChurchRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseChurchRepositoryAdmin'
import { AdminRemoveUserFromChurch } from '@/server/application/user/AdminRemoveUserFromChurch'
import {
  UserNotFoundError,
  UserNotLinkedToChurchError,
} from '@/server/domain/shared/errors'
import { extractBearerToken } from '../../../../../auth/shared'

const userRepository = new FirebaseUserRepositoryAdmin()
const churchRepository = new FirebaseChurchRepositoryAdmin()
const adminRemoveUserFromChurch = new AdminRemoveUserFromChurch(userRepository, churchRepository)

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
  params: Promise<{ churchId: string; userId: string }>
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  try {
    const { churchId, userId } = await ctx.params
    await adminRemoveUserFromChurch.execute(userId, churchId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof UserNotLinkedToChurchError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('[DELETE /api/admin/churches/:id/members/:userId]', error)
    return NextResponse.json({ error: 'Erro ao remover vínculo' }, { status: 500 })
  }
}
