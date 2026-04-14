// Shared Payment DTOs - used by both frontend and backend

import { PaymentStatus, PaymentMethod } from '../constants'

export interface PaymentBreakdownDTO {
  valorBase: number
  valorBaseFormatado: string
  valorTaxa: number
  valorTaxaFormatado: string
  valorTotal: number
  valorTotalFormatado: string
  metodo: PaymentMethod
  parcelas?: number
  valorParcela?: number
  valorParcelaFormatado?: string
}

export interface PaymentDTO {
  id: string
  inscriptionId: string
  userId?: string
  asaasPaymentId: string
  valor: number
  valorFormatado: string
  status: PaymentStatus
  statusLabel: string
  metodoPagamento: PaymentMethod
  breakdown: PaymentBreakdownDTO | null
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
  checkoutUrl?: string
  dataVencimento: string | Date
  dataPagamento?: string | Date
  criadoEm: string | Date
  atualizadoEm: string | Date
}

export interface CreatePaymentRequest {
  inscriptionId: string
  metodoPagamento: PaymentMethod
  parcelas?: number
  creditCardToken?: string
}

export interface PaymentWebhookPayload {
  event: string
  payment: {
    id: string
    customer: string
    value: number
    status: PaymentStatus
    paymentDate?: string
  }
}
