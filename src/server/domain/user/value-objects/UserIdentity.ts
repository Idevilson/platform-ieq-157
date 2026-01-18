import { UserIdentification } from './UserIdentification'

export class UserIdentity {
  private constructor(
    private readonly id: string,
    private readonly identification: UserIdentification
  ) {}

  static create(id: string, email: string, cpf?: string): UserIdentity {
    return new UserIdentity(id, UserIdentification.create(email, cpf))
  }

  getId(): string {
    return this.id
  }

  hasCpf(): boolean {
    return this.identification.hasCpf()
  }

  updateCpf(cpf?: string): UserIdentity {
    return new UserIdentity(this.id, this.identification.updateCpf(cpf))
  }

  toJSON() {
    return {
      id: this.id,
      ...this.identification.toJSON(),
    }
  }
}
