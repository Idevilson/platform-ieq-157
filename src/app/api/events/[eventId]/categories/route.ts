import { NextResponse } from 'next/server'
import { GetEventCategories } from '@/server/application/event/GetEventCategories'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { EventNotFoundError } from '@/server/domain/shared/errors'

const eventRepository = new FirebaseEventRepositoryAdmin()
const getEventCategories = new GetEventCategories(eventRepository)

interface RouteParams {
  params: Promise<{ eventId: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { eventId } = await params

    const result = await getEventCategories.execute({
      eventId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get categories error:', error)

    if (error instanceof EventNotFoundError) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}
