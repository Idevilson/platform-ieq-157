/**
 * Feature 002 — Congresso Setorizado da Geração Forte
 *
 * TypeScript interfaces extraídas da spec.md.
 * Estes tipos são o contrato compartilhado entre frontend e backend
 * e devem ser movidos para src/shared/types/ na fase de implementação.
 */

// ────────────────────────────────────────────────────────────────────────────
// EventCategory (estendido)
// ────────────────────────────────────────────────────────────────────────────

export interface EventCategoryDTO {
  id: string;
  nome: string;
  /** Preço base em centavos (já existe) */
  valor: number;
  valorFormatado: string;
  descricao?: string;
  ordem?: number;

  // ─── Novos campos (Feature 002) ───
  /** Preço promocional em centavos (early bird). Se null, sem early bird. */
  earlyBirdValor?: number;
  earlyBirdValorFormatado?: string;
  /** ISO 8601. Após esta data, vale `valor`. */
  earlyBirdDeadline?: string;
  /** Lista de benefícios inclusos exibida no card (ex.: "Almoço", "Janta"). */
  beneficiosInclusos?: string[];
  /** Preço atual calculado pelo backend (já considerando data). */
  valorAtual: number;
  valorAtualFormatado: string;
  /** True se o preço atual ainda é o early bird. */
  earlyBirdAtivo: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// EventPerk (novo) — brinde com limite de estoque
// ────────────────────────────────────────────────────────────────────────────

export interface EventPerkDTO {
  id: string;
  eventId: string;
  nome: string;
  descricao: string;
  /** Estoque total (ex.: 500 pulseiras). */
  limiteEstoque: number;
  /** Quantidade já alocada (incrementada via webhook). */
  quantidadeAlocada: number;
  /** Quantidade ainda disponível. */
  quantidadeRestante: number;
  /** True se ainda há estoque disponível. */
  disponivel: boolean;
  /** Categoria associada (opcional — null = vale para qualquer categoria do evento). */
  categoriaId?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateEventPerkInput {
  eventId: string;
  nome: string;
  descricao: string;
  limiteEstoque: number;
  categoriaId?: string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Inscription (estendida com brinde)
// ────────────────────────────────────────────────────────────────────────────

export interface InscriptionDTO {
  id: string;
  eventId: string;
  categoryId: string;
  userId?: string;
  guestData?: {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
  };
  status: 'pendente' | 'confirmado' | 'cancelado';
  /** Valor pago (snapshot da categoria no momento da inscrição). */
  valor: number;
  criadoEm: string;
  atualizadoEm: string;

  // ─── Novos campos (Feature 002) ───
  /** True se esta inscrição tem direito ao brinde alocado. */
  temBrinde: boolean;
  /** ID do perk alocado (null se não tem brinde). */
  perkId?: string | null;
  /** Timestamp de quando o brinde foi alocado (atomicamente no webhook). */
  brindeAlocadoEm?: string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Payment (estendido com breakdown de taxa Asaas)
// ────────────────────────────────────────────────────────────────────────────

export type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD';

export interface PaymentBreakdownDTO {
  /** Valor base da inscrição (o que a igreja recebe líquido). */
  valorBase: number;
  valorBaseFormatado: string;
  /** Taxa do Asaas repassada ao cliente. */
  valorTaxa: number;
  valorTaxaFormatado: string;
  /** Total cobrado do cliente (= base + taxa). */
  valorTotal: number;
  valorTotalFormatado: string;
  /** Método usado para calcular a taxa. */
  metodo: PaymentMethod;
}

export interface PaymentDTO {
  id: string;
  inscriptionId: string;
  asaasPaymentId: string;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED';
  /** Breakdown obrigatório a partir desta feature. Pagamentos antigos têm null. */
  breakdown: PaymentBreakdownDTO | null;
  pixQrCode?: string;
  pixCopiaECola?: string;
  boletoUrl?: string;
  dueDate: string;
  criadoEm: string;
  atualizadoEm: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Endpoints
// ────────────────────────────────────────────────────────────────────────────

/** GET /api/events/{eventId}/perks (público) — para o contador na página */
export interface ListEventPerksResponse {
  perks: Array<{
    id: string;
    nome: string;
    quantidadeRestante: number;
    limiteEstoque: number;
    disponivel: boolean;
  }>;
}

/** POST /api/admin/events/{eventId}/perks (admin) */
export interface CreateEventPerkRequest {
  nome: string;
  descricao: string;
  limiteEstoque: number;
  categoriaId?: string | null;
}

/** GET /api/admin/events/{eventId}/perks (admin) — lista completa com alocações */
export interface AdminListEventPerksResponse {
  perks: EventPerkDTO[];
}

/** GET /api/admin/events/{eventId}/perks/{perkId}/holders — quem tem direito */
export interface ListPerkHoldersResponse {
  perkId: string;
  total: number;
  holders: Array<{
    inscriptionId: string;
    nome: string;
    cpf: string;
    email: string;
    alocadoEm: string;
  }>;
}

// ────────────────────────────────────────────────────────────────────────────
// Domain Service interfaces (para guiar implementação)
// ────────────────────────────────────────────────────────────────────────────

export interface IEventPerkRepository {
  save(perk: EventPerkDTO): Promise<void>;
  findById(eventId: string, perkId: string): Promise<EventPerkDTO | null>;
  findByEventId(eventId: string): Promise<EventPerkDTO[]>;
  /**
   * Aloca um perk a uma inscrição em uma única transaction.
   * Retorna true se alocou, false se estoque esgotado.
   * MUST ser idempotente: chamar 2x com mesmo inscriptionId não duplica.
   */
  allocateToInscription(
    eventId: string,
    perkId: string,
    inscriptionId: string,
  ): Promise<boolean>;
}

export interface IAsaasFeeCalculator {
  /**
   * Calcula o total a cobrar do cliente para que o líquido recebido seja
   * pelo menos `valorBase`.
   */
  calculateTotalForBase(
    valorBase: number,
    metodo: PaymentMethod,
  ): Promise<PaymentBreakdownDTO>;
}
