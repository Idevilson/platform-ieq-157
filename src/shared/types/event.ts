// Shared Event DTOs - used by both frontend and backend

import { EventStatus, PaymentMethod } from '../constants'

export interface EventCategoryDTO {
  id: string
  nome: string
  valor: number
  valorFormatado: string
  descricao?: string
  ordem?: number
}

export interface EventDTO {
  id: string
  titulo: string
  subtitulo?: string
  descricao: string
  descricaoCompleta?: string
  dataInicio: string | Date
  dataFim?: string | Date
  local: string
  endereco: string
  googleMapsUrl?: string
  whatsappContato?: string
  status: EventStatus
  statusLabel: string
  metodosPagamento: PaymentMethod[]
  imagemUrl?: string
  categorias: EventCategoryDTO[]
  criadoEm: string | Date
  atualizadoEm: string | Date
}

export interface EventSummaryDTO {
  id: string
  titulo: string
  subtitulo?: string
  descricao: string
  dataInicio: string | Date
  local: string
  status: EventStatus
  imagemUrl?: string
}

export interface CreateEventRequest {
  titulo: string
  subtitulo?: string
  descricao: string
  descricaoCompleta?: string
  dataInicio: string
  dataFim?: string
  local: string
  endereco: string
  googleMapsUrl?: string
  whatsappContato?: string
  metodosPagamento: PaymentMethod[]
  imagemUrl?: string
}

export interface UpdateEventRequest {
  titulo?: string
  subtitulo?: string
  descricao?: string
  descricaoCompleta?: string
  dataInicio?: string
  dataFim?: string
  local?: string
  endereco?: string
  googleMapsUrl?: string
  whatsappContato?: string
  status?: EventStatus
  metodosPagamento?: PaymentMethod[]
  imagemUrl?: string
}
