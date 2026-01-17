import { NextRequest, NextResponse } from 'next/server'
import { CloseExpiredEvents } from '@/server/application/event/CloseExpiredEvents'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'

const eventRepository = new FirebaseEventRepositoryAdmin()
const closeExpiredEvents = new CloseExpiredEvents(eventRepository)

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.MAINTENANCE_API_KEY

    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      )
    }

    const result = await closeExpiredEvents.execute()

    return NextResponse.json({
      success: true,
      message: `${result.closedCount} evento(s) encerrado(s)`,
      closedEvents: result.closedEvents,
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao executar manutenção de eventos' },
      { status: 500 }
    )
  }
}
