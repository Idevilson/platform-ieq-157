import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/server/infrastructure/firebase/admin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseChurchRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseChurchRepositoryAdmin'
import { ListChurches } from '@/server/application/church/ListChurches'
import { CreateChurch } from '@/server/application/church/CreateChurch'
import {
  ChurchSlugAlreadyExistsError,
  ValidationError,
} from '@/server/domain/shared/errors'
import { extractBearerToken } from '../../auth/shared'

const userRepository = new FirebaseUserRepositoryAdmin()
const churchRepository = new FirebaseChurchRepositoryAdmin()
const listChurches = new ListChurches(churchRepository)
const createChurch = new CreateChurch(churchRepository)

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

export async function GET(request: NextRequest) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  try {
    const result = await listChurches.execute({ limit: 200 })
    return NextResponse.json({ items: result.items })
  } catch (error) {
    console.error('[GET /api/admin/churches]', error)
    return NextResponse.json({ error: 'Erro ao listar igrejas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const result = await createChurch.execute(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof ChurchSlugAlreadyExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('[POST /api/admin/churches]', error)
    return NextResponse.json({ error: 'Erro ao criar igreja' }, { status: 500 })
  }
}
