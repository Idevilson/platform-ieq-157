import { NextRequest, NextResponse } from 'next/server'
import { CreateInscription } from '@/server/application/inscription/CreateInscription'
import { CreateGuestInscription } from '@/server/application/inscription/CreateGuestInscription'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import {
  EventNotFoundError,
  EventNotOpenError,
  CategoryNotFoundError,
  DuplicateInscriptionError,
  UserNotFoundError,
  ValidationError,
} from '@/server/domain/shared/errors'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()

const createInscription = new CreateInscription(
  inscriptionRepository,
  eventRepository,
  userRepository
)
const createGuestInscription = new CreateGuestInscription(
  inscriptionRepository,
  eventRepository
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, categoryId, guestData } = body

    if (!eventId || !categoryId) {
      return NextResponse.json(
        { error: 'eventId e categoryId são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const authHeader = request.headers.get('Authorization')
    let userId: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(token)
        userId = decodedToken.uid
      } catch {
        // Token invalid, treat as guest
      }
    }

    let result

    if (userId && !guestData) {
      // Authenticated user inscription
      result = await createInscription.execute({
        userId,
        eventId,
        categoryId,
      })
    } else if (guestData) {
      // Guest inscription
      result = await createGuestInscription.execute({
        eventId,
        categoryId,
        guestData,
      })
    } else {
      return NextResponse.json(
        { error: 'Autenticação ou dados de visitante são necessários' },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create inscription error:', error)

    if (error instanceof EventNotFoundError) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    if (error instanceof EventNotOpenError) {
      return NextResponse.json(
        { error: 'Evento não está aberto para inscrições' },
        { status: 400 }
      )
    }

    if (error instanceof CategoryNotFoundError) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    if (error instanceof DuplicateInscriptionError) {
      return NextResponse.json(
        { error: 'Já existe uma inscrição para este evento' },
        { status: 409 }
      )
    }

    if (error instanceof UserNotFoundError) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, details: (error as ValidationError).details },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar inscrição' },
      { status: 500 }
    )
  }
}
