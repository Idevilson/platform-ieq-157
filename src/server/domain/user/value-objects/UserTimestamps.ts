export class UserTimestamps {
  private constructor(
    private readonly criadoEm: Date,
    private readonly atualizadoEm: Date
  ) {}

  static create(): UserTimestamps {
    const now = new Date()
    return new UserTimestamps(now, now)
  }

  static restore(criadoEm: Date, atualizadoEm: Date): UserTimestamps {
    return new UserTimestamps(criadoEm, atualizadoEm)
  }

  touch(): UserTimestamps {
    return new UserTimestamps(this.criadoEm, new Date())
  }

  toJSON() {
    return {
      criadoEm: this.criadoEm,
      atualizadoEm: this.atualizadoEm,
    }
  }
}
