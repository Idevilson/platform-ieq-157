import { Email } from '@/server/domain/shared/value-objects/Email'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { Phone } from '@/server/domain/shared/value-objects/Phone'
import { UserRole, Timestamps } from '@/server/domain/shared/types'

export interface UserProps {
  id: string
  email: Email
  nome: string
  telefone?: Phone
  cpf?: CPF
  role: UserRole
  asaasCustomerId?: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface CreateUserDTO {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  role?: UserRole
}

export interface UpdateUserDTO {
  nome?: string
  telefone?: string
  cpf?: string
}

export class User implements Timestamps {
  readonly id: string
  readonly email: Email
  nome: string
  telefone?: Phone
  cpf?: CPF
  role: UserRole
  asaasCustomerId?: string
  readonly criadoEm: Date
  atualizadoEm: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.email = props.email
    this.nome = props.nome
    this.telefone = props.telefone
    this.cpf = props.cpf
    this.role = props.role
    this.asaasCustomerId = props.asaasCustomerId
    this.criadoEm = props.criadoEm
    this.atualizadoEm = props.atualizadoEm
  }

  static create(dto: CreateUserDTO): User {
    const now = new Date()

    return new User({
      id: dto.id,
      email: Email.create(dto.email),
      nome: dto.nome,
      telefone: dto.telefone ? Phone.create(dto.telefone) : undefined,
      cpf: dto.cpf ? CPF.create(dto.cpf) : undefined,
      role: dto.role ?? 'user',
      criadoEm: now,
      atualizadoEm: now,
    })
  }

  static fromPersistence(data: {
    id: string
    email: string
    nome: string
    telefone?: string
    cpf?: string
    role: UserRole
    asaasCustomerId?: string
    criadoEm: Date
    atualizadoEm: Date
  }): User {
    return new User({
      id: data.id,
      email: Email.create(data.email),
      nome: data.nome,
      telefone: data.telefone ? Phone.create(data.telefone) : undefined,
      cpf: data.cpf ? CPF.create(data.cpf) : undefined,
      role: data.role,
      asaasCustomerId: data.asaasCustomerId,
      criadoEm: data.criadoEm,
      atualizadoEm: data.atualizadoEm,
    })
  }

  isAdmin(): boolean {
    return this.role === 'admin'
  }

  isProfileComplete(): boolean {
    return !!this.cpf
  }

  canCreateInscription(): boolean {
    return this.isProfileComplete()
  }

  updateProfile(dto: UpdateUserDTO): void {
    if (dto.nome !== undefined) this.nome = dto.nome
    if (dto.telefone !== undefined) this.telefone = dto.telefone ? Phone.create(dto.telefone) : undefined
    if (dto.cpf !== undefined) this.cpf = dto.cpf ? CPF.create(dto.cpf) : undefined

    this.atualizadoEm = new Date()
  }

  setAsaasCustomerId(customerId: string): void {
    this.asaasCustomerId = customerId
    this.atualizadoEm = new Date()
  }

  promoteToAdmin(): void {
    this.role = 'admin'
    this.atualizadoEm = new Date()
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email.getValue(),
      nome: this.nome,
      telefone: this.telefone?.getValue(),
      cpf: this.cpf?.getValue(),
      cpfFormatado: this.cpf?.getFormatted(),
      role: this.role,
      asaasCustomerId: this.asaasCustomerId,
      isProfileComplete: this.isProfileComplete(),
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm,
    }
  }
}
