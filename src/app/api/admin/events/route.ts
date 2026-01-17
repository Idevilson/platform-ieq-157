import { NextRequest, NextResponse } from 'next/server'
import { ListEvents } from '@/server/application/event/ListEvents'
import { CreateEvent } from '@/server/application/event/CreateEvent'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { EventStatus } from '@/server/domain/shared/types'
import { ValidationError } from '@/server/domain/shared/errors'

const eventRepository = new FirebaseEventRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const listEvents = new ListEvents(eventRepository)
const createEvent = new CreateEvent(eventRepository)

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

export async function GET(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as EventStatus | null
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    console.log('[Admin Events API] Buscando eventos com params:', { status, limit, offset })

    const result = await listEvents.execute({
      status: status || undefined,
      visibleOnly: false,
      limit,
      offset,
    })

    console.log('[Admin Events API] Eventos encontrados:', result.events.length)

    const eventsWithStats = await Promise.all(
      result.events.map(async (event) => {
        const totalInscriptions = await inscriptionRepository.countByEventId(event.id)
        const confirmedInscriptions = await inscriptionRepository.countByEventIdAndStatus(event.id, 'confirmado')
        const pendingInscriptions = await inscriptionRepository.countByEventIdAndStatus(event.id, 'pendente')

        return {
          ...event,
          stats: {
            total: totalInscriptions,
            confirmado: confirmedInscriptions,
            pendente: pendingInscriptions,
          },
        }
      })
    )

    return NextResponse.json({
      events: eventsWithStats,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    })
  } catch (error) {
    console.error('[Admin Events API] Erro ao listar eventos:', error)
    return NextResponse.json(
      { error: 'Erro ao listar eventos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Acesso nao autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const result = await createEvent.execute({
      titulo: body.titulo,
      subtitulo: body.subtitulo,
      descricao: body.descricao,
      descricaoCompleta: body.descricaoCompleta,
      dataInicio: body.dataInicio,
      dataFim: body.dataFim,
      local: body.local,
      endereco: body.endereco,
      googleMapsUrl: body.googleMapsUrl,
      whatsappContato: body.whatsappContato,
      metodosPagamento: body.metodosPagamento || ['PIX'],
      imagemUrl: body.imagemUrl,
      categorias: body.categorias,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[Admin Events API] Erro ao criar evento:', error)

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    )
  }
}
