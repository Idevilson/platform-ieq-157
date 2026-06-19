// Shared Inscription DTOs - used by both frontend and backend

import { InscriptionStatus, Gender, PaymentStatus, InscriptionPaymentMethod, KitDeliveryDTO } from '../constants'

export interface GuestDataDTO {
  nome: string
  email: string
  telefone: string
  cpf: string
  dataNascimento: string | Date
  sexo: Gender
  cidade?: string
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
  tamanho?: string
  campoMissionario?: string
  temBrinde?: boolean
  perkId?: string
  brindeAlocadoEm?: string | Date
  confirmadoEm?: string | Date
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
  batches?: BatchLookupResult[]
}

// ─── Batch Inscription Types ──────────────────────────────────────────────────

export interface BatchParticipantDTO {
  nome: string
  sexo: Gender
  tamanho?: string
  temBrinde?: boolean
}

export interface BatchResponsavelDTO {
  nome: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: string
  sexo: Gender
  cidade: string
  campoMissionario?: string
}

export interface BatchInscriptionDTO {
  id: string
  eventId: string
  categoryId: string
  categoryName?: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  paymentId?: string
  preferredPaymentMethod: InscriptionPaymentMethod
  valorTotal: number
  valorTotalFormatado: string
  responsavel: BatchResponsavelDTO
  cidade: string
  participantes: BatchParticipantDTO[]
  totalParticipantes: number
  inscriptionIds: string[]
  pixCopiaECola?: string
  pixQrCode?: string
  checkoutUrl?: string
  dataVencimentoPagamento?: string
  paymentStatus?: string
  confirmadoEm?: string
  criadoEm: string
  atualizadoEm: string
}

export interface CreateBatchInscriptionRequest {
  eventId: string
  categoryId: string
  preferredPaymentMethod?: InscriptionPaymentMethod
  responsavel: {
    nome: string
    cpf: string
    email: string
    telefone: string
    dataNascimento: string
    sexo: Gender
    cidade: string
    campoMissionario?: string
  }
  cidade: string
  participantes: BatchParticipantDTO[]
}

export interface BatchLookupResult {
  batchId: string
  eventId: string
  eventTitle: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  totalParticipantes: number
  cidade: string
  valorTotal: number
  valorTotalFormatado: string
  preferredPaymentMethod: InscriptionPaymentMethod
  participantes: BatchParticipantDTO[]
  payment?: {
    status: string
    pixCopiaECola?: string
    pixQrCode?: string
    checkoutUrl?: string
    dataVencimento?: string
  }
}

export interface AdminBatchListItem {
  id: string
  eventId: string
  categoryId: string
  responsavelNome: string
  responsavelCpf: string
  cidade: string
  totalParticipantes: number
  valorTotal: number
  valorTotalFormatado: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  preferredPaymentMethod: InscriptionPaymentMethod
  paymentId?: string
  paymentStatus?: string
  confirmadoPorNome?: string
  confirmadoEm?: string
  kitDeliveries?: KitDeliveryDTO[]
  criadoEm: string
  participantes: BatchParticipantDTO[]
}
