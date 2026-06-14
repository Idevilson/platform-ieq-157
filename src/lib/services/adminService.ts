import { firebaseAuthService } from '@/lib/firebase'
import { EventDTO } from '@/shared/types'
import { EventStatus, InscriptionStatus, InscriptionPaymentMethod } from '@/shared/constants'

const API_BASE_URL = '/api/admin'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface EventWithStats extends EventDTO {
  stats: {
    total: number
    confirmado: number
    pendente: number
  }
}

export interface AdminEventListResponse {
  events: EventWithStats[]
  total: number
  limit: number
  offset: number
}

export interface InscriptionWithDetails {
  id: string
  eventId: string
  eventTitulo: string
  categoryId: string
  categoryNome: string
  categoryValor: number
  nome: string
  email: string
  cpf: string
  telefone: string
  status: InscriptionStatus
  statusLabel: string
  valor: number
  valorFormatado: string
  cidade?: string
  paymentId?: string
  preferredPaymentMethod: InscriptionPaymentMethod
  tamanho?: string
  temBrinde?: boolean | null
  perkId?: string
  brindeAlocadoEm?: string
  pendingUpgrade?: PendingUpgradeDetails
  criadoEm: string
  atualizadoEm: string
}

export interface PendingUpgradeDetails {
  targetCategoryId: string
  targetCategoryNome: string
  targetValorCents: number
  diferencaBaseCents: number
  adjustmentPaymentId: string
  metodo: InscriptionPaymentMethod
}

export interface AdminInscriptionListResponse {
  inscriptions: InscriptionWithDetails[]
  total: number
  limit: number
  offset: number
}

export interface CreateEventInput {
  slug?: string
  titulo: string
  subtitulo?: string
  descricao: string
  descricaoCompleta?: string
  dataInicio: string
  dataFim?: string
  local: string
  endereco: string
  googleMapsUrl?: string
  whatsappContato?: string
  metodosPagamento?: string[]
  imagemUrl?: string
  categorias?: {
    nome: string
    valor: number
    descricao?: string
    earlyBirdValor?: number
    earlyBirdDeadline?: string
    beneficiosInclusos?: string[]
  }[]
}

export interface CreateEventResponse {
  id: string
  titulo: string
  status: string
  categorias: number
}

export interface UpdateEventStatusResponse {
  id: string
  titulo: string
  status: string
  statusLabel: string
}

export interface ConfirmInscriptionResponse {
  success: boolean
  inscription: {
    id: string
    status: string
    paymentId?: string
  }
}

export interface RegenerateInscriptionPaymentResponse {
  payment: {
    id: string
    status: string
    pixQrCode?: string
    pixCopiaECola?: string
    checkoutUrl?: string
  }
}

export interface UpgradePreviewDTO {
  currentCategoryId: string
  newCategoryId: string
  newCategoryNome: string
  targetValorCents: number
  diferencaBaseCents: number
  diferencaBaseFormatado: string
  taxaCents: number
  totalCents: number
  totalFormatado: string
  metodo: InscriptionPaymentMethod
  isDowngrade: boolean
}

export interface RequestUpgradeResponse {
  preview: UpgradePreviewDTO
  payment?: {
    id: string
    asaasPaymentId: string
    status: string
    metodoPagamento: InscriptionPaymentMethod
    pixQrCode?: string
    pixCopiaECola?: string
    checkoutUrl?: string
  }
  pendingUpgrade?: {
    adjustmentPaymentId: string
    targetCategoryId: string
    metodo: InscriptionPaymentMethod
  }
}

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) {
    return { success: false, error: 'Não autenticado' }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || `Erro: ${response.status}` }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de rede',
    }
  }
}

