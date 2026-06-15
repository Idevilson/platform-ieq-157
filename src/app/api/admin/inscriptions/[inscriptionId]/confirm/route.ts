import { NextRequest, NextResponse } from 'next/server'
import { ConfirmInscriptionManually } from '@/server/application/inscription/ConfirmInscriptionManually'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseAuditLogRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseAuditLogRepositoryAdmin'
import { ValidationError, InscriptionNotFoundError } from '@/server/domain/shared/errors'
import { CONFIRM_CASH_PERMISSION } from '@/shared/constants'
import { resolveActor } from '../../../_perm-shared'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const paymentRepository = new FirebasePaymentRepositoryAdmin()
const perkRepository = new FirebaseEventPerkRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const auditLogRepository = new FirebaseAuditLogRepositoryAdmin()
const confirmInscription = new ConfirmInscriptionManually(inscriptionRepository, eventRepository, paymentRepository, perkRepository, auditLogRepository, userRepository)

interface RouteParams {
  params: Promise<{ inscriptionId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const actor = await resolveActor(request)
    if (!actor) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { inscriptionId } = await params
    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: 'eventId é obrigatório' }, { status: 400 })
    }

    if (!actor.isAdmin && !actor.hasPermission(CONFIRM_CASH_PERMISSION, eventId)) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    }

    const result = await confirmInscription.execute({
      eventId,
      inscriptionId,
      confirmedBy: actor.uid,
      confirmedByNome: actor.nome,
      requireCash: !actor.isAdmin,
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
