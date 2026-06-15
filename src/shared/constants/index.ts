// Shared constants and enums - used by both frontend and backend

// Gender
export type Gender = 'masculino' | 'feminino'

export const GENDERS: readonly Gender[] = ['masculino', 'feminino'] as const

export const GENDER_LABELS: Record<Gender, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
}

// User roles
export type UserRole = 'user' | 'admin'

export const USER_ROLES: readonly UserRole[] = ['user', 'admin'] as const

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  user: 'Usuário',
  admin: 'Administrador',
}

// Event status
export type EventStatus = 'rascunho' | 'aberto' | 'fechado' | 'encerrado' | 'cancelado'

export const EVENT_STATUSES: readonly EventStatus[] = [
  'rascunho',
  'aberto',
  'fechado',
  'encerrado',
  'cancelado',
] as const

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  rascunho: 'Rascunho',
  aberto: 'Inscrições Abertas',
  fechado: 'Inscrições Encerradas',
  encerrado: 'Evento Encerrado',
  cancelado: 'Evento Cancelado',
}

// Inscription status
export type InscriptionStatus = 'pendente' | 'confirmado' | 'cancelado'

export const INSCRIPTION_STATUSES: readonly InscriptionStatus[] = [
  'pendente',
  'confirmado',
  'cancelado',
] as const

export const INSCRIPTION_STATUS_LABELS: Record<InscriptionStatus, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
}

// Payment status (Asaas statuses)
export type PaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'CANCELLED'

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'PENDING',
  'RECEIVED',
  'CONFIRMED',
  'OVERDUE',
  'REFUNDED',
  'CANCELLED',
] as const

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Aguardando Pagamento',
  RECEIVED: 'Pagamento Recebido',
  CONFIRMED: 'Pagamento Confirmado',
  OVERDUE: 'Vencido',
  REFUNDED: 'Reembolsado',
  CANCELLED: 'Cancelado',
}

// Payment method
export type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'CASH'

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'PIX',
  'BOLETO',
  'CREDIT_CARD',
  'CASH',
] as const

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro em espécie',
}

// Payment methods available for event inscription
export type InscriptionPaymentMethod = 'PIX' | 'CREDIT_CARD' | 'CASH'

export const INSCRIPTION_PAYMENT_METHODS: readonly InscriptionPaymentMethod[] = [
  'PIX',
  'CREDIT_CARD',
  'CASH',
] as const

export const INSCRIPTION_PAYMENT_METHOD_LABELS: Record<InscriptionPaymentMethod, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro em espécie',
}

// News post status
export type NewsStatus = 'rascunho' | 'publicado'

export const NEWS_STATUSES: readonly NewsStatus[] = ['rascunho', 'publicado'] as const

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
}

// Shirt sizes
export type ShirtSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG'

export const SHIRT_SIZES: readonly ShirtSize[] = ['PP', 'P', 'M', 'G', 'GG', 'XGG'] as const

// Permissions
export const Q4_NEWS_PERMISSION = 'adm-q4-news'
export const DELIVER_KITS_PERMISSION = 'deliver-kits'
export const CONFIRM_CASH_PERMISSION = 'confirm-cash'

export const GLOBAL_PERMISSION_SCOPE = '*'

export const SYSTEM_PERMISSIONS: readonly { key: string; label: string; description: string }[] = [
  { key: Q4_NEWS_PERMISSION, label: 'Gerenciar Q4-News', description: 'Acesso ao módulo Q4-News' },
  { key: DELIVER_KITS_PERMISSION, label: 'Entregar kits', description: 'Registrar entrega de itens do kit nos eventos do escopo' },
  { key: CONFIRM_CASH_PERMISSION, label: 'Confirmar dinheiro', description: 'Confirmar pagamentos em dinheiro nos eventos do escopo' },
] as const

export const EVENT_OPS_PERMISSIONS: readonly string[] = [DELIVER_KITS_PERMISSION, CONFIRM_CASH_PERMISSION] as const

export interface UserPermissionGrant {
  key: string
  eventIds: string[] // ['*'] = global
}

export interface KitItemDef {
  id: string
  nome: string
  condicionalAoBrinde?: boolean
  porTamanho?: boolean
}

export interface KitDeliveryDTO {
  itemId: string
  entregue: boolean
  entreguePor?: string
  entreguePorNome?: string
  entregueEm?: string
}

// Audit log (registros de operação)
export type AuditLogType = 'cash_confirm' | 'kit_delivery'
export type AuditLogTargetKind = 'inscription' | 'batch'

export interface AuditLogDTO {
  id: string
  type: AuditLogType
  actorId: string
  actorNome: string
  eventId: string
  eventTitulo?: string
  targetKind: AuditLogTargetKind
  targetId: string
  targetNome: string
  targetCpf?: string
  totalParticipantes?: number
  comLed?: boolean
  criadoEm: string
}
