export class AsaasCustomerId {
  private constructor(private readonly value: string | undefined) {}

  static empty(): AsaasCustomerId {
    return new AsaasCustomerId(undefined)
  }

  static create(customerId: string): AsaasCustomerId {
    return new AsaasCustomerId(customerId)
  }

  static restore(customerId?: string): AsaasCustomerId {
    return new AsaasCustomerId(customerId)
  }

  hasValue(): boolean {
    return this.value !== undefined
  }

  toJSON(): string | undefined {
    return this.value
  }
}
