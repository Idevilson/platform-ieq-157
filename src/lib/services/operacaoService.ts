import { firebaseAuthService } from '@/lib/firebase'
import { InscriptionWithDetails } from './adminService'
import { KitItemDef, InscriptionPaymentMethod, KitDeliveryDTO, Gender, ShirtSize } from '@/shared/constants'
import { EventCategoryDTO } from '@/shared/types/event'

async function authFetch<T>(endpoint: string): Promise<T> {
  const token = await firebaseAuthService.getIdToken()
  if (!token) throw new Error('Não autenticado')
  const response = await fetch(`/api${endpoint}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `Erro: ${response.status}`)
  return data as T
}

export interface OperableEvent {
  id: string
  titulo: string
  status: string
  kitItems: KitItemDef[]
}

export interface OpsBatch {
  id: string
  categoryId: string
  responsavelNome: string
  responsavelCpf?: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  preferredPaymentMethod: InscriptionPaymentMethod
  totalParticipantes: number
  kitDeliveries?: KitDeliveryDTO[]
  confirmadoPorNome?: string
  participantes: { nome: string; sexo: Gender; tamanho?: ShirtSize; temBrinde?: boolean }[]
}

export interface OpsLookupResult {
  mode: 'search' | 'worklist'
  kitConfigured: boolean
  kitItems: KitItemDef[]
  categorias: EventCategoryDTO[]
  counts: { cashPending: number; kitPending: number }
  kitPendingCapped: boolean
  inscriptions: InscriptionWithDetails[]
  batches: OpsBatch[]
}

export const operacaoService = {
  async listEvents(): Promise<OperableEvent[]> {
    const data = await authFetch<{ events: OperableEvent[] }>('/operacao/events')
    return data.events
  },

  async lookup(eventId: string, query: string): Promise<OpsLookupResult> {
    return authFetch<OpsLookupResult>(`/operacao/events/${eventId}/lookup?q=${encodeURIComponent(query)}`)
  },
}
