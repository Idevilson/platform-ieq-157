import { UserData } from './UserData'
import { UserConfig } from './UserConfig'
import { RestoreUserStateParams, UpdateUserStateParams } from './UserStateParams'
import { UserRole } from '@/server/domain/shared/types'

export class UserState {
  private constructor(
    private readonly data: UserData,
    private readonly config: UserConfig
  ) {}

  static create(nome: string, telefone?: string, role?: UserRole): UserState {
    return new UserState(UserData.create(nome, telefone), UserConfig.create(role))
  }

  static restore(params: RestoreUserStateParams): UserState {
    return new UserState(
      UserData.restore(params.nome, params.telefone, params.dataNascimento, params.sexo),
      UserConfig.restore(params.role, params.criadoEm, params.atualizadoEm, params.asaasCustomerId)
    )
  }

  isAdmin(): boolean {
    return this.config.isAdmin()
  }

  isEventReady(): boolean {
    return this.data.isEventReady()
  }

  promoteToAdmin(): UserState {
    return new UserState(this.data, this.config.promoteToAdmin())
  }

  setAsaasCustomerId(id: string): UserState {
    return new UserState(this.data, this.config.setAsaasCustomerId(id))
  }

  updateProfile(params: UpdateUserStateParams): UserState {
    return new UserState(this.data.applyUpdates(params), this.config.touch())
  }

  toJSON() {
    return { ...this.data.toJSON(), ...this.config.toJSON() }
  }
}
