
export type AsaasEnvironment = 'sandbox' | 'production'

export interface AsaasConfig {
  apiKey: string
  environment: AsaasEnvironment
  webhookToken: string
  baseUrl: string
}

function getBaseUrl(environment: AsaasEnvironment): string {
  return environment === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3'
}

export function getAsaasConfig(): AsaasConfig {
  const apiKey = process.env.ASAAS_API_KEY
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
  const environment = (process.env.ASAAS_ENVIRONMENT || 'sandbox') as AsaasEnvironment

  if (!apiKey) {
    throw new Error('ASAAS_API_KEY environment variable is required')
  }

  if (!webhookToken) {
    throw new Error('ASAAS_WEBHOOK_TOKEN environment variable is required')
  }

  return {
    apiKey,
    environment,
    webhookToken,
    baseUrl: getBaseUrl(environment),
  }
}

// Payment methods supported by the platform
export const SUPPORTED_PAYMENT_METHODS = ['PIX', 'BOLETO', 'CREDIT_CARD'] as const
export type PaymentMethod = (typeof SUPPORTED_PAYMENT_METHODS)[number]

// Default payment due date (days from now)
export const DEFAULT_DUE_DAYS = 3

// Webhook retry configuration
export const WEBHOOK_MAX_RETRIES = 3
export const WEBHOOK_RETRY_DELAY_MS = 5000
