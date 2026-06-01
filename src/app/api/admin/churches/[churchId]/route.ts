import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/server/infrastructure/firebase/admin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseChurchRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseChurchRepositoryAdmin'
import { GetChurchById } from '@/server/application/church/GetChurchById'
import { UpdateChurch } from '@/server/application/church/UpdateChurch'
import { DeleteChurch } from '@/server/application/church/DeleteChurch'
import {
  CannotDeleteChurchWithMembersError,
  ChurchNotFoundError,
  ValidationError,
} from '@/server/domain/shared/errors'
import { extractBearerToken } from '../../../auth/shared'

const userRepository = new FirebaseUserRepositoryAdmin()
const churchRepository = new FirebaseChurchRepositoryAdmin()
const getChurchById = new GetChurchById(churchRepository)
const updateChurch = new UpdateChurch(churchRepository)
const deleteChurch = new DeleteChurch(churchRepository)

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
    const church = await getChurchById.execute(churchId)
    return NextResponse.json({ church })
  } catch (error) {
    if (error instanceof ChurchNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[GET /api/admin/churches/:id]', error)
    return NextResponse.json({ error: 'Erro ao buscar igreja' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  try {
    const { churchId } = await ctx.params
    const body = await request.json()
    const result = await updateChurch.execute(churchId, body)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof ChurchNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[PATCH /api/admin/churches/:id]', error)
    return NextResponse.json({ error: 'Erro ao atualizar igreja' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  try {
    const { churchId } = await ctx.params
    await deleteChurch.execute(churchId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ChurchNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof CannotDeleteChurchWithMembersError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('[DELETE /api/admin/churches/:id]', error)
    return NextResponse.json({ error: 'Erro ao excluir igreja' }, { status: 500 })
  }
}
