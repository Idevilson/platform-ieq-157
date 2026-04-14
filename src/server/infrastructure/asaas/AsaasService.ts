// Asaas Payment Gateway Integration

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || ''
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'sandbox'

const API_BASE_URL = ASAAS_ENVIRONMENT === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://sandbox.asaas.com/api/v3'

export interface AsaasCustomer {
  id: string
  name: string
  email: string
  cpfCnpj: string
  phone?: string
}

export interface CreateCustomerDTO {
  name: string
  email: string
  cpfCnpj: string
  phone?: string
}

export interface CreatePaymentDTO {
  customer: string
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  value?: number
  totalValue?: number
  dueDate: string
  description?: string
  externalReference?: string
  installmentCount?: number
  installmentValue?: number
  creditCardToken?: string
  remoteIp?: string
}

export interface AsaasPayment {
  id: string
  customer: string
  billingType: string
  value: number
  netValue: number
  status: string
  dueDate: string
  description?: string
  externalReference?: string
  invoiceUrl?: string
  bankSlipUrl?: string
}

export interface AsaasPixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string
}

class AsaasServiceClass {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const apiKey = process.env.ASAAS_API_KEY || ''
    const url = `${API_BASE_URL}${endpoint}`
    console.log('[Asaas] request:', url, 'apiKey present:', !!apiKey, 'length:', apiKey.length)

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.errors?.[0]?.description || `Asaas API Error: ${response.status}`)
    }

    return response.json()
  }

  async findCustomerByCpf(cpf: string): Promise<AsaasCustomer | null> {
    const cleanCpf = cpf.replace(/\D/g, '')
    const result = await this.request<{ data: AsaasCustomer[] }>(`/customers?cpfCnpj=${cleanCpf}`)
    return result.data.length > 0 ? result.data[0] : null
  }

  async createCustomer(dto: CreateCustomerDTO): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: dto.name,
        email: dto.email,
        cpfCnpj: dto.cpfCnpj.replace(/\D/g, ''),
        phone: dto.phone?.replace(/\D/g, ''),
        notificationDisabled: false,
      }),
    })
  }

  async findOrCreateCustomer(dto: CreateCustomerDTO): Promise<AsaasCustomer> {
    const existing = await this.findCustomerByCpf(dto.cpfCnpj)
    if (existing) return existing
    return this.createCustomer(dto)
  }

  async createPayment(dto: CreatePaymentDTO): Promise<AsaasPayment> {
    return this.request<AsaasPayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  }

  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return this.request<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`)
  }

  async getPayment(paymentId: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${paymentId}`)
  }

  async cancelPayment(paymentId: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>(`/payments/${paymentId}`, {
      method: 'DELETE',
    })
  }

  async createPaymentLink(dto: CreatePaymentLinkDTO): Promise<AsaasPaymentLink> {
    return this.request<AsaasPaymentLink>('/paymentLinks', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  }
}

export interface CreatePaymentLinkDTO {
  name: string
  description?: string
  endDate: string
  value: number
  billingType: 'UNDEFINED' | 'CREDIT_CARD' | 'PIX' | 'BOLETO'
  chargeType: 'DETACHED' | 'INSTALLMENT' | 'RECURRENT'
  dueDateLimitDays?: number
  maxInstallmentCount?: number
  subscriptionCycle?: string | null
  notificationEnabled?: boolean
  callback?: {
    successUrl: string
    autoRedirect?: boolean
  }
  externalReference?: string
}

export interface AsaasPaymentLink {
  id: string
  name: string
  url: string
  value: number
  billingType: string
  chargeType: string
  status: string
}

export const asaasService = new AsaasServiceClass()
