import { NextRequest, NextResponse } from 'next/server'
import { CreatePaymentForInscription } from '@/server/application/payment/CreatePaymentForInscription'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { toInscriptionWithDetails } from '@/server/application/inscription/toInscriptionWithDetails'
import { InscriptionWithDetails } from '@/server/application/inscription/ListEventInscriptions'
import { asaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { ValidationError } from '@/server/domain/shared/errors'
import { createPaymentForInscriptionSchema } from '@/server/application/payment/schemas'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { formatPhone } from '@/lib/formatters'

const paymentRepository = new FirebasePaymentRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()

const createPayment = new CreatePaymentForInscription(
  paymentRepository,
  inscriptionRepository,
  userRepository,
  asaasFeeCalculator,
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
    const { details, participantName } = await resolveInscriptionDetails(inscription, inscriptionData)
    const preferredPaymentMethod = inscriptionData.preferredPaymentMethod

    // For cash payments, don't create Asaas payment
    if (preferredPaymentMethod === 'CASH') {
      return NextResponse.json({
        payment: null,
        participantName,
        preferredPaymentMethod,
        inscription: details,
      })
    }

    const existingPayment = await paymentRepository.findByInscriptionId(inscriptionId, inscriptionData.eventId)

    if (!existingPayment) {
      return NextResponse.json({ payment: null, participantName, preferredPaymentMethod, inscription: details })
    }

    if (existingPayment.isConfirmed()) {
      return NextResponse.json({ payment: existingPayment.toJSON(), participantName, preferredPaymentMethod, inscription: details })
    }

    const result = await createPayment.execute({
      eventId: inscriptionData.eventId,
      inscriptionId,
    })

    return NextResponse.json({ ...result, participantName, preferredPaymentMethod, inscription: details })
  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 500 })
  }
}

export interface ConfirmationInscriptionDTO {
  id: string
  status: string
  statusLabel: string
  nome: string
  cpf?: string
  telefone?: string
  cidade?: string
  categoriaNome: string
  tamanho?: string
  temBrinde: boolean
  preferredPaymentMethod: string
  valorFormatado: string
}

// Resolve nome/CPF (conta logada vem da coleção users) e o nome da categoria para exibir na confirmação
async function resolveInscriptionDetails(
  inscription: Inscription,
  inscriptionData: { eventId: string; userId?: string; guestData?: { nome: string } },
): Promise<{ details: ConfirmationInscriptionDTO | null; participantName: string }> {
  const event = await eventRepository.findById(inscriptionData.eventId)
  if (!event) {
    return { details: null, participantName: fallbackName(inscriptionData) }
  }

  const full = await toInscriptionWithDetails(inscription, event, userRepository)
  return { details: toConfirmationDTO(full), participantName: full.nome || 'Participante' }
}

function toConfirmationDTO(d: InscriptionWithDetails): ConfirmationInscriptionDTO {
  return {
    id: d.id,
    status: d.status,
    statusLabel: d.statusLabel,
    nome: d.nome,
    cpf: maskCpf(d.cpf),
    telefone: formatPhoneSafe(d.telefone),
    cidade: d.cidade,
    categoriaNome: d.categoryNome,
    tamanho: d.tamanho,
    temBrinde: d.temBrinde === true,
    preferredPaymentMethod: d.preferredPaymentMethod,
    valorFormatado: d.valorFormatado,
  }
}

function maskCpf(cpf?: string): string | undefined {
  const digits = (cpf ?? '').replace(/\D/g, '')
  if (digits.length !== 11) return cpf || undefined
  return `•••.${digits.slice(3, 6)}.${digits.slice(6, 9)}-••`
}

function formatPhoneSafe(phone?: string): string | undefined {
  if (!phone) return undefined
  try {
    return formatPhone(phone)
  } catch {
    return phone
  }
}

function fallbackName(inscriptionData: { guestData?: { nome: string } }): string {
  return inscriptionData.guestData?.nome || 'Participante'
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { inscriptionId } = await params
    const eventIdQuery = request.nextUrl.searchParams.get('eventId')

    const inscription = await inscriptionRepository.findById(inscriptionId, eventIdQuery || undefined)
    if (!inscription) {
      return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 })
    }

    const inscriptionData = inscription.toJSON()

    if (inscriptionData.preferredPaymentMethod === 'CASH') {
      return NextResponse.json({
        payment: null,
        preferredPaymentMethod: 'CASH',
        message: 'Pagamento em dinheiro - aguardando confirmação manual',
      }, { status: 200 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = createPaymentForInscriptionSchema.parse({
      eventId: inscriptionData.eventId,
      inscriptionId,
      metodo: body.metodo,
      parcelas: body.parcelas,
      creditCardToken: body.creditCardToken,
    })

    const result = await createPayment.execute({
      eventId: parsed.eventId,
      inscriptionId: parsed.inscriptionId,
      metodo: parsed.metodo,
      parcelas: parsed.parcelas,
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
