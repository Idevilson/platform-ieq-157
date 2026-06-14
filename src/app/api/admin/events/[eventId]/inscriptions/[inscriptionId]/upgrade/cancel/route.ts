import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/server/domain/shared/errors'
import { cancelInscriptionUpgrade, resolveAdminUid, bearerToken } from '../_shared'

interface RouteParams {
  params: Promise<{ eventId: string; inscriptionId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUid = await resolveAdminUid(bearerToken(request))
    if (!adminUid) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })

    const { eventId, inscriptionId } = await params
    const result = await cancelInscriptionUpgrade.execute({ eventId, inscriptionId })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Upgrade Cancel] Erro:', error)
    return NextResponse.json({ error: 'Erro ao cancelar o upgrade' }, { status: 500 })
  }
}
