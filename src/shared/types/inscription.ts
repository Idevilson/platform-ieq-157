// Shared Inscription DTOs - used by both frontend and backend

import { InscriptionStatus } from '../constants'

export interface GuestDataDTO {
  nome: string
  email: string
  telefone: string
  cpf: string
}

export interface InscriptionDTO {
  id: string
  eventId: string
  userId?: string
  categoryId: string
  guestData?: GuestDataDTO
  valor: number
  valorFormatado: string
  status: InscriptionStatus
  statusLabel: string
  paymentId?: string
  criadoEm: string | Date
  atualizadoEm: string | Date
}

export interface CreateInscriptionRequest {
  eventId: string
  categoryId: string
  userId?: string
  guestData?: GuestDataDTO
}

export interface InscriptionLookupRequest {
  cpf: string
}

export interface InscriptionLookupResponse {
  inscriptions: InscriptionDTO[]
}
