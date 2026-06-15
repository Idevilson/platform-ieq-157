/**
 * Feature 006 — Operação do Evento: Permissões + Entrega de Kit + Caixa
 * Contratos de rascunho. Tipos finais vivem no domínio/aplicação conforme o
 * Architecture Contract.
 */

import type { ShirtSize } from '@/shared/constants'

/* ───────────────────────── Permissões ───────────────────────── */

/** Item do catálogo de permissões (gerenciável pelo admin). */
export interface PermissionDef {
  key: string            // ex.: 'deliver-kits', 'confirm-cash', 'adm-q4-news'
  label: string
  description?: string
  system: boolean        // true = reconhecida/aplicada pelo código
}

/** Atribuição escopada no usuário. eventIds ['*'] = global. */
export interface UserPermissionGrant {
  key: string
  eventIds: string[]     // ['*'] = todos os eventos
}

/** Permissões de sistema reconhecidas pelo código. */
export type SystemPermissionKey = 'deliver-kits' | 'confirm-cash' | 'adm-q4-news'

/** Assinatura nova (sobrecarga aditiva) de checagem. */
export interface PermissionCheck {
  hasPermission(key: string, eventId?: string): boolean // admin => true; eventId ausente = global
}

/* ───────────────────────── Kit ───────────────────────── */

export interface KitItemDef {
  id: string
  nome: string
  condicionalAoBrinde?: boolean // LED: só entrega se temBrinde === true
  porTamanho?: boolean          // item depende do tamanho (camiseta/garrafa)
}

/** Registro de entrega de um item, por inscrição ou participante de lote. */
export interface KitDelivery {
  itemId: string
  entregue: boolean
  entreguePor?: string  // userId
  entregueEm?: string   // ISO
}

/* ─────────────────── Auditoria (DTOs admin) ─────────────────── */

export interface ConfirmationAudit {
  confirmadoPor?: string      // userId
  confirmadoPorNome?: string  // resolvido para exibição
  confirmadoEm?: string       // ISO
}

export interface DeliveryAuditView extends KitDelivery {
  entreguePorNome?: string    // resolvido para exibição
}

/* ─────────────────── Aplicação (Use Cases) ─────────────────── */

export interface AssignPermissionInput {
  targetUserId: string
  key: string
  eventIds: string[] // ['*'] = global
}

export interface MarkKitItemDeliveredInput {
  eventId: string
  // Individual: por inscrição. Lote: COLETIVO (no nível do lote), não por participante.
  target: { kind: 'inscription'; inscriptionId: string }
        | { kind: 'batch'; batchId: string }
  itemId: string
  entregue: boolean
  actorUserId: string // quem está entregando (auditoria + checagem de permissão)
}

export interface ConfirmCashScopedInput {
  eventId: string
  target: { kind: 'inscription'; inscriptionId: string }
        | { kind: 'batch'; batchId: string }
  actorUserId: string
}

/* ─────────────────── DTOs enriquecidos ─────────────────── */

/** Acrescido a InscriptionWithDetails. */
export interface InscriptionOpsExtras extends ConfirmationAudit {
  kitDeliveries?: DeliveryAuditView[]
}

/** Participante de lote passa a EXIBIR o brinde (read-only). Entrega NÃO é por participante. */
export interface BatchParticipantOpsDTO {
  nome: string
  sexo: string
  tamanho?: ShirtSize
  temBrinde?: boolean        // CORREÇÃO: hoje é descartado (apenas exibição)
  perkId?: string
}

/** Entrega do kit no LOTE é coletiva (um registro por item para o lote inteiro). */
export interface BatchOpsExtras extends ConfirmationAudit {
  brindeCount?: number             // quantos participantes ganharam a LED (exibição)
  kitDeliveries?: DeliveryAuditView[] // por itemId, no nível do lote
}

/** Permissões expostas ao front via /auth/me. */
export interface AuthMePermissions {
  isAdmin: boolean
  permissions: UserPermissionGrant[]
}
