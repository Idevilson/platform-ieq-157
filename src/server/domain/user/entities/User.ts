import { UserIdentity } from '../value-objects/UserIdentity'
import { UserState } from '../value-objects/UserState'
import { RestoreUserStateParams, UpdateUserStateParams } from '../value-objects/UserStateParams'
import { UserRole } from '@/server/domain/shared/types'
import { UserPermissionGrant, GLOBAL_PERMISSION_SCOPE } from '@/shared/constants'

// Aceita o formato legado (string[]) — tratado como global.
function normalizeGrants(input?: string[] | UserPermissionGrant[]): UserPermissionGrant[] {
  if (!input?.length) return []
  return input.map((p) =>
    typeof p === 'string'
      ? { key: p, eventIds: [GLOBAL_PERMISSION_SCOPE] }
      : { key: p.key, eventIds: p.eventIds?.length ? [...p.eventIds] : [GLOBAL_PERMISSION_SCOPE] },
  )
}

export class User {
  private _permissions: UserPermissionGrant[]

  private constructor(
    private readonly identity: UserIdentity,
    private state: UserState,
    permissions?: string[] | UserPermissionGrant[],
  ) {
    this._permissions = normalizeGrants(permissions)
  }

  static create(id: string, email: string, nome: string, telefone?: string, cpf?: string, role?: UserRole): User {
    return new User(UserIdentity.create(id, email, cpf), UserState.create(nome, telefone, role))
  }

  static restore(
    id: string,
    email: string,
    params: RestoreUserStateParams,
    cpf?: string,
    permissions?: string[] | UserPermissionGrant[],
  ): User {
    return new User(UserIdentity.create(id, email, cpf), UserState.restore(params), permissions)
  }

  isAdmin(): boolean {
    return this.state.isAdmin()
  }

  // Sem eventId, só passa em grant global.
  hasPermission(permission: string, eventId?: string): boolean {
    if (this.isAdmin()) return true
    const grant = this._permissions.find((g) => g.key === permission)
    if (!grant) return false
    if (grant.eventIds.includes(GLOBAL_PERMISSION_SCOPE)) return true
    if (!eventId) return false
    return grant.eventIds.includes(eventId)
  }

  grantPermission(key: string, eventIds: string[]): void {
    const scope = eventIds?.length ? [...new Set(eventIds)] : [GLOBAL_PERMISSION_SCOPE]
    const existing = this._permissions.find((g) => g.key === key)
    if (existing) {
      existing.eventIds = scope
      return
    }
    this._permissions.push({ key, eventIds: scope })
  }

  revokePermission(key: string): void {
    this._permissions = this._permissions.filter((g) => g.key !== key)
  }

  setPermissions(grants: UserPermissionGrant[]): void {
    this._permissions = normalizeGrants(grants).filter((g) => g.key)
  }

  get permissions(): UserPermissionGrant[] {
    return this._permissions.map((g) => ({ key: g.key, eventIds: [...g.eventIds] }))
  }

  // Índice achatado key:eventId para query array-contains-any.
  get permissionIndex(): string[] {
    return this._permissions.flatMap((g) => g.eventIds.map((e) => `${g.key}:${e}`))
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
    return {
      ...this.identity.toJSON(),
      ...this.state.toJSON(),
      permissions: this.permissions,
      permissionIndex: this.permissionIndex,
    }
  }
}
