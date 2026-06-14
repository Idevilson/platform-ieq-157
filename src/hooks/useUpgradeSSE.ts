"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

interface UpgradePaymentState {
  id: string
  status: string
  metodoPagamento?: string | null
  pixQrCode?: string | null
  pixCopiaECola?: string | null
  checkoutUrl?: string | null
  valorFormatado?: string | null
}

interface UpgradeInscriptionState {
  status: string
  categoryId: string
  hasPendingUpgrade: boolean
}

export interface UseUpgradeSSEResult {
  payment: UpgradePaymentState | null
  inscription: UpgradeInscriptionState | null
  connected: boolean
  isPaid: boolean
  /** Upgrade aplicado: o pendingUpgrade foi limpo após a confirmação. */
  isApplied: boolean
}

/**
 * Acompanha, por SSE, a confirmação da cobrança de diferença (Payment AJUSTE) e a
 * aplicação do upgrade. O token (Firebase ID) vai na query porque EventSource não
 * envia header Authorization.
 */
export function useUpgradeSSE(
  eventId: string,
  inscriptionId: string,
  adjustmentPaymentId: string | null,
  token: string | null,
): UseUpgradeSSEResult {
  const [payment, setPayment] = useState<UpgradePaymentState | null>(null)
  const [inscription, setInscription] = useState<UpgradeInscriptionState | null>(null)
  const [connected, setConnected] = useState(false)
  const sourceRef = useRef<EventSource | null>(null)

  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!adjustmentPaymentId || !token) return

    cleanup()

    const params = new URLSearchParams({ adjustmentPaymentId, token })
    const url = `/api/admin/events/${eventId}/inscriptions/${inscriptionId}/upgrade/status-stream?${params.toString()}`
    const source = new EventSource(url)
    sourceRef.current = source

    source.addEventListener('connected', () => setConnected(true))
    source.addEventListener('payment', (e) => {
      setPayment(JSON.parse((e as MessageEvent).data) as UpgradePaymentState)
    })
    source.addEventListener('inscription', (e) => {
      setInscription(JSON.parse((e as MessageEvent).data) as UpgradeInscriptionState)
    })
    source.onerror = () => setConnected(false)

    return cleanup
  }, [eventId, inscriptionId, adjustmentPaymentId, token, cleanup])

  const isPaid = payment?.status === 'RECEIVED' || payment?.status === 'CONFIRMED'
  const isApplied = inscription !== null && inscription.hasPendingUpgrade === false

  return { payment, inscription, connected, isPaid, isApplied }
}
