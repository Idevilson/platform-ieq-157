"use client"

import { useEffect, useRef, useState } from 'react'
import { InscriptionPaymentMethod } from '@/shared/constants'

export interface PolledPaymentData {
  id: string
  status: string
  statusLabel: string
  valorFormatado: string
  pixQrCode?: string
  pixCopiaECola?: string
  checkoutUrl?: string
  dataVencimento: string
  breakdown?: {
    valorBaseFormatado: string
    valorTaxaFormatado: string
    valorTotalFormatado: string
    metodo: string
    parcelas?: number
    valorParcelaFormatado?: string
  } | null
}

export interface PolledInscriptionData {
  id: string
  status: string
  valorFormatado: string
  preferredPaymentMethod: InscriptionPaymentMethod
  temBrinde?: boolean
}

export interface UsePaymentPollingOptions {
  inscriptionId: string | null
  eventId: string
  method?: 'PIX' | 'CREDIT_CARD'
  parcelas?: number
  intervalMs?: number
}

export interface InstallmentOption {
  parcelas: number
  valorParcela: number
  valorParcelaFormatado: string
  valorTotal: number
  valorTotalFormatado: string
  valorTaxa: number
  valorTaxaFormatado: string
}

export interface UsePaymentPollingResult {
  payment: PolledPaymentData | null
  inscription: PolledInscriptionData | null
  participantName: string
  preferredPaymentMethod: InscriptionPaymentMethod
  loading: boolean
  error: string | null
  isPaid: boolean
  isCashPayment: boolean
  isInscriptionConfirmed: boolean
  needsInstallmentSelection: boolean
  installmentOptions: InstallmentOption[]
  selectInstallments: (parcelas: number) => void
  creatingPayment: boolean
}

const DEFAULT_INTERVAL = 30_000

export function usePaymentPolling({
  inscriptionId,
  eventId,
  method = 'PIX',
  parcelas,
  intervalMs = DEFAULT_INTERVAL,
}: UsePaymentPollingOptions): UsePaymentPollingResult {
  const [payment, setPayment] = useState<PolledPaymentData | null>(null)
  const [inscription, setInscription] = useState<PolledInscriptionData | null>(null)
  const [participantName, setParticipantName] = useState('Participante')
  const [preferredPaymentMethod, setPreferredPaymentMethod] =
    useState<InscriptionPaymentMethod>('PIX')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [installmentOptions] = useState<InstallmentOption[]>([])
  const [needsInstallmentSelection] = useState(false)
  const [creatingPayment, setCreatingPayment] = useState(false)
  const fetchedRef = useRef(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const isPaid = payment?.status === 'RECEIVED' || payment?.status === 'CONFIRMED'
  const isCashPayment = preferredPaymentMethod === 'CASH'
  const isInscriptionConfirmed = inscription?.status === 'confirmado'

  useEffect(() => {
    if (!inscriptionId) {
      setLoading(false)
      return
    }
    if (fetchedRef.current) return
    fetchedRef.current = true

    const run = async () => {
      try {
        const query = `?eventId=${eventId}`
        const getResponse = await fetch(`/api/inscriptions/${inscriptionId}/payment${query}`)
        const getData = await getResponse.json()

        if (getData.participantName) setParticipantName(getData.participantName)
        if (getData.preferredPaymentMethod) setPreferredPaymentMethod(getData.preferredPaymentMethod)
        if (getData.inscription) setInscription(getData.inscription)

        const resolvedMethod = getData.preferredPaymentMethod === 'CREDIT_CARD'
          ? 'CREDIT_CARD'
          : getData.preferredPaymentMethod === 'CASH'
            ? 'CASH'
            : method

        if (resolvedMethod === 'CASH') {
          setLoading(false)
          return
        }

        if (getData.payment) {
          setPayment(getData.payment)
          setLoading(false)
          return
        }

        const createResponse = await fetch(`/api/inscriptions/${inscriptionId}/payment${query}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metodo: resolvedMethod }),
        })
        const createData = await createResponse.json()
        if (createData.payment) {
          setPayment(createData.payment)
        } else if (createData.error) {
          setError(createData.error)
        }
      } catch {
        setError('Erro ao carregar pagamento')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [inscriptionId, eventId, method, parcelas])

  useEffect(() => {
    if (!inscriptionId || isPaid || isCashPayment || !payment) return

    const tick = async () => {
      try {
        const response = await fetch(`/api/inscriptions/${inscriptionId}/payment?eventId=${eventId}`)
        const data = await response.json()
        if (data.participantName) setParticipantName(data.participantName)
        if (data.inscription) setInscription(data.inscription)
        if (data.payment) {
          const newStatus = data.payment.status
          setPayment(data.payment)
          if (newStatus === 'RECEIVED' || newStatus === 'CONFIRMED') {
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
              pollingRef.current = null
            }
          }
        }
      } catch {
      }
    }

    pollingRef.current = setInterval(tick, intervalMs)
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [inscriptionId, eventId, payment, isPaid, isCashPayment, intervalMs])

  const selectInstallments = async (selectedParcelas: number) => {
    if (!inscriptionId) return
    setCreatingPayment(true)
    setError(null)
    try {
      const query = `?eventId=${eventId}`
      const createResponse = await fetch(`/api/inscriptions/${inscriptionId}/payment${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodo: 'CREDIT_CARD', parcelas: selectedParcelas }),
      })
      const createData = await createResponse.json()
      if (createData.payment) {
        setPayment(createData.payment)
      } else if (createData.error) {
        setError(createData.error)
      }
    } catch {
      setError('Erro ao criar pagamento')
    } finally {
      setCreatingPayment(false)
    }
  }

  return {
    payment,
    inscription,
    participantName,
    preferredPaymentMethod,
    loading,
    error,
    isPaid,
    isCashPayment,
    isInscriptionConfirmed,
    needsInstallmentSelection,
    installmentOptions,
    selectInstallments,
    creatingPayment,
  }
}
