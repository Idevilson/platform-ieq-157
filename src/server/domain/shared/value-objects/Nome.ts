export class Nome {
  private constructor(private readonly value: string) {}

  static create(nome: string): Nome {
    Nome.validate(nome)
    return new Nome(nome.trim())
  }

  private static validate(nome: string): void {
    if (!nome) {
      throw new Error('Nome é obrigatório')
    }
    if (nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres')
    }
  }

  equals(other: Nome): boolean {
    return this.value === other.value
  }

  toJSON(): string {
    return this.value
  }
}
