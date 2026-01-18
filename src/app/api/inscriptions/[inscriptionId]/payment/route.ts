import { NextRequest, NextResponse } from 'next/server'
import { CreatePaymentForInscription } from '@/server/application/payment/CreatePaymentForInscription'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { ValidationError } from '@/server/domain/shared/errors'

const paymentRepository = new FirebasePaymentRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()

const createPayment = new CreatePaymentForInscription(
  paymentRepository,
  inscriptionRepository,
  userRepository
)

interface RouteParams {
  params: Promise<{ inscriptionId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { inscriptionId } = await params
    const eventId = request.nextUrl.searchParams.get('eventId')

    const inscription = await inscriptionRepository.findById(inscriptionId, eventId || undefined)
    if (!inscription) {
      return NextResponse.json({ payment: null })
    }

    const inscriptionData = inscription.toJSON()
    const participantName = await getParticipantName(inscriptionData)
    const preferredPaymentMethod = inscriptionData.preferredPaymentMethod

    // For cash payments, don't create Asaas payment
    if (preferredPaymentMethod === 'CASH') {
      return NextResponse.json({
        payment: null,
        participantName,
        preferredPaymentMethod,
        inscription: inscriptionData,
      })
    }

    const existingPayment = await paymentRepository.findByInscriptionId(inscriptionId, inscriptionData.eventId)

    if (!existingPayment) {
      return NextResponse.json({ payment: null, participantName, preferredPaymentMethod })
    }

    if (existingPayment.isConfirmed()) {
      return NextResponse.json({ payment: existingPayment.toJSON(), participantName, preferredPaymentMethod })
    }

    // Payment pending - use createPayment to sync with Asaas
    const result = await createPayment.execute({
      eventId: inscriptionData.eventId,
      inscriptionId,
    })

    return NextResponse.json({ ...result, participantName, preferredPaymentMethod })
  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 500 })
  }
}

async function getParticipantName(inscriptionData: { userId?: string; guestData?: { nome: string } }): Promise<string> {
  if (inscriptionData.guestData?.nome) {
    return inscriptionData.guestData.nome
  }

  if (inscriptionData.userId) {
    const user = await userRepository.findById(inscriptionData.userId)
    if (user) {
      return user.toJSON().nome
    }
  }

  return 'Participante'
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { inscriptionId } = await params
    const eventId = request.nextUrl.searchParams.get('eventId')

    // First find the inscription to get eventId if not provided
    const inscription = await inscriptionRepository.findById(inscriptionId, eventId || undefined)
    if (!inscription) {
      return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 })
    }

    const inscriptionData = inscription.toJSON()

    // For cash payments, don't create Asaas payment
    if (inscriptionData.preferredPaymentMethod === 'CASH') {
      return NextResponse.json({
        payment: null,
        preferredPaymentMethod: 'CASH',
        message: 'Pagamento em dinheiro - aguardando confirmação manual',
      }, { status: 200 })
    }

    const result = await createPayment.execute({
      eventId: inscriptionData.eventId,
      inscriptionId,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create payment error:', error)

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : 'Erro ao criar pagamento'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
