// Feature 004 — Inscrição Coletiva (BatchInscription)
// Interfaces TypeScript — gerado em 2026-05-09

import type { Gender, InscriptionPaymentMethod } from '@/shared/constants'

// ─── Value Objects ───────────────────────────────────────────────────────────

export type BatchInscriptionStatus = 'pendente' | 'confirmado' | 'cancelado'

// ─── Domain ──────────────────────────────────────────────────────────────────

export interface BatchParticipantProps {
  nome: string
  sexo: Gender
}

export interface BatchResponsavelProps {
  nome: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: Date
  sexo: Gender
  cidade: string
}

export interface BatchInscriptionProps {
  id: string
  eventId: string
  categoryId: string
  status: BatchInscriptionStatus
  paymentId?: string
  valorTotal: number               // cents
  responsavel: BatchResponsavelProps
  cidade: string                   // cidade única de todos os participantes
  participantes: BatchParticipantProps[]
  inscriptionIds: string[]
  criadoEm: Date
  atualizadoEm: Date
}

// ─── DTOs (Shared FE ↔ BE) ───────────────────────────────────────────────────

export interface CreateBatchInscriptionDTO {
  eventId: string
  categoryId: string
  preferredPaymentMethod: 'PIX' | 'CASH'
  responsavel: {
    nome: string
    cpf: string
    email: string
    telefone: string
    dataNascimento: string          // 'YYYY-MM-DD'
    sexo: Gender
    cidade: string
  }
  cidade: string                   // cidade compartilhada dos participantes
  participantes: BatchParticipantProps[]   // min 2, max 50
}

export interface BatchInscriptionDTO {
  id: string
  eventId: string
  categoryId: string
  categoryName?: string
  status: BatchInscriptionStatus
  paymentId?: string
  valorTotal: number               // cents
  valorTotalFormatado: string      // 'R$ 1.200,00'
  responsavel: Omit<BatchResponsavelProps, 'dataNascimento'> & {
    dataNascimento: string
  }
  cidade: string
  participantes: BatchParticipantProps[]
  totalParticipantes: number
  inscriptionIds: string[]
  criadoEm: string
  atualizadoEm: string
}

export interface CreateBatchInscriptionResponse {
  batch: BatchInscriptionDTO
  paymentRequired: boolean         // false se CASH
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

export interface BatchLookupResult {
  batchId: string
  eventId: string
  eventTitle: string
  status: BatchInscriptionStatus
  totalParticipantes: number
  cidade: string
  valorTotal: number
  valorTotalFormatado: string
  participantes: BatchParticipantProps[]
  payment?: {
    status: string
    pixCopiaECola?: string
    pixQrCode?: string
    dataVencimento?: string
  }
}

// ─── API Request / Response ───────────────────────────────────────────────────

export interface BatchPaymentRequest {
  batchId: string
  metodoPagamento: 'PIX' | 'CASH'
}

export interface BatchPaymentResponse {
  paymentId: string
  status: string
  pixCopiaECola?: string
  pixQrCode?: string               // base64
  dataVencimento?: string
  valorTotal: number
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminBatchInscriptionListItem {
  id: string
  responsavelNome: string
  responsavelCpf: string
  cidade: string
  totalParticipantes: number
  valorTotal: number
  valorTotalFormatado: string
  status: BatchInscriptionStatus
  paymentStatus?: string
  metodoPagamento?: 'PIX' | 'CASH'
  criadoEm: string
}

export interface AdminConfirmBatchPaymentRequest {
  batchId: string
}
