import { Phone } from '@/server/domain/shared/value-objects/Phone'
import { Nome } from '@/server/domain/shared/value-objects/Nome'

export class UserContact {
  private constructor(
    private readonly nome: Nome,
    private readonly telefone: Phone | undefined
  ) {}

  static create(nome: string, telefone?: string): UserContact {
    return new UserContact(
      Nome.create(nome),
      telefone ? Phone.create(telefone) : undefined
    )
  }

  static fromPersistence(nome: string, telefone?: string): UserContact {
    return new UserContact(
      Nome.create(nome),
      telefone ? Phone.create(telefone) : undefined
    )
  }

  hasPhone(): boolean {
    return this.telefone !== undefined
  }

  applyUpdates(nome?: string, telefone?: string): UserContact {
    const newNome = nome !== undefined ? Nome.create(nome) : this.nome
    const newTel = telefone !== undefined ? (telefone ? Phone.create(telefone) : undefined) : this.telefone
    return new UserContact(newNome, newTel)
  }

  toJSON() {
    return {
      nome: this.nome.toJSON(),
      telefone: this.telefone?.getValue(),
    }
  }
}
