# Tasks - Migration 003 (Fase 3: Kit configurável + entrega)

**Migration:** 003 · **Feature:** 006 · **Branch:** main · **Parent:** 002

## Summary
Total: 12 | Completed: 12 | Pending: 0

## Tasks
- [x] T003-001 [Domain] Event: `kitItems` (config) + getter/setKitItems + toJSON; persistência no doc.
- [x] T003-002 [Domain] VO `KitDelivery` (upsert idempotente) + Inscription/BatchInscription com `kitDeliveries` + setKitDelivery + toJSON/fromPersistence.
- [x] T003-003 [Infra] Persistência de `kitDeliveries` (inscrição e lote) + `kitItems` (evento).
- [x] T003-004 [App] `ConfigureEventKit` (gera ids a partir do nome, normaliza acentos).
- [x] T003-005 [App] `MarkKitItemDelivered` (individual e lote coletivo; LED condicional ao brinde; só confirmados; idempotente; auditoria).
- [x] T003-006 [API] `PUT /events/[eventId]/kit` (admin). `POST .../inscriptions/[id]/kit` e `POST /batch-inscriptions/[id]/kit` (admin OU `deliver-kits` no evento).
- [x] T003-007 [DTO] EventDTO.kitItems; InscriptionWithDetails.kitDeliveries; AdminBatchListItem.kitDeliveries; BatchParticipantDTO.temBrinde (corrige descarte do brinde no lote).
- [x] T003-008 [UI] `KitDeliveryList` (toggle + auditoria "por <nome>" + LED bloqueado sem brinde).
- [x] T003-009 [UI] ConfirmModal (individual) e AdminBatchCard (coletivo) com entrega de kit; brinde por participante (🎁) no lote.
- [x] T003-010 [UI] `EventKitConfig` (editar itens do kit por evento) na página do evento.
- [x] T003-011 [App] adminService + hooks (configureEventKit, markInscriptionKit, markBatchKit).
- [x] T003-012 [Test] KitDelivery.test.ts (entrega, LED condicional, idempotência, config). tsc limpo; suíte sem regressão; lint limpo.

## Acceptance (resumo)
- Admin configura itens do kit por evento.
- Entrega registrada por inscrição (individual) e por lote (coletivo), só para confirmados.
- LED só entregável a quem ganhou o brinde.
- Painel mostra quem entregou (nome) e o brinde por participante no lote.
- Equipe com `deliver-kits` no evento pode entregar; admin também.
