import { NextRequest } from 'next/server'
import { getAdminFirestore } from '@/server/infrastructure/firebase/admin'

interface RouteParams {
  params: Promise<{ inscriptionId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { inscriptionId } = await params
  const eventId = request.nextUrl.searchParams.get('eventId')
  if (!eventId) {
    return new Response('eventId is required', { status: 400 })
  }

  const db = getAdminFirestore()
  const inscriptionRef = db
    .collection('events')
    .doc(eventId)
    .collection('inscriptions')
    .doc(inscriptionId)

  const paymentRef = db
    .collection('events')
    .doc(eventId)
    .collection('inscriptions')
    .doc(inscriptionId)
    .collection('payments')

  const encoder = new TextEncoder()
  let unsubInscription: (() => void) | null = null
  let unsubPayment: (() => void) | null = null

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      send('connected', { inscriptionId, eventId })

      unsubInscription = inscriptionRef.onSnapshot((snap) => {
        if (!snap.exists) return
        const d = snap.data()!
        send('inscription', {
          id: snap.id,
          status: d.status,
          temBrinde: d.temBrinde ?? null,
          perkId: d.perkId ?? null,
          brindeAlocadoEm: d.brindeAlocadoEm?.toDate?.()?.toISOString() ?? null,
          paymentId: d.paymentId ?? null,
        })
      })

      unsubPayment = paymentRef.onSnapshot((snap) => {
        if (snap.empty) return
        const doc = snap.docs[0]
        const d = doc.data()
        send('payment', {
          id: doc.id,
          status: d.status,
          valorFormatado: d.valor
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor / 100)
            : null,
          metodoPagamento: d.metodoPagamento ?? null,
          checkoutUrl: d.checkoutUrl ?? null,
          pixQrCode: d.pixQrCode ?? null,
          pixCopiaECola: d.pixCopiaECola ?? null,
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
