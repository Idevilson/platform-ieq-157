import { UserRole } from '@/server/domain/shared/types'

export class UserRoleValue {
  private constructor(private readonly value: UserRole) {}

  static create(role?: UserRole): UserRoleValue {
    return new UserRoleValue(role ?? 'user')
  }

  isAdmin(): boolean {
    return this.value === 'admin'
  }

  promoteToAdmin(): UserRoleValue {
    return new UserRoleValue('admin')
  }

  toJSON(): UserRole {
    return this.value
  }
}
