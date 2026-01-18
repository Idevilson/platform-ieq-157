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
  CASH: 'Dinheiro',
}

// Payment methods available for event inscription
export type InscriptionPaymentMethod = 'PIX' | 'CASH'

export const INSCRIPTION_PAYMENT_METHODS: readonly InscriptionPaymentMethod[] = [
  'PIX',
  'CASH',
] as const

export const INSCRIPTION_PAYMENT_METHOD_LABELS: Record<InscriptionPaymentMethod, string> = {
  PIX: 'PIX',
  CASH: 'Dinheiro',
}
