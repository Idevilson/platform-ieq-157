import { NextRequest, NextResponse } from 'next/server'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { buildInscriptionsSnapshot } from '@/server/application/reports/InscriptionsSnapshot'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const userRepo = new FirebaseUserRepositoryAdmin()

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return false
  try {
    const decoded = await adminAuth.verifyIdToken(header.slice(7).trim())
    const user = await userRepo.findById(decoded.uid)
    return !!user?.isAdmin()
  } catch {
    return false
  }
}

function todayBR(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  const eventId = new URL(request.url).searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json({ error: 'eventId é obrigatório' }, { status: 400 })
  }

  const eventRepo = new FirebaseEventRepositoryAdmin()
  const event = await eventRepo.findById(eventId)
  if (!event) {
    return NextResponse.json({ error: `Evento "${eventId}" não encontrado` }, { status: 404 })
  }

  const inscriptionRepo = new FirebaseInscriptionRepositoryAdmin()
  const batchRepo = new FirebaseBatchInscriptionRepositoryAdmin()

  const [inscriptions, batches] = await Promise.all([
    inscriptionRepo.findAllByEventId(eventId),
    batchRepo.findByEventId(eventId),
  ])

  const snapshot = buildInscriptionsSnapshot({
    event,
    inscriptions,
    batches,
  })

  return new NextResponse(JSON.stringify(snapshot, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="inscricoes-${eventId}-${todayBR()}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
