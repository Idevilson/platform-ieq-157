
import { Email } from '@/server/domain/shared/value-objects/Email'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { Phone } from '@/server/domain/shared/value-objects/Phone'

export interface GuestDataInput {
  nome: string
  email: string
  telefone: string
  cpf: string
}

export class GuestData {
  readonly nome: string
  readonly email: Email
  readonly telefone: Phone
  readonly cpf: CPF

  private constructor(nome: string, email: Email, telefone: Phone, cpf: CPF) {
    this.nome = nome
    this.email = email
    this.telefone = telefone
    this.cpf = cpf
  }

  static create(input: GuestDataInput): GuestData {
    if (!input.nome || input.nome.trim().length < 2) {
      throw new Error('Nome é obrigatório e deve ter pelo menos 2 caracteres')
    }

    return new GuestData(
      input.nome.trim(),
      Email.create(input.email),
      Phone.create(input.telefone),
      CPF.create(input.cpf)
    )
  }

  static fromPersistence(data: {
    nome: string
    email: string
    telefone: string
    cpf: string
  }): GuestData {
    return new GuestData(
      data.nome,
      Email.create(data.email),
      Phone.create(data.telefone),
      CPF.create(data.cpf)
    )
  }

  toJSON() {
    return {
      nome: this.nome,
      email: this.email.getValue(),
      telefone: this.telefone.getValue(),
      cpf: this.cpf.getValue(),
    }
  }
}
