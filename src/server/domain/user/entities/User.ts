import { UserIdentity } from '../value-objects/UserIdentity'
import { UserState } from '../value-objects/UserState'
import { RestoreUserStateParams, UpdateUserStateParams } from '../value-objects/UserStateParams'
import { UserRole } from '@/server/domain/shared/types'

export class User {
  private constructor(
    private readonly identity: UserIdentity,
    private state: UserState
  ) {}

  static create(id: string, email: string, nome: string, telefone?: string, cpf?: string, role?: UserRole): User {
    return new User(UserIdentity.create(id, email, cpf), UserState.create(nome, telefone, role))
  }

  static restore(id: string, email: string, params: RestoreUserStateParams, cpf?: string): User {
    return new User(UserIdentity.create(id, email, cpf), UserState.restore(params))
  }

  isAdmin(): boolean {
    return this.state.isAdmin()
  }

  isProfileComplete(): boolean {
    return this.identity.hasCpf()
  }

  isProfileCompleteForEvent(): boolean {
    return this.identity.hasCpf() && this.state.isEventReady()
  }

  updateProfile(params: UpdateUserStateParams): void {
    this.state = this.state.updateProfile(params)
  }

  updateCpf(cpf?: string): void {
    Object.assign(this, { identity: this.identity.updateCpf(cpf) })
  }

  setAsaasCustomerId(id: string): void {
    this.state = this.state.setAsaasCustomerId(id)
  }

  promoteToAdmin(): void {
    this.state = this.state.promoteToAdmin()
  }

  toJSON() {
    return { ...this.identity.toJSON(), ...this.state.toJSON() }
  }
}
