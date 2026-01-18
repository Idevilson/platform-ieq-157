import { NextRequest, NextResponse } from 'next/server'
import { CreateInscription } from '@/server/application/inscription/CreateInscription'
import { UpdateProfile } from '@/server/application/user/UpdateProfile'
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
  CPFAlreadyInUseError,
} from '@/server/domain/shared/errors'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()

const createInscription = new CreateInscription(
  inscriptionRepository,
  eventRepository,
  userRepository
)
const updateProfile = new UpdateProfile(userRepository)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    const body = await request.json()
    const { eventId, categoryId, profileUpdate, preferredPaymentMethod } = body

    if (!eventId || !categoryId) {
      return NextResponse.json(
        { error: 'eventId e categoryId são obrigatórios' },
        { status: 400 }
      )
    }

    if (profileUpdate && Object.keys(profileUpdate).length > 0) {
      await updateProfile.execute({
        userId,
        cpf: profileUpdate.cpf,
        telefone: profileUpdate.telefone,
        dataNascimento: profileUpdate.dataNascimento,
        sexo: profileUpdate.sexo,
      })
    }

    const result = await createInscription.execute({
      userId,
      eventId,
      categoryId,
      preferredPaymentMethod,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create user inscription error:', error)

    if (error instanceof EventNotFoundError) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }
    if (error instanceof EventNotOpenError) {
      return NextResponse.json({ error: 'Evento não está aberto para inscrições' }, { status: 400 })
    }
    if (error instanceof CategoryNotFoundError) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }
    if (error instanceof DuplicateInscriptionError) {
      return NextResponse.json({ error: 'Já existe uma inscrição para este evento' }, { status: 409 })
    }
    if (error instanceof UserNotFoundError) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    if (error instanceof CPFAlreadyInUseError) {
      return NextResponse.json({ error: 'CPF já está em uso por outro usuário' }, { status: 409 })
    }
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, details: (error as ValidationError).details },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Erro ao criar inscrição' }, { status: 500 })
  }
}
