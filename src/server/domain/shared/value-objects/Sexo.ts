import { Gender, GENDERS } from '@/shared/constants'

export class Sexo {
  private constructor(private readonly value: Gender) {}

  static create(sexo: string): Sexo {
    Sexo.validate(sexo)
    return new Sexo(sexo as Gender)
  }

  private static validate(sexo: string): void {
    if (!sexo) {
      throw new Error('Sexo é obrigatório')
    }
    if (!GENDERS.includes(sexo as Gender)) {
      throw new Error('Sexo deve ser masculino ou feminino')
    }
  }

  equals(other: Sexo): boolean {
    return this.value === other.value
  }

  toJSON(): Gender {
    return this.value
  }
}
