# Tasks - Migration 004 (Fase 4: Área "Operação do Evento")

**Migration:** 004 · **Feature:** 006 · **Branch:** main · **Parent:** 003

## Summary
Total: 6 | Completed: 6 | Pending: 0

## Tasks
- [x] T004-001 [API] `operacao/_shared` (resolveActor + canOperate por evento) reusando ListEvents/ListEventInscriptions.
- [x] T004-002 [API] `GET /api/operacao/events` → eventos que o ator pode operar (admin = todos; escopado = grants).
- [x] T004-003 [API] `GET /api/operacao/events/[eventId]/lookup?q=` → busca inscrições + lotes por nome/CPF (gated por permissão no evento).
- [x] T004-004 [App] `operacaoService` (apiClient, token) + `adminService.confirmBatchCash` (rota já permission-gated).
- [x] T004-005 [UI] Página `/minha-conta/operacao` gated por permissão (admin + equipe): seleciona evento → busca → entrega kit + confirma dinheiro (reusa KitDeliveryList e os serviços).
- [x] T004-006 [UI] Link "Operação" no menu da conta (visível a admin e a quem tem permissão de operação).

## Acceptance (resumo)
- Admin e usuários com `deliver-kits`/`confirm-cash` acessam a área (escopada aos eventos deles).
- Busca por CPF/nome → marca entrega de kit e confirma dinheiro, com as mesmas regras/auditoria das fases 2–3.
- Não-admin não vê o painel admin completo.
