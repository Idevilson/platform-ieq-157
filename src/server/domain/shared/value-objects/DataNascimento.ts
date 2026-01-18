export class DataNascimento {
  private constructor(private readonly value: Date) {}

  static create(data: Date | string): DataNascimento {
    const parsed = DataNascimento.parse(data)
    DataNascimento.validate(parsed)
    return new DataNascimento(parsed)
  }

  private static parse(data: Date | string): Date {
    if (data instanceof Date) {
      return data
    }
    return new Date(data)
  }

  private static validate(data: Date): void {
    if (isNaN(data.getTime())) {
      throw new Error('Data de nascimento inválida')
    }
    if (data > new Date()) {
      throw new Error('Data de nascimento não pode ser no futuro')
    }
  }

  calculateAge(): number {
    const today = new Date()
    const birth = this.value
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    const hasBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && today.getDate() >= birth.getDate())
    return hasBirthdayPassed ? age : age - 1
  }

  formatBrazilian(): string {
    return this.value.toLocaleDateString('pt-BR')
  }

  equals(other: DataNascimento): boolean {
    return this.value.getTime() === other.value.getTime()
  }

  toJSON(): Date {
    return this.value
  }
}
