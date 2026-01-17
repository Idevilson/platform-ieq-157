import { NextRequest, NextResponse } from 'next/server'
import { UpdateEventStatus } from '@/server/application/event/UpdateEventStatus'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { EventNotFoundError, ValidationError } from '@/server/domain/shared/errors'

const eventRepository = new FirebaseEventRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const updateEventStatus = new UpdateEventStatus(eventRepository)

interface RouteParams {
  params: Promise<{ eventId: string }>
}

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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Acesso nao autorizado' },
        { status: 401 }
      )
    }

    const { eventId } = await params
    const body = await request.json()

    if (body.status) {
      const result = await updateEventStatus.execute({
        eventId,
        status: body.status,
      })

      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: 'Nenhuma operacao especificada' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Admin Event API] Erro ao atualizar evento:', error)

    if (error instanceof EventNotFoundError) {
      return NextResponse.json(
        { error: 'Evento nao encontrado' },
        { status: 404 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}
