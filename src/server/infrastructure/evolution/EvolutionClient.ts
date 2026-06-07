export interface SendTextOptions {
  to: string
  text: string
}

export interface SendTextResult {
  messageId: string
  status: string
  remoteJid: string
}

export class EvolutionApiError extends Error {
  constructor(public readonly statusCode: number, public readonly body: string) {
    super(`Evolution API responded ${statusCode}: ${body}`)
    this.name = 'EvolutionApiError'
  }
}

export class EvolutionInstance {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly instanceName: string,
  ) {}

  async sendText({ to, text }: SendTextOptions): Promise<SendTextResult> {
    const response = await fetch(`${this.baseUrl}/message/sendText/${this.instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
      },
      body: JSON.stringify({ number: to, text }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new EvolutionApiError(response.status, body)
    }

    const data = (await response.json()) as {
      key: { id: string; remoteJid: string }
      status: string
    }

    return {
      messageId: data.key.id,
      remoteJid: data.key.remoteJid,
      status: data.status,
    }
  }
}

export class EvolutionClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  instance(name: string): EvolutionInstance {
    return new EvolutionInstance(this.baseUrl, this.apiKey, name)
  }

  static fromEnv(): EvolutionClient {
    const baseUrl = process.env.EVOLUTION_BASE_URL
    const apiKey = process.env.EVOLUTION_API_KEY
    if (!baseUrl) throw new Error('EVOLUTION_BASE_URL not configured')
    if (!apiKey) throw new Error('EVOLUTION_API_KEY not configured')
    return new EvolutionClient(baseUrl.replace(/\/$/, ''), apiKey)
  }
}
