import { NextRequest, NextResponse } from 'next/server'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { Money } from '@/server/domain/shared/value-objects/Money'
import { asaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()

interface RouteParams {
  params: Promise<{ inscriptionId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { inscriptionId } = await params
    const eventId = request.nextUrl.searchParams.get('eventId')

    const inscription = await inscriptionRepository.findById(inscriptionId, eventId || undefined)
    if (!inscription) {
      return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 })
    }

    const valorBase = Money.fromCents(inscription.valorCents)
    const options = asaasFeeCalculator.calculateInstallmentOptions(valorBase, 12)

    return NextResponse.json({ valorBase: inscription.valorCents, valorBaseFormatado: valorBase.getFormatted(), options })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao calcular parcelas'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
