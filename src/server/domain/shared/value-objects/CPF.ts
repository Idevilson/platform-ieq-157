import { cleanCPF, isValidCPF } from '@/lib/cpf'
import { ValidationError } from '@/server/domain/shared/errors'

export class CPF {
  private readonly value: string

  private constructor(cpf: string) {
    this.value = cpf
  }

  static create(cpf: string): CPF {
    if (!cpf || typeof cpf !== 'string') {
      throw new ValidationError('CPF é obrigatório')
    }

    const cleaned = cleanCPF(cpf)

    if (!isValidCPF(cleaned)) {
      throw new ValidationError('CPF inválido')
    }

    return new CPF(cleaned)
  }

  static clean(cpf: string): string {
    return cleanCPF(cpf)
  }

  static isValid(cpf: string): boolean {
    return isValidCPF(cpf)
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
