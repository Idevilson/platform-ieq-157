import { Email } from '@/server/domain/shared/value-objects/Email'
import { CPF } from '@/server/domain/shared/value-objects/CPF'

export class UserIdentification {
  private constructor(
    private readonly email: Email,
    private readonly cpf: CPF | undefined
  ) {}

  static create(email: string, cpf?: string): UserIdentification {
    return new UserIdentification(
      Email.create(email),
      cpf ? CPF.create(cpf) : undefined
    )
  }

  hasCpf(): boolean {
    return this.cpf !== undefined
  }

  updateCpf(cpf?: string): UserIdentification {
    return new UserIdentification(
      this.email,
      cpf ? CPF.create(cpf) : undefined
    )
  }

  toJSON() {
    return {
      email: this.email.getValue(),
      cpf: this.cpf?.getValue(),
      cpfFormatado: this.cpf?.getFormatted(),
    }
  }
}
