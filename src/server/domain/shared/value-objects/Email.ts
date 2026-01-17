
export class Email {
  private readonly value: string

  private constructor(email: string) {
    this.value = email.toLowerCase().trim()
  }

  static create(email: string): Email {
    if (!email || typeof email !== 'string') {
      throw new Error('Email é obrigatório')
    }

    const trimmedEmail = email.toLowerCase().trim()

    if (!Email.isValid(trimmedEmail)) {
      throw new Error('Email inválido')
    }

    return new Email(trimmedEmail)
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  getValue(): string {
    return this.value
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
