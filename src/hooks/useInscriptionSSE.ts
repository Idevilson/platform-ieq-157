"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

interface InscriptionState {
  status: string
  temBrinde?: boolean | null
  perkId?: string | null
  brindeAlocadoEm?: string | null
  paymentId?: string | null
}

interface PaymentState {
  id: string
  status: string
  valorFormatado?: string
  metodoPagamento?: string
  checkoutUrl?: string
  pixQrCode?: string
  pixCopiaECola?: string
}

export interface UseInscriptionSSEResult {
  inscription: InscriptionState | null
  payment: PaymentState | null
  connected: boolean
  isPaid: boolean
  isConfirmed: boolean
  hasBrinde: boolean
}

export function useInscriptionSSE(
  inscriptionId: string | null,
  eventId: string,
): UseInscriptionSSEResult {
  const [inscription, setInscription] = useState<InscriptionState | null>(null)
  const [payment, setPayment] = useState<PaymentState | null>(null)
  const [connected, setConnected] = useState(false)
  const sourceRef = useRef<EventSource | null>(null)

  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!inscriptionId) return

    cleanup()

    const url = `/api/inscriptions/${inscriptionId}/status-stream?eventId=${eventId}`
    const source = new EventSource(url)
    sourceRef.current = source

    source.addEventListener('connected', () => {
      setConnected(true)
    })

    source.addEventListener('inscription', (e) => {
      const data = JSON.parse(e.data) as InscriptionState
      setInscription(data)
    })

    source.addEventListener('payment', (e) => {
      const data = JSON.parse(e.data) as PaymentState
      setPayment(data)
    })

    source.onerror = () => {
      setConnected(false)
    }

    return cleanup
  }, [inscriptionId, eventId, cleanup])

  const isPaid = payment?.status === 'RECEIVED' || payment?.status === 'CONFIRMED'
  const isConfirmed = inscription?.status === 'confirmado'
  const hasBrinde = inscription?.temBrinde === true

  return { inscription, payment, connected, isPaid, isConfirmed, hasBrinde }
}
