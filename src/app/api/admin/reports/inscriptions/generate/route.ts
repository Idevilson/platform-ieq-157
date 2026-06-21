import { NextRequest, NextResponse } from 'next/server'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { resolveActor } from '@/app/api/admin/_perm-shared'
import { DELIVER_KITS_PERMISSION, CONFIRM_CASH_PERMISSION } from '@/shared/constants'
import { InscriptionsPdfReport } from '@/server/application/reports/BuildInscriptionsPdf'
import { loadAccountProfiles } from '@/server/application/reports/loadAccountProfiles'
import { EventDTO } from '@/shared/types/event'
import { InscriptionDTO, BatchInscriptionDTO } from '@/shared/types/inscription'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function todayBR(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

export async function POST(request: NextRequest) {
  const actor = await resolveActor(request)
  if (!actor) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  const eventId = new URL(request.url).searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json({ error: 'eventId é obrigatório' }, { status: 400 })
  }

  const canAccess =
    actor.isAdmin ||
    actor.hasPermission(DELIVER_KITS_PERMISSION, eventId) ||
    actor.hasPermission(CONFIRM_CASH_PERMISSION, eventId)
  if (!canAccess) {
    return NextResponse.json({ error: 'Sem permissão para este evento' }, { status: 403 })
  }

  const eventRepo = new FirebaseEventRepositoryAdmin()
  const event = await eventRepo.findById(eventId)
  if (!event) {
    return NextResponse.json({ error: `Evento "${eventId}" não encontrado` }, { status: 404 })
  }

  const inscriptionRepo = new FirebaseInscriptionRepositoryAdmin()
  const batchRepo = new FirebaseBatchInscriptionRepositoryAdmin()
  const userRepo = new FirebaseUserRepositoryAdmin()

  const [inscriptions, batches] = await Promise.all([
    inscriptionRepo.findAllByEventId(eventId),
    batchRepo.findByEventId(eventId),
  ])

  const accountProfiles = await loadAccountProfiles(inscriptions, userRepo)

  const pdf = await InscriptionsPdfReport
    .for(event.toJSON() as unknown as EventDTO)
    .withInscriptions(inscriptions.map((i) => i.toJSON() as unknown as InscriptionDTO))
    .withBatches(batches.map((b) => b.toJSON() as unknown as BatchInscriptionDTO))
    .withAccountProfiles(accountProfiles)
    .build()

  const body = new Uint8Array(pdf.byteLength)
  body.set(pdf)

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="inscricoes-${eventId}-${todayBR()}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
