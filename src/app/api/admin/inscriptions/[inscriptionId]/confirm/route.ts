import { NextRequest, NextResponse } from 'next/server'
import { ConfirmInscriptionManually } from '@/server/application/inscription/ConfirmInscriptionManually'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError, InscriptionNotFoundError } from '@/server/domain/shared/errors'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const paymentRepository = new FirebasePaymentRepositoryAdmin()
const confirmInscription = new ConfirmInscriptionManually(inscriptionRepository, eventRepository, paymentRepository)

interface RouteParams {
  params: Promise<{ inscriptionId: string }>
}

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    const user = await userRepository.findById(decodedToken.uid)
    if (!user?.isAdmin()) {
      return null
    }
    return decodedToken.uid
  } catch {
    return null
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { inscriptionId } = await params
    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: 'eventId é obrigatório' }, { status: 400 })
    }

    const result = await confirmInscription.execute({
      eventId,
      inscriptionId,
      confirmedBy: adminId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Admin Confirm Inscription] Erro:', error)

    if (error instanceof InscriptionNotFoundError) {
      return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 })
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Erro ao confirmar inscrição' },
      { status: 500 }
    )
  }
}
