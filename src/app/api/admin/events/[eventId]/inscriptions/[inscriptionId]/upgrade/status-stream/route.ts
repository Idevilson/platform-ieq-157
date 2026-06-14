import { NextRequest } from 'next/server'
import { getAdminFirestore } from '@/server/infrastructure/firebase/admin'
import { resolveAdminUid } from '../_shared'

interface RouteParams {
  params: Promise<{ eventId: string; inscriptionId: string }>
}

/**
 * SSE dedicado ao upgrade: escuta o pagamento de ajuste específico (por id) e o
 * estado de pendingUpgrade da inscrição. EventSource não envia header, então o
 * Firebase ID token vem por query param e é validado (admin) antes de abrir.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { eventId, inscriptionId } = await params
  const adjustmentPaymentId = request.nextUrl.searchParams.get('adjustmentPaymentId')
  const token = request.nextUrl.searchParams.get('token') ?? undefined

  if (!adjustmentPaymentId) {
    return new Response('adjustmentPaymentId is required', { status: 400 })
  }

  const adminUid = await resolveAdminUid(token)
  if (!adminUid) {
    return new Response('Unauthorized', { status: 401 })
  }

  const db = getAdminFirestore()
  const inscriptionRef = db
    .collection('events').doc(eventId)
    .collection('inscriptions').doc(inscriptionId)
  const paymentRef = inscriptionRef.collection('payments').doc(adjustmentPaymentId)

  const encoder = new TextEncoder()
  let unsubInscription: (() => void) | null = null
  let unsubPayment: (() => void) | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      send('connected', { inscriptionId, eventId, adjustmentPaymentId })

      unsubPayment = paymentRef.onSnapshot((snap) => {
        if (!snap.exists) {
          send('payment', { id: adjustmentPaymentId, status: 'CANCELLED' })
          return
        }
        const d = snap.data()!
        send('payment', {
          id: snap.id,
          status: d.status,
          metodoPagamento: d.metodoPagamento ?? null,
          pixQrCode: d.pixQrCode ?? null,
          pixCopiaECola: d.pixCopiaECola ?? null,
          checkoutUrl: d.checkoutUrl ?? null,
          valorFormatado: d.valor
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor / 100)
            : null,
        })
      })

      unsubInscription = inscriptionRef.onSnapshot((snap) => {
        if (!snap.exists) return
        const d = snap.data()!
        send('inscription', {
          status: d.status,
          categoryId: d.categoryId,
          hasPendingUpgrade: !!d.pendingUpgrade,
        })
      })

      request.signal.addEventListener('abort', () => {
        unsubInscription?.()
        unsubPayment?.()
        controller.close()
      })
    },
    cancel() {
      unsubInscription?.()
      unsubPayment?.()
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
