# Implementation Progress — 005 Inscription Category Upgrade

## Summary
| Migration | Total | Done | Progress |
|-----------|-------|------|----------|
| 001 | 25 | 22 | 88% |

## Current Task
Restam: T001-022 (aviso "contate suporte" na consulta pública), T001-023 (filtro AJUSTE
no SSE do participante + teste receita), T001-024 (validação final).

## API + UI concluídas
- Rotas: GET preview, POST upgrade, confirm-cash, cancel, status-stream (SSE com token na query).
- adminService: getUpgradePreview/requestInscriptionUpgrade/cancel/confirmCash.
- Hooks: useInscriptionUpgrade (mutations) + useUpgradeSSE.
- InscriptionWithDetails expõe pendingUpgrade (ListEventInscriptions + adminService).
- ConfirmModal: seção "Trocar categoria / cobrar diferença" (InscriptionUpgradeSection) com
  preview ao vivo + bloco "Upgrade pendente" (Abrir cobrança / Cancelar).
- Página dedicada /eventos/[id]/inscricoes/[inscriptionId]/upgrade (admin-only) com SSE.

## Notas de ambiente
- ⚠️ `vitest` exige Node **20.19+ ou 22.12+** (vitest 4 / rolldown). O Node 21.7.3
  do shell padrão NÃO funciona (npm pula o binding nativo opcional por engine
  incompatível). Rodar com `PATH="$HOME/.nvm/versions/node/v23.11.1/bin:$PATH"`.
  Recomendado: criar `.nvmrc` com `23` (ou usar Node 22 LTS).
- ✅ Testes da feature rodando com Node 23: **23/23 passam** (domínio + aplicação).
  Falhas restantes da suíte (14) são pré-existentes em testes legados não tocados.

## Task Log

### Migration 001 (In Progress)
- [x] T001-001 [→] PendingUpgrade VO
- [x] T001-002 [→] Inscription: pendingUpgrade + requestUpgrade/applyUpgrade/cancelUpgrade (categoryId/valor privados+getter)
- [x] T001-003 [→] Payment.tipo (INSCRICAO|AJUSTE, default INSCRICAO)
- [x] T001-004 [→] Repos persistem pendingUpgrade (inscrição) e tipo (pagamento)
- [x] T001-005 [→] findByInscriptionId ignora AJUSTE (legado=primário)
- [x] T001-006 [→] Testes de domínio (InscriptionUpgrade.test.ts) — 13/13 ✅
- [x] T001-007 [→] computeUpgradePreview (helper puro)
- [x] T001-008 [→] RequestInscriptionUpgrade (+asaasCustomerData compartilhado)
- [x] T001-009 [→] Webhook branch adjustment (applyUpgrade, sem brinde, idempotente)
- [x] T001-010 [→] ConfirmUpgradeCashPayment
- [x] T001-011 [→] CancelInscriptionUpgrade
- [x] T001-012 [→] Testes aplicação+webhook (InscriptionUpgrade.usecases.test.ts) — 10/10 ✅
- [x] T001-025 [→] findAllByInscriptionId + DeleteInscription limpa todos os pagamentos
- [ ] T001-007 Helper computeUpgradePreview
- [ ] T001-008 RequestInscriptionUpgrade
- [ ] T001-009 Webhook branch adjustment
- [ ] T001-010 ConfirmUpgradeCashPayment
- [ ] T001-011 CancelInscriptionUpgrade
- [ ] T001-012 Testes use cases + webhook
- [ ] T001-013 GET upgrade/preview
- [ ] T001-014 POST upgrade
- [ ] T001-015 POST upgrade/confirm-cash
- [ ] T001-016 POST upgrade/cancel
- [ ] T001-017 GET upgrade/status-stream (SSE)
- [ ] T001-018 useUpgradeSSE + mutations
- [ ] T001-019 ConfirmModal seção trocar categoria
- [ ] T001-020 Badge upgrade pendente + InscriptionWithDetails
- [ ] T001-021 Página dedicada
- [ ] T001-022 Consulta pública: aviso contate suporte
- [ ] T001-023 status-stream participante filtra AJUSTE + teste receita
- [ ] T001-024 Validação npm test && lint
