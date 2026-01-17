import { NextRequest, NextResponse } from 'next/server'
import { GetEventById } from '@/server/application/event/GetEventById'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { EventNotFoundError } from '@/server/domain/shared/errors'

const eventRepository = new FirebaseEventRepositoryAdmin()
const getEventById = new GetEventById(eventRepository)

interface RouteParams {
  params: Promise<{ eventId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params

    const result = await getEventById.execute({ eventId })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get event error:', error)

    if (error instanceof EventNotFoundError) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}
