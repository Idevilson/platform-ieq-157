
export class Money {
  private readonly cents: number

  private constructor(cents: number) {
    this.cents = cents
  }

  static fromCents(cents: number): Money {
    if (!Number.isInteger(cents)) {
      throw new Error('Valor deve ser um número inteiro em centavos')
    }
    if (cents < 0) {
      throw new Error('Valor não pode ser negativo')
    }
    return new Money(cents)
  }

  static fromReais(reais: number): Money {
    if (typeof reais !== 'number' || isNaN(reais)) {
      throw new Error('Valor inválido')
    }
    if (reais < 0) {
      throw new Error('Valor não pode ser negativo')
    }
    // Round to avoid floating point issues
    const cents = Math.round(reais * 100)
    return new Money(cents)
  }

  static zero(): Money {
    return new Money(0)
  }

  getCents(): number {
    return this.cents
  }

  getReais(): number {
    return this.cents / 100
  }

  getFormatted(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.cents / 100)
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents)
  }

  subtract(other: Money): Money {
    const result = this.cents - other.cents
    if (result < 0) {
      throw new Error('Resultado não pode ser negativo')
    }
    return new Money(result)
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Fator não pode ser negativo')
    }
    return new Money(Math.round(this.cents * factor))
  }

  isZero(): boolean {
    return this.cents === 0
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents
  }

  isLessThan(other: Money): boolean {
    return this.cents < other.cents
  }

  equals(other: Money): boolean {
    return this.cents === other.cents
  }

  toString(): string {
    return this.getFormatted()
  }
}
