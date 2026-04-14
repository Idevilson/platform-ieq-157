import { NextRequest, NextResponse } from 'next/server'
import { GetPerkSummary } from '@/server/application/event/GetPerkSummary'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'

const perkRepository = new FirebaseEventPerkRepositoryAdmin()
const getPerkSummary = new GetPerkSummary(perkRepository)

interface RouteParams {
  params: Promise<{ eventId: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const summary = await getPerkSummary.execute(eventId)
    if (!summary) {
      return NextResponse.json({ summary: null }, { status: 200 })
    }
    return NextResponse.json({ summary }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar resumo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
