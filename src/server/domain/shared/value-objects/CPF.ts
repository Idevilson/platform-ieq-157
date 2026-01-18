
export class CPF {
  private readonly value: string

  private constructor(cpf: string) {
    this.value = cpf
  }

  static create(cpf: string): CPF {
    if (!cpf || typeof cpf !== 'string') {
      throw new Error('CPF é obrigatório')
    }

    const cleanCpf = CPF.clean(cpf)

    if (!CPF.isValid(cleanCpf)) {
      throw new Error('CPF inválido')
    }

    return new CPF(cleanCpf)
  }

  static clean(cpf: string): string {
    return cpf.replace(/\D/g, '')
  }

  static isValid(cpf: string): boolean {
    const cleanCpf = CPF.clean(cpf)

    // Must have 11 digits
    if (cleanCpf.length !== 11) {
      return false
    }

    // Reject known invalid CPFs (all same digits)
    if (/^(\d)\1+$/.test(cleanCpf)) {
      return false
    }

    // Validate check digits using official algorithm
    return CPF.validateCheckDigits(cleanCpf)
  }

  private static validateCheckDigits(cpf: string): boolean {
    // Calculate first check digit
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) {
      remainder = 0
    }
    if (remainder !== parseInt(cpf.charAt(9))) {
      return false
    }

    // Calculate second check digit
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) {
      remainder = 0
    }
    if (remainder !== parseInt(cpf.charAt(10))) {
      return false
    }

    return true
  }

  getValue(): string {
    return this.value
  }

  getFormatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  equals(other: CPF): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
