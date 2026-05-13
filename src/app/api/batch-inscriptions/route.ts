import { NextRequest, NextResponse } from 'next/server'
import { CreateBatchInscription } from '@/server/application/inscription/CreateBatchInscription'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import {
  EventNotFoundError,
  EventNotOpenError,
  CategoryNotFoundError,
  ValidationError,
} from '@/server/domain/shared/errors'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const createBatchInscription = new CreateBatchInscription(batchRepository, eventRepository)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Autenticação obrigatória para inscrição coletiva' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    let userId: string
    try {
      const decoded = await adminAuth.verifyIdToken(token)
      userId = decoded.uid
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, categoryId, preferredPaymentMethod, responsavel, cidade, participantes } = body

    if (!eventId || !categoryId || !responsavel || !cidade || !participantes) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const result = await createBatchInscription.execute({
      eventId,
      categoryId,
      preferredPaymentMethod,
      userId,
      responsavel,
      cidade,
      participantes,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
    }
    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }
    if (error instanceof EventNotOpenError) {
      return NextResponse.json({ error: 'Evento não está aberto para inscrições' }, { status: 400 })
    }
    if (error instanceof CategoryNotFoundError) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }
    console.error('[Batch Inscription] Erro:', error)
    return NextResponse.json({ error: 'Erro ao criar inscrição coletiva' }, { status: 500 })
  }
}