export const adminService = {
  async listEvents(params?: {
    status?: EventStatus
    limit?: number
    offset?: number
  }): Promise<AdminEventListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    const endpoint = `/events${query ? `?${query}` : ''}`

    const response = await authFetch<AdminEventListResponse>(endpoint)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao carregar eventos')
  },

  async listEventInscriptions(
    eventId: string,
    params?: {
      status?: InscriptionStatus
      limit?: number
      offset?: number
    }
  ): Promise<AdminInscriptionListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const query = searchParams.toString()
    const endpoint = `/events/${eventId}/inscriptions${query ? `?${query}` : ''}`

    const response = await authFetch<AdminInscriptionListResponse>(endpoint)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao carregar inscrições')
  },

  async createEvent(input: CreateEventInput): Promise<CreateEventResponse> {
    const response = await authFetch<CreateEventResponse>('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    })

    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao criar evento')
  },

  async changeEventSlug(eventId: string, newSlug: string): Promise<{ id: string; oldId: string }> {
    const response = await authFetch<{ id: string; oldId: string }>(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify({ newSlug }),
    })

    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao alterar slug do evento')
  },

  async updateEventStatus(eventId: string, status: EventStatus): Promise<UpdateEventStatusResponse> {
    const response = await authFetch<UpdateEventStatusResponse>(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })

    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao atualizar status do evento')
  },

  async deleteInscription(eventId: string, inscriptionId: string): Promise<{ inscriptionDeleted: boolean; paymentCancelled: boolean; asaasPaymentCancelled: boolean }> {
    const response = await authFetch<{ inscriptionDeleted: boolean; paymentCancelled: boolean; asaasPaymentCancelled: boolean }>(`/events/${eventId}/inscriptions/${inscriptionId}`, {
      method: 'DELETE',
    })
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao excluir inscrição')
  },

  async regenerateInscriptionPayment(eventId: string, inscriptionId: string): Promise<RegenerateInscriptionPaymentResponse> {
    const response = await authFetch<RegenerateInscriptionPaymentResponse>(`/events/${eventId}/inscriptions/${inscriptionId}/regenerate-payment`, {
      method: 'POST',
    })
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao regerar pagamento')
  },

  async getUpgradePreview(
    eventId: string,
    inscriptionId: string,
    newCategoryId: string,
    metodo: InscriptionPaymentMethod,
  ): Promise<UpgradePreviewDTO> {
    const qs = new URLSearchParams({ newCategoryId, metodo })
    const response = await authFetch<{ preview: UpgradePreviewDTO }>(
      `/events/${eventId}/inscriptions/${inscriptionId}/upgrade?${qs.toString()}`,
    )
    if (response.success && response.data) return response.data.preview
    throw new Error(response.error || 'Erro ao calcular o upgrade')
  },

  async requestInscriptionUpgrade(
    eventId: string,
    inscriptionId: string,
    newCategoryId: string,
    metodo: InscriptionPaymentMethod,
  ): Promise<RequestUpgradeResponse> {
    const response = await authFetch<RequestUpgradeResponse>(
      `/events/${eventId}/inscriptions/${inscriptionId}/upgrade`,
      { method: 'POST', body: JSON.stringify({ newCategoryId, metodo }) },
    )
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao gerar o upgrade')
  },

  async cancelInscriptionUpgrade(eventId: string, inscriptionId: string): Promise<{ success: boolean }> {
    const response = await authFetch<{ success: boolean }>(
      `/events/${eventId}/inscriptions/${inscriptionId}/upgrade/cancel`,
      { method: 'POST' },
    )
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao cancelar o upgrade')
  },

  async confirmUpgradeCash(eventId: string, inscriptionId: string): Promise<{ success: boolean; newCategoryId: string }> {
    const response = await authFetch<{ success: boolean; newCategoryId: string }>(
      `/events/${eventId}/inscriptions/${inscriptionId}/upgrade/confirm-cash`,
      { method: 'POST' },
    )
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao confirmar pagamento em dinheiro')
  },

  async changeInscriptionPaymentMethod(
    eventId: string,
    inscriptionId: string,
    metodo: InscriptionPaymentMethod,
  ): Promise<{ preferredPaymentMethod: InscriptionPaymentMethod; payment: RegenerateInscriptionPaymentResponse['payment'] | null }> {
    const response = await authFetch<{ preferredPaymentMethod: InscriptionPaymentMethod; payment: RegenerateInscriptionPaymentResponse['payment'] | null }>(
      `/events/${eventId}/inscriptions/${inscriptionId}/change-payment-method`,
      { method: 'POST', body: JSON.stringify({ metodo }) },
    )
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao trocar o meio de pagamento')
  },

  async confirmInscription(inscriptionId: string, eventId: string): Promise<ConfirmInscriptionResponse> {
    const response = await authFetch<ConfirmInscriptionResponse>(`/inscriptions/${inscriptionId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    })

    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Erro ao confirmar inscrição')
  },

  async listNewsPosts(params?: { status?: string; limit?: number; offset?: number }): Promise<{ items: unknown[]; total: number }> {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    const query = searchParams.toString()
    const response = await authFetch<{ items?: unknown[]; posts?: unknown[]; total?: number }>(`/q4news${query ? `?${query}` : ''}`)
    if (response.success && response.data) {
      const items = response.data.items ?? response.data.posts ?? []
      return { items, total: response.data.total ?? items.length }
    }
    throw new Error(response.error || 'Erro ao carregar noticias')
  },

  async createNewsPost(input: { slug?: string; titulo: string; descricao: string; conteudo: string; youtubeUrl: string; status?: string }): Promise<{ id: string; titulo: string; status: string }> {
    const response = await authFetch<{ id: string; titulo: string; status: string }>('/q4news', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao criar noticia')
  },

  async updateNewsPost(newsId: string, input: { titulo?: string; descricao?: string; conteudo?: string; youtubeUrl?: string; status?: string }): Promise<{ id: string; titulo: string; status: string }> {
    const response = await authFetch<{ id: string; titulo: string; status: string }>(`/q4news/${newsId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao atualizar noticia')
  },

  async deleteNewsPost(newsId: string): Promise<void> {
    const response = await authFetch<{ success: boolean }>(`/q4news/${newsId}`, {
      method: 'DELETE',
    })
    if (!response.success) throw new Error(response.error || 'Erro ao deletar noticia')
  },

  async sendDailyReport(options?: { eventId?: string; dryRun?: boolean }): Promise<SendDailyReportResponse> {
    const params = new URLSearchParams()
    if (options?.eventId) params.set('eventId', options.eventId)
    if (options?.dryRun) params.set('dryRun', 'true')
    const query = params.toString()
    const endpoint = `/cron/daily-report${query ? `?${query}` : ''}`

    const response = await authFetch<SendDailyReportResponse>(endpoint, { method: 'POST' })
    if (response.success && response.data) return response.data
    throw new Error(response.error || 'Erro ao enviar relatório')
  },
}

export interface SendDailyReportResponse {
  ok: boolean
  role: 'cron' | 'admin'
  skipped?: 'event-ended'
  dryRun?: boolean
  preview?: string
  stats?: {
    date: string
    eventTitle: string
    total: number
    confirmadas: number
    pendentes: number
    receita: number
    novasHoje: number
    receitaHoje: number
    redencao: number
    fora: number
    perkLimite?: number
    perkRestante?: number
  }
  sent?: { messageId: string; status: string; remoteJid: string }
}
