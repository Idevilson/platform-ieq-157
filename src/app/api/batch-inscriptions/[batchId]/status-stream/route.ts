import { NextRequest } from 'next/server'
import { getAdminFirestore } from '@/server/infrastructure/firebase/admin'
import { asaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { Money } from '@/server/domain/shared/value-objects/Money'

interface RouteParams {
  params: Promise<{ batchId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { batchId } = await params

  const db = getAdminFirestore()
  const batchRef = db.collection('batchInscriptions').doc(batchId)

  const encoder = new TextEncoder()
  let unsub: (() => void) | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      send('connected', { batchId })

      unsub = batchRef.onSnapshot((snap) => {
        if (!snap.exists) return
        const d = snap.data()!
        const storedBreakdown = d.breakdown ?? null
        const method = d.preferredPaymentMethod
        const isCash = method === 'CASH'
        const effectiveBreakdown = storedBreakdown ?? (
          !isCash
            ? (() => {
                const b = asaasFeeCalculator.calculateBreakdown(
                  Money.fromCents(d.valorTotal),
                  method === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX',
                )
                return {
                  valorBase: b.valorBase.getCents(),
                  valorBaseFormatado: b.valorBase.getFormatted(),
                  valorTaxa: b.valorTaxa.getCents(),
                  valorTaxaFormatado: b.valorTaxa.getFormatted(),
                  valorTotal: b.valorTotal.getCents(),
                  valorTotalFormatado: b.valorTotal.getFormatted(),
                  metodo: method,
                }
              })()
            : null
        )

        send('batch', {
          id: snap.id,
          status: d.status,
          preferredPaymentMethod: method,
          paymentStatus: d.paymentStatus ?? null,
          valorTotal: effectiveBreakdown?.valorTotal ?? d.valorTotal,
          totalParticipantes: (d.participantes ?? []).length,
          cidade: d.cidade,
          pixQrCode: d.pixQrCode ?? null,
          pixCopiaECola: d.pixCopiaECola ?? null,
          checkoutUrl: d.checkoutUrl ?? null,
          dataVencimentoPagamento: d.dataVencimentoPagamento?.toDate?.()?.toISOString() ?? null,
          breakdown: effectiveBreakdown,
        })
      })

      request.signal.addEventListener('abort', () => {
        unsub?.()
        controller.close()
      })
    },
    cancel() {
      unsub?.()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
