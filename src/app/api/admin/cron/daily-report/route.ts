import { NextRequest, NextResponse } from 'next/server'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { EvolutionApiError, EvolutionClient } from '@/server/infrastructure/evolution/EvolutionClient'
import { DailyReport } from '@/server/application/reports/BuildDailyReport'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Role = 'cron' | 'admin'

const userRepo = new FirebaseUserRepositoryAdmin()

async function authorize(request: NextRequest): Promise<Role | null> {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice(7).trim()
  if (!token) return null

  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && token === cronSecret) return 'cron'

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const user = await userRepo.findById(decoded.uid)
    if (user?.isAdmin()) return 'admin'
    return null
  } catch {
    return null
  }
}

function envOrError(key: string): string | NextResponse {
  const value = process.env[key]
  if (value) return value
  return NextResponse.json({ error: `${key} not configured` }, { status: 500 })
}

async function handle(request: NextRequest) {
  const role = await authorize(request)
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const overrideEventId = role === 'admin' ? url.searchParams.get('eventId') : null
  const dryRun = role === 'admin' && url.searchParams.get('dryRun') === 'true'

  const eventId = overrideEventId || process.env.REPORT_EVENT_ID
  if (!eventId) return NextResponse.json({ error: 'REPORT_EVENT_ID not configured' }, { status: 500 })

  const groupId = envOrError('WHATSAPP_GROUP_ID')
  if (groupId instanceof NextResponse) return groupId

  const instance = envOrError('EVOLUTION_INSTANCE')
  if (instance instanceof NextResponse) return instance

  const eventRepo = new FirebaseEventRepositoryAdmin()
  const event = await eventRepo.findById(eventId)
  if (!event) return NextResponse.json({ error: `Event "${eventId}" not found` }, { status: 404 })

  const inscriptionRepo = new FirebaseInscriptionRepositoryAdmin()
  const batchRepo = new FirebaseBatchInscriptionRepositoryAdmin()
  const perkRepo = new FirebaseEventPerkRepositoryAdmin()

  const [inscriptions, batches, primaryPerk] = await Promise.all([
    inscriptionRepo.findAllByEventId(eventId),
    batchRepo.findByEventId(eventId),
    perkRepo.findPrimaryByEventId(eventId),
  ])

  const report = DailyReport
    .for(event)
    .withInscriptions(inscriptions)
    .withBatches(batches)
    .withPerk(primaryPerk?.toSummary())
    .build()

  if (report.skipped) {
    return NextResponse.json({ ok: true, role, skipped: report.skipped, stats: report.stats })
  }

  if (dryRun) {
    return NextResponse.json({ ok: true, role, dryRun: true, stats: report.stats, preview: report.message })
  }

  try {
    const sent = await EvolutionClient
      .fromEnv()
      .instance(instance)
      .sendText({ to: groupId, text: report.message })

    return NextResponse.json({
      ok: true,
      role,
      stats: report.stats,
      sent: { messageId: sent.messageId, status: sent.status, remoteJid: sent.remoteJid },
    })
  } catch (error) {
    if (error instanceof EvolutionApiError) {
      return NextResponse.json(
        { error: 'Evolution API error', statusCode: error.statusCode, body: error.body, stats: report.stats },
        { status: 502 },
      )
    }
    throw error
  }
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
