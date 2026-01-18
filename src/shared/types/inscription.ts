// Shared Inscription DTOs - used by both frontend and backend

import { InscriptionStatus, Gender, PaymentStatus, InscriptionPaymentMethod } from '../constants'

export interface GuestDataDTO {
  nome: string
  email: string
  telefone: string
  cpf: string
  dataNascimento: string | Date
  sexo: Gender
}

export interface InscriptionDTO {
  id: string
  eventId: string
  userId?: string
  categoryId: string
  guestData?: GuestDataDTO
  valor: number
  valorFormatado: string
  preferredPaymentMethod: InscriptionPaymentMethod
  status: InscriptionStatus
  statusLabel: string
  paymentId?: string
  paymentStatus?: PaymentStatus
  criadoEm: string | Date
  atualizadoEm: string | Date
}

export interface CreateInscriptionRequest {
  eventId: string
  categoryId: string
  userId?: string
  guestData?: GuestDataDTO
  preferredPaymentMethod?: InscriptionPaymentMethod
  // Campos adicionais para usuários logados completarem o perfil
  dataNascimento?: string | Date
  sexo?: Gender
}

export interface InscriptionLookupRequest {
  cpf: string
}

export interface InscriptionLookupResponse {
  inscriptions: InscriptionDTO[]
}
