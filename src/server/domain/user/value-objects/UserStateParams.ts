import { UserRole } from '@/server/domain/shared/types'
import { Gender } from '@/shared/constants'

export interface RestoreUserStateParams {
  nome: string
  telefone?: string
  dataNascimento?: Date
  sexo?: Gender
  role: UserRole
  criadoEm: Date
  atualizadoEm: Date
  asaasCustomerId?: string
}

export interface UpdateUserStateParams {
  nome?: string
  telefone?: string
  dataNascimento?: Date | string
  sexo?: Gender
}

export interface UpdateUserDataParams {
  nome?: string
  telefone?: string
  dataNascimento?: Date | string
  sexo?: Gender
}
