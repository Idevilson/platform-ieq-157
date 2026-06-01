import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/server/infrastructure/firebase/admin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseChurchRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseChurchRepositoryAdmin'
import { SetUserChurch } from '@/server/application/user/SetUserChurch'
import { ClearUserChurch } from '@/server/application/user/ClearUserChurch'
import { GetChurchById } from '@/server/application/church/GetChurchById'
import {
  ChurchInactiveError,
  ChurchNotFoundError,
  UserNotFoundError,
  ValidationError,
} from '@/server/domain/shared/errors'
import { extractBearerToken } from '../../auth/shared'

const userRepository = new FirebaseUserRepositoryAdmin()
const churchRepository = new FirebaseChurchRepositoryAdmin()
const setUserChurch = new SetUserChurch(userRepository, churchRepository)
const clearUserChurch = new ClearUserChurch(userRepository, churchRepository)
const getChurchById = new GetChurchById(churchRepository)

async function authenticate(request: NextRequest): Promise<string | null> {
  const token = extractBearerToken(request.headers.get('Authorization'))
  if (!token) return null
  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    return decoded.uid
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const userId = await authenticate(request)
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await userRepository.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const churchId = user.getChurchId()
    if (!churchId) {
      return NextResponse.json({ churchId: null, church: null })
    }

    try {
      const church = await getChurchById.execute(churchId)
      return NextResponse.json({
        churchId,
        church: {
          id: church.id,
          nome: church.nome,
          slug: church.slug,
          cidade: church.cidade,
          estado: church.estado,
          ativo: church.ativo,
        },
      })
    } catch (err) {
      if (err instanceof ChurchNotFoundError) {
        return NextResponse.json({ churchId, church: null })
      }
      throw err
    }
  } catch (error) {
    console.error('[GET /api/user/church]', error)
    return NextResponse.json({ error: 'Erro ao buscar igreja do usuário' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const userId = await authenticate(request)
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    await setUserChurch.execute(userId, body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof ChurchNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ChurchInactiveError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[PUT /api/user/church]', error)
    return NextResponse.json({ error: 'Erro ao vincular igreja' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await authenticate(request)
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await clearUserChurch.execute(userId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[DELETE /api/user/church]', error)
    return NextResponse.json({ error: 'Erro ao remover vínculo' }, { status: 500 })
  }
}
