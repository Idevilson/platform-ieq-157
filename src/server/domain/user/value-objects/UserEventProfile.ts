import { DataNascimento } from '@/server/domain/shared/value-objects/DataNascimento'
import { Sexo } from '@/server/domain/shared/value-objects/Sexo'
import { Gender } from '@/shared/constants'

export class UserEventProfile {
  private constructor(
    private readonly dataNascimento: DataNascimento | undefined,
    private readonly sexo: Sexo | undefined
  ) {}

  static empty(): UserEventProfile {
    return new UserEventProfile(undefined, undefined)
  }

  static create(dataNascimento?: Date | string, sexo?: Gender): UserEventProfile {
    return new UserEventProfile(
      dataNascimento ? DataNascimento.create(dataNascimento) : undefined,
      sexo ? Sexo.create(sexo) : undefined
    )
  }

  isComplete(): boolean {
    return this.dataNascimento !== undefined && this.sexo !== undefined
  }

  applyUpdates(data?: Date | string, sexo?: Gender): UserEventProfile {
    const newData = data !== undefined ? (data ? DataNascimento.create(data) : undefined) : this.dataNascimento
    const newSexo = sexo !== undefined ? (sexo ? Sexo.create(sexo) : undefined) : this.sexo
    return new UserEventProfile(newData, newSexo)
  }

  toJSON() {
    return {
      dataNascimento: this.dataNascimento?.toJSON(),
      sexo: this.sexo?.toJSON(),
    }
  }
}
