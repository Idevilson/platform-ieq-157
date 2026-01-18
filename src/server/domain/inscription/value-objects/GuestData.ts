import { Email } from '@/server/domain/shared/value-objects/Email'
import { CPF } from '@/server/domain/shared/value-objects/CPF'
import { Phone } from '@/server/domain/shared/value-objects/Phone'
import { DataNascimento } from '@/server/domain/shared/value-objects/DataNascimento'
import { Sexo } from '@/server/domain/shared/value-objects/Sexo'
import { Gender } from '@/shared/constants'

export interface GuestDataInput {
  nome: string
  email: string
  telefone: string
  cpf: string
  dataNascimento: Date | string
  sexo: Gender
}

export class GuestData {
  readonly nome: string
  readonly email: Email
  readonly telefone: Phone
  readonly cpf: CPF
  readonly dataNascimento: DataNascimento
  readonly sexo: Sexo

  private constructor(
    nome: string,
    email: Email,
    telefone: Phone,
    cpf: CPF,
    dataNascimento: DataNascimento,
    sexo: Sexo
  ) {
    this.nome = nome
    this.email = email
    this.telefone = telefone
    this.cpf = cpf
    this.dataNascimento = dataNascimento
    this.sexo = sexo
  }

  static create(input: GuestDataInput): GuestData {
    GuestData.validateNome(input.nome)

    return new GuestData(
      input.nome.trim(),
      Email.create(input.email),
      Phone.create(input.telefone),
      CPF.create(input.cpf),
      DataNascimento.create(input.dataNascimento),
      Sexo.create(input.sexo)
    )
  }

  private static validateNome(nome: string): void {
    if (!nome || nome.trim().length < 2) {
      throw new Error('Nome é obrigatório e deve ter pelo menos 2 caracteres')
    }
  }

  static fromPersistence(data: {
    nome: string
    email: string
    telefone: string
    cpf: string
    dataNascimento: Date
    sexo: Gender
  }): GuestData {
    return new GuestData(
      data.nome,
      Email.create(data.email),
      Phone.create(data.telefone),
      CPF.create(data.cpf),
      DataNascimento.create(data.dataNascimento),
      Sexo.create(data.sexo)
    )
  }

  toJSON() {
    return {
      nome: this.nome,
      email: this.email.getValue(),
      telefone: this.telefone.getValue(),
      cpf: this.cpf.getValue(),
      dataNascimento: this.dataNascimento.toJSON(),
      dataNascimentoFormatado: this.dataNascimento.formatBrazilian(),
      sexo: this.sexo.toJSON(),
    }
  }
}
