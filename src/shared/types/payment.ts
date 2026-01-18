// Shared Payment DTOs - used by both frontend and backend

import { PaymentStatus, PaymentMethod } from '../constants'

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
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
  dataVencimento: string | Date
  dataPagamento?: string | Date
  criadoEm: string | Date
  atualizadoEm: string | Date
}

export interface CreatePaymentRequest {
  inscriptionId: string
  metodoPagamento: PaymentMethod
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
