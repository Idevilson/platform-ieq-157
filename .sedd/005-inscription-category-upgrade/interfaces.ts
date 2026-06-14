/**
 * Feature 005 — Upgrade de Categoria de Inscrição com Cobrança de Diferença
 *
 * Interfaces de contrato (rascunho). Tipos finais vivem no domínio/aplicação
 * conforme o Architecture Contract. Aqui documentamos as formas trocadas.
 */

import type { InscriptionPaymentMethod } from '@/shared/constants'

/* ────────────────────────── Domínio ────────────────────────── */

/** Estado de upgrade pendente embutido na Inscription (Value Object). */
export interface PendingUpgrade {
  targetCategoryId: string
  targetValorCents: number      // base da nova categoria avaliada em inscription.criadoEm
  diferencaBaseCents: number    // base, sem taxa (> 0)
  adjustmentPaymentId: string   // vínculo com o Payment tipo 'AJUSTE'
  metodo: InscriptionPaymentMethod
  criadoEm: Date
}

/** Discriminador do pagamento. Ausência (legado) == 'INSCRICAO'. */
export type PaymentTipo = 'INSCRICAO' | 'AJUSTE'

/** Métodos novos esperados na entidade Inscription. */
export interface InscriptionUpgradeMethods {
  get pendingUpgrade(): PendingUpgrade | undefined
  requestUpgrade(u: PendingUpgrade): void
  applyUpgrade(): void   // categoryId = target, valor = target, limpa pendingUpgrade
  cancelUpgrade(): void  // limpa pendingUpgrade sem trocar categoria
}

/* ────────────────────── Aplicação (Use Cases) ────────────────────── */

export interface RequestInscriptionUpgradeInput {
  eventId: string
  inscriptionId: string
  newCategoryId: string
  metodo: InscriptionPaymentMethod // PIX | CREDIT_CARD | CASH
}

export interface UpgradePreview {
  currentCategoryId: string
  currentCategoryNome: string
  newCategoryId: string
  newCategoryNome: string
  diferencaBaseCents: number
  diferencaBaseFormatado: string
  taxaCents: number
  totalCents: number          // diferença + taxa
  totalFormatado: string
  metodo: InscriptionPaymentMethod
  isDowngrade: boolean        // diferencaBase <= 0 → sem cobrança, aviso de estorno manual
}

export interface RequestInscriptionUpgradeOutput {
  preview: UpgradePreview
  payment?: {
    id: string
    asaasPaymentId: string
    status: string
    metodoPagamento: InscriptionPaymentMethod
    pixQrCode?: string
    pixCopiaECola?: string
    checkoutUrl?: string
    dataVencimento: string
  }
  pendingUpgrade?: PendingUpgrade
}

export interface ConfirmUpgradeCashPaymentInput {
  eventId: string
  inscriptionId: string
  confirmedBy: string // adminId
}

export interface CancelInscriptionUpgradeInput {
  eventId: string
  inscriptionId: string
}

/* ───────────────────────── Webhook ───────────────────────── */

/** externalReference de ajuste: `eventId:adjustment:inscriptionId`. */
export interface AdjustmentReference {
  eventId: string
  inscriptionId: string
}

/* ───────────────────────── API / SSE ───────────────────────── */

// GET  /api/admin/events/[eventId]/inscriptions/[inscriptionId]/upgrade/preview?newCategoryId&metodo
// POST /api/admin/events/[eventId]/inscriptions/[inscriptionId]/upgrade
// POST /api/admin/events/[eventId]/inscriptions/[inscriptionId]/upgrade/confirm-cash
// POST /api/admin/events/[eventId]/inscriptions/[inscriptionId]/upgrade/cancel
// GET  /api/admin/events/[eventId]/inscriptions/[inscriptionId]/upgrade/status-stream?adjustmentPaymentId&token

/** Estado empurrado pelo SSE dedicado de upgrade. */
export interface UpgradeSSEState {
  connected: boolean
  payment: {
    id: string
    status: string // PENDING | RECEIVED | CONFIRMED | ...
    metodoPagamento: InscriptionPaymentMethod
    pixQrCode?: string
    pixCopiaECola?: string
    checkoutUrl?: string
    valorFormatado?: string
  } | null
  pendingUpgrade: PendingUpgrade | null // null após applyUpgrade (= confirmado)
  isPaid: boolean
  isApplied: boolean // pendingUpgrade limpo e categoria trocada
}

/* ─────────────── Consulta pública por CPF (não-regressão) ─────────────── */

/** Acrescido ao InscriptionWithEvent de LookupInscriptionByCPF. */
export interface PublicLookupUpgradeNotice {
  hasPendingUpgrade: boolean
  fromCategoryNome?: string
  toCategoryNome?: string
  supportWhatsapp?: string // whatsappContato do evento
}
