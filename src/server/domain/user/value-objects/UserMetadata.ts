import { UserRoleValue } from './UserRoleValue'
import { UserTimestamps } from './UserTimestamps'
import { UserRole } from '@/server/domain/shared/types'

export class UserMetadata {
  private constructor(
    private readonly role: UserRoleValue,
    private readonly timestamps: UserTimestamps
  ) {}

  static create(role?: UserRole): UserMetadata {
    return new UserMetadata(UserRoleValue.create(role), UserTimestamps.create())
  }

  static restore(role: UserRole, criadoEm: Date, atualizadoEm: Date): UserMetadata {
    return new UserMetadata(
      UserRoleValue.create(role),
      UserTimestamps.restore(criadoEm, atualizadoEm)
    )
  }

  isAdmin(): boolean {
    return this.role.isAdmin()
  }

  promoteToAdmin(): UserMetadata {
    return new UserMetadata(this.role.promoteToAdmin(), this.timestamps.touch())
  }

  touch(): UserMetadata {
    return new UserMetadata(this.role, this.timestamps.touch())
  }

  toJSON() {
    return {
      role: this.role.toJSON(),
      ...this.timestamps.toJSON(),
    }
  }
}
