import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/server/infrastructure/firebase/admin'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { extractBearerToken } from '@/app/api/auth/shared'
import { BatchLookupResult } from '@/shared/types/inscription'
import { asaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { Money } from '@/server/domain/shared/value-objects/Money'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()

export async function GET(request: NextRequest) {
  const token = extractBearerToken(request.headers.get('Authorization'))
  if (!token) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    const email = decoded.email
    if (!email) {
      return NextResponse.json({ batches: [] })
    }

    const eventId = request.nextUrl.searchParams.get('eventId')
    if (!eventId) {
      return NextResponse.json({ error: 'eventId é obrigatório' }, { status: 400 })
    }

    console.log('[Batch My] email:', email, 'eventId:', eventId)
    const all = await batchRepository.findByEventId(eventId)
    const filtered = all.filter(b => b.responsavel.email === email)
    console.log('[Batch My] total:', all.length, '→ deste usuário:', filtered.length)

    const results: BatchLookupResult[] = filtered.map(batch => {
      const json = batch.toJSON()
      const breakdown = batch.breakdown ?? (
        batch.isCashPayment()
          ? null
          : asaasFeeCalculator.calculateBreakdown(
              Money.fromCents(batch.valorTotalCents),
              batch.isCardPayment() ? 'CREDIT_CARD' : 'PIX',
            )
      )
      return {
        batchId: batch.id,
        eventId: batch.eventId,
        eventTitle: batch.eventId,
        status: batch.status,
        totalParticipantes: batch.totalParticipantes,
        cidade: batch.cidade,
        valorTotal: breakdown?.valorTotal.getCents() ?? batch.valorTotalCents,
        valorTotalFormatado: breakdown?.valorTotal.getFormatted() ?? batch.valorTotalFormatado,
        preferredPaymentMethod: batch.preferredPaymentMethod,
        participantes: json.participantes.map(p => ({ nome: p.nome, sexo: p.sexo })),
        payment: json.paymentId
          ? {
              status: json.paymentStatus ?? 'PENDING',
              pixCopiaECola: json.pixCopiaECola,
              pixQrCode: json.pixQrCode,
              checkoutUrl: json.checkoutUrl,
              dataVencimento: json.dataVencimentoPagamento,
            }
          : undefined,
      }
    })

    return NextResponse.json({ batches: results })
  } catch (error) {
    console.error('[Batch My] Erro:', error)
    return NextResponse.json({ error: 'Erro ao buscar lotes' }, { status: 500 })
  }
}
