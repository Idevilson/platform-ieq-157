// Shared User DTOs - used by both frontend and backend

import { UserRole, Gender, UserPermissionGrant } from '../constants'

export interface UserDTO {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  cpfFormatado?: string
  dataNascimento?: string | Date
  sexo?: Gender
  role: UserRole
  permissions?: UserPermissionGrant[]
  asaasCustomerId?: string
  isProfileComplete: boolean
  isProfileCompleteForEvent: boolean
  criadoEm: string | Date
  atualizadoEm: string | Date
}

export interface CreateUserRequest {
  email: string
  nome: string
  telefone?: string
  cpf?: string
  dataNascimento?: string | Date
  sexo?: Gender
}

export interface UpdateUserRequest {
  nome?: string
  telefone?: string
  cpf?: string
  dataNascimento?: string | Date
  sexo?: Gender
}

export interface UserProfileResponse {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  cpfFormatado?: string
  dataNascimento?: string | Date
  sexo?: Gender
  role: UserRole
  isProfileComplete: boolean
  isProfileCompleteForEvent: boolean
}
