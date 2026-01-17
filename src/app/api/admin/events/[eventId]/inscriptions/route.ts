import { NextRequest, NextResponse } from 'next/server'
import { ListEventInscriptions } from '@/server/application/inscription/ListEventInscriptions'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { InscriptionStatus } from '@/server/domain/shared/types'

const eventRepository = new FirebaseEventRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const listEventInscriptions = new ListEventInscriptions(
  inscriptionRepository,
  eventRepository,
  userRepository
)

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    const user = await userRepository.findById(decodedToken.uid)
    if (!user || !user.isAdmin()) {
      return null
    }
    return decodedToken.uid
  } catch {
    return null
  }
}

interface RouteParams {
  params: Promise<{ eventId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      )
    }

    const { eventId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as InscriptionStatus | null
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = await listEventInscriptions.execute({
      eventId,
      status: status || undefined,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Admin Inscriptions API] Erro:', error)

    if (error instanceof Error && error.message.includes('não encontrado')) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao listar inscrições', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
