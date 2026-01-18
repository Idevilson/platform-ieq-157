import { NextRequest, NextResponse } from 'next/server'
import { LookupInscriptionByCPF } from '@/server/application/inscription/LookupInscriptionByCPF'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { EventNotFoundError, ValidationError } from '@/server/domain/shared/errors'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const paymentRepository = new FirebasePaymentRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()

const lookupInscriptionByCPF = new LookupInscriptionByCPF(
  inscriptionRepository,
  eventRepository,
  paymentRepository,
  userRepository
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cpf = searchParams.get('cpf')
    const eventId = searchParams.get('eventId')

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF é obrigatório' },
        { status: 400 }
      )
    }

    const result = await lookupInscriptionByCPF.execute({
      cpf,
      eventId: eventId || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Lookup inscription error:', error)

    if (error instanceof EventNotFoundError) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
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
      { error: 'Erro ao consultar inscrição' },
      { status: 500 }
    )
  }
}
