import { Gender, GENDERS } from '@/shared/constants'
import { ValidationError } from '@/server/domain/shared/errors'

export class Sexo {
  private constructor(private readonly value: Gender) {}

  static create(sexo: string): Sexo {
    Sexo.validate(sexo)
    return new Sexo(sexo as Gender)
  }

  private static validate(sexo: string): void {
    if (!sexo) {
      throw new ValidationError('Sexo é obrigatório')
    }
    if (!GENDERS.includes(sexo as Gender)) {
      throw new ValidationError('Sexo deve ser masculino ou feminino')
    }
  }

  equals(other: Sexo): boolean {
    return this.value === other.value
  }

  toJSON(): Gender {
    return this.value
  }
}
