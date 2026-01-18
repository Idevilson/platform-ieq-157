import { UserMetadata } from './UserMetadata'
import { AsaasCustomerId } from './AsaasCustomerId'
import { UserRole } from '@/server/domain/shared/types'

export class UserConfig {
  private constructor(
    private readonly metadata: UserMetadata,
    private readonly asaas: AsaasCustomerId
  ) {}

  static create(role?: UserRole): UserConfig {
    return new UserConfig(UserMetadata.create(role), AsaasCustomerId.empty())
  }

  static restore(role: UserRole, criadoEm: Date, atualizadoEm: Date, asaasId?: string): UserConfig {
    return new UserConfig(
      UserMetadata.restore(role, criadoEm, atualizadoEm),
      AsaasCustomerId.restore(asaasId)
    )
  }

  isAdmin(): boolean {
    return this.metadata.isAdmin()
  }

  promoteToAdmin(): UserConfig {
    return new UserConfig(this.metadata.promoteToAdmin(), this.asaas)
  }

  setAsaasCustomerId(customerId: string): UserConfig {
    return new UserConfig(this.metadata.touch(), AsaasCustomerId.create(customerId))
  }

  touch(): UserConfig {
    return new UserConfig(this.metadata.touch(), this.asaas)
  }

  toJSON() {
    return {
      ...this.metadata.toJSON(),
      asaasCustomerId: this.asaas.toJSON(),
    }
  }
}
