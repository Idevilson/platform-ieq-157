"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

export interface BatchBreakdown {
  valorBase: number
  valorBaseFormatado: string
  valorTaxa: number
  valorTaxaFormatado: string
  valorTotal: number
  valorTotalFormatado: string
  metodo: string
  parcelas?: number
}

export interface BatchSSEState {
  id: string
  status: string
  preferredPaymentMethod: string
  paymentStatus: string | null
  valorTotal: number
  totalParticipantes: number
  cidade: string
  pixQrCode: string | null
  pixCopiaECola: string | null
  checkoutUrl: string | null
  dataVencimentoPagamento: string | null
  breakdown: BatchBreakdown | null
}

export interface UseBatchSSEResult {
  batch: BatchSSEState | null
  connected: boolean
  isConfirmed: boolean
  isPaid: boolean
}

export function useBatchSSE(batchId: string | null): UseBatchSSEResult {
  const [batch, setBatch] = useState<BatchSSEState | null>(null)
  const [connected, setConnected] = useState(false)
  const sourceRef = useRef<EventSource | null>(null)

  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!batchId) return
    cleanup()

    const source = new EventSource(`/api/batch-inscriptions/${batchId}/status-stream`)
    sourceRef.current = source

    source.addEventListener('connected', () => setConnected(true))

    source.addEventListener('batch', (e) => {
      const data = JSON.parse(e.data) as BatchSSEState
      setBatch(data)
    })

    source.onerror = () => setConnected(false)

    return cleanup
  }, [batchId, cleanup])

  const isConfirmed = batch?.status === 'confirmado'
  const isPaid =
    batch?.paymentStatus === 'RECEIVED' ||
    batch?.paymentStatus === 'CONFIRMED' ||
    isConfirmed

  return { batch, connected, isConfirmed, isPaid }
}
