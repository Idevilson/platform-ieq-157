// Shared User DTOs - used by both frontend and backend

import { UserRole } from '../constants'

export interface UserDTO {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  cpfFormatado?: string
  role: UserRole
  asaasCustomerId?: string
  isProfileComplete: boolean
  criadoEm: string | Date
  atualizadoEm: string | Date
}

export interface CreateUserRequest {
  email: string
  nome: string
  telefone?: string
  cpf?: string
}

export interface UpdateUserRequest {
  nome?: string
  telefone?: string
  cpf?: string
}

export interface UserProfileResponse {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  cpfFormatado?: string
  role: UserRole
  isProfileComplete: boolean
}
