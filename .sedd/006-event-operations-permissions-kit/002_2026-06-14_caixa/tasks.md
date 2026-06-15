# Tasks - Migration 002 (Fase 2: Caixa escopada + auditoria)

**Migration:** 002 · **Feature:** 006 · **Branch:** main · **Parent:** 001

## Summary
Total: 9 | Completed: 9 | Pending: 0

## Tasks
- [x] T002-001 [Domain] Inscription: campos `confirmadoPor`/`confirmadoPorNome`/`confirmadoEm` + getters; `confirmManually(by, nome)` registra-os; toJSON/fromPersistence.
- [x] T002-002 [Domain] BatchInscription: idem + `confirmCash(by, nome)`.
- [x] T002-003 [Infra] Persistência dos campos de auditoria (FirebaseInscriptionRepositoryAdmin, FirebaseBatchInscriptionRepositoryAdmin).
- [x] T002-004 [App] `allocateInscriptionPerk` (helper reusável) + `ConfirmInscriptionManually` aloca brinde na confirmação (paridade com lote/webhook) + `requireCash`.
- [x] T002-005 [App] `ConfirmBatchCashPayment`: `confirmedByNome` + `requireCash`.
- [x] T002-006 [API] `resolveActor` (uid+nome+isAdmin+hasPermission); rotas de confirmação (individual e lote) aceitam **admin OU `confirm-cash`** no evento; passam `requireCash=!isAdmin` e o nome.
- [x] T002-007 [DTO] `InscriptionWithDetails`/`AdminBatchListItem` expõem `confirmadoPorNome`/`confirmadoEm`.
- [x] T002-008 [UI] ConfirmModal e AdminBatchCard exibem "Confirmado por &lt;nome&gt;".
- [x] T002-009 [Test] ConfirmCashAudit.test.ts (caixa + brinde + auditoria + enforcement). tsc limpo; suíte sem regressão.

## Acceptance (resumo)
- Não-admin com `confirm-cash` confirma **só dinheiro** (individual + lote); backend rejeita não-CASH (403/400).
- Confirmar (admin ou equipe) **aloca o brinde** na hora.
- Painel admin mostra **quem confirmou** (nome) na inscrição e no lote.
- Admin segue confirmando qualquer pendente (PIX/CASH) como antes.
