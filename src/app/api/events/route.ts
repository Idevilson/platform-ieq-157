import { NextRequest, NextResponse } from 'next/server'
import { ListEvents } from '@/server/application/event/ListEvents'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { EventStatus } from '@/server/domain/shared/types'

const eventRepository = new FirebaseEventRepositoryAdmin()
const listEvents = new ListEvents(eventRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as EventStatus | null
    const visibleOnly = searchParams.get('visibleOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = await listEvents.execute({
      status: status || undefined,
      visibleOnly,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('List events error:', error)

    return NextResponse.json(
      { error: 'Erro ao listar eventos' },
      { status: 500 }
    )
  }
}
