# Changelog — 006 Event Operations: Permissions + Kit + Cash

## [2026-06-14] - Feature Created

- Spec inicial com Expectation no topo (branch: main, sem branch nova).
- 6 user stories; 6 regras de negócio; 5 garantias de não-regressão.
- Architecture Contract (permissão escopada por evento, permissões de sistema vs custom,
  caixa só-CASH para não-admin, LED condicional, auditoria com nome, sem custom claims).
- interfaces.ts (catálogo de permissões, grant escopado, kit item/entrega, auditoria, DTOs).
- 2 mockups: admin de permissões/usuários; área "Operação do Evento" + auditoria.
- 6 Open Questions [NEEDS_CLARIFICATION].
- 4 fases sugeridas (permissões → caixa escopada → kit/entrega → área dedicada).

## [2026-06-14] - Migration 001 (clarify — Fase 1: Permissões)

- Auditoria de gaps consolidada (G1/G2/G5 resolvidos; mecânicos viram tasks).
- 6 decisões (D001-001..006): permissões escopadas por evento, sistema vs custom, /auth/me
  expõe permissões, useRequirePermission, telas admin-only, retrocompat sem migração destrutiva.
- 15 tasks (domínio → aplicação → API → UI → validação) cobrindo só a Fase 1.
- 8 critérios de aceite (acceptance.md).
- Migração 001 in-progress. Fases 2–4 virão como migrações 002–004.

## [2026-06-14] - Migration 001 implementada (Fase 1: Permissões)

- 18/18 tasks concluídas. Estilo: early return, idempotência, sem comentários inúteis.
- Domínio: PermissionDef + User com permissões escopadas por evento (hasPermission(key,eventId),
  grant/revoke/setPermissions, permissionIndex), retrocompat (string legada = global).
- Infra: FirebasePermissionRepositoryAdmin (coleção permissions), FirebaseUserRepositoryAdmin
  (grants + permissionIndex, list, findByPermissionIndexAny); /auth/me + UserDTO expõem permissions.
- Criação do catálogo pela própria plataforma (sem script): coleção nasce no 1º write da tela
  Permissões; CreatePermission marca system=true para chaves de sistema (protege exclusão).
- Aplicação: catálogo (List/Create/Update/Delete), ListUsers/SetUserPermissions, ListEventTeam.
- API admin: /permissions (+[key]), /users (+[userId]/permissions), /events/[eventId]/team.
- UI: useAuth expõe permissions + useRequirePermission; telas Permissões, Usuários (atribuir por
  evento) e Time do evento; nav admin.
- Validação: tsc limpo; 17 testes da feature passam; suíte 110 pass / 14 fail (pré-existentes);
  lint dos arquivos novos limpo.
- Catálogo: criar as permissões pela tela "Permissões" (usar chaves `deliver-kits` e
  `confirm-cash` para terem efeito; são marcadas como sistema automaticamente).
