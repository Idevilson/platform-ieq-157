# Decisions - Migration 001

## D001-001: Upgrade é estado PENDENTE (categoria muda só após pagamento)
**Source:** Requisito do usuário + RB5.
**Decision:** `RequestInscriptionUpgrade` cria `inscription.pendingUpgrade` + `Payment`
`tipo:'AJUSTE'` (PENDING). `applyUpgrade()` (troca `categoryId`/`valor`, limpa
`pendingUpgrade`) só roda na confirmação (webhook PIX/cartão ou confirm-cash do admin).
**Impact:** Inscription ganha `pendingUpgrade` + métodos; webhook ganha branch.

## D001-002: Discriminador `Payment.tipo` ('INSCRICAO' | 'AJUSTE')
**Source:** GNR1 (não-regressão da consulta pública).
**Decision:** Campo opcional, default `INSCRICAO`. Ausência (legado) == `INSCRICAO`.
`findByInscriptionId` filtra `AJUSTE` **em memória**; `AJUSTE` só via `findByAsaasPaymentId`.
**Impact:** Payment entity + mappers; FirebasePaymentRepositoryAdmin.findByInscriptionId.

## D001-003: externalReference de ajuste = `eventId:adjustment:inscriptionId`
**Source:** Roteamento do webhook.
**Decision:** Branch novo no `ProcessAsaasWebhook` detecta `:adjustment:`, acha o pagamento
por `asaasPaymentId`, confirma (idempotente) e `applyUpgrade` (verifica
`pendingUpgrade.adjustmentPaymentId === payment.id`). Não mexe em brinde.
**Impact:** ProcessAsaasWebhook.

## D001-004: Cálculo da diferença (base por data, taxa por cima)
**Source:** Regra do usuário.
**Decision:** `diferencaBase = novaCategoria.getCurrentPrice(inscription.criadoEm).getCents()
− inscription.valorCents`. `breakdown = feeCalculator.calculateBreakdown(diferencaBase,
metodo)`. Cobra `diferencaBase + taxa`. Só upgrade (`diferencaBase > 0`).
**Impact:** RequestInscriptionUpgrade + preview.

## D001-005: Downgrade → troca categoria sem cobrança + aviso de estorno manual
**Source:** Escolha do usuário (sem refund automático).
**Decision:** `diferencaBase <= 0`: aplica troca de categoria imediatamente (sem
`pendingUpgrade`, sem cobrança) e retorna aviso "valor pago a mais — estorno manual via
Asaas". Refund automático fora de escopo.
**Impact:** RequestInscriptionUpgrade (ramo downgrade).

## D001-006: Página dedicada admin-only em nova aba + SSE
**Source:** Requisito do usuário.
**Decision:** `/minha-conta/admin/eventos/[id]/inscricoes/[inscriptionId]/upgrade`
(gated por `admin/layout`). ConfirmModal faz `window.open(..., '_blank')`. Estado por
`useUpgradeSSE` (espelha `useInscriptionSSE`). SSE mantido como padrão de comunicação.
**Impact:** Página nova, hook novo, rota SSE nova, ConfirmModal.

## D001-007: Auth do SSE via Firebase ID token em query param
**Source:** Q2.
**Decision:** Rota `upgrade/status-stream` recebe `token` na query e valida com
`verifyAdmin` (adminAuth.verifyIdToken + isAdmin) antes de abrir o stream.
**Impact:** Rota SSE de upgrade.

## D001-008: Vencimento +3 dias (padrão)
**Source:** Q3. Reusa `calculateDueDate()`.

## D001-009: Confirmação de dinheiro registra `confirmedBy = adminId`
**Source:** Q4. `ConfirmUpgradeCashPayment` grava o adminId (padrão `confirmManually`).

## D001-010: Contato de suporte = `whatsappContato` do evento
**Source:** Q1. Consulta pública expõe `pendingUpgrade` + WhatsApp do evento.

## D001-011: Receita inalterada no código (reflete via inscription.valor)
**Source:** GNR4. `applyUpgrade` atualiza `inscription.valor`; card e relatório já somam
`inscription.valor` de confirmadas. Nenhuma mudança no código de receita.

## D001-012: Idempotência / não-duplicação
**Source:** Note 003. Rerequisição com `pendingUpgrade` ativo regenera a cobrança (cancela a
antiga no Asaas). Webhook idempotente (checa `isConfirmed`/`pendingUpgrade` já aplicado).
