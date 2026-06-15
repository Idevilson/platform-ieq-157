# Tasks - Migration 001 (Fase 1: Permissões)

**Migration:** 001
**Timestamp:** 2026-06-14_clarify
**Feature:** 006-event-operations-permissions-kit
**Branch:** main (não criar branch, não commitar)
**Parent:** (none)

## Summary
Total: 18 | Completed: 18 | Pending: 0

> Escopo: **Fase 1 — Permissões**. Fases 2 (caixa), 3 (kit/entrega) e 4 (área dedicada) serão
> migrações 002–004.

## Tasks

### Domínio (Foundation)
- [x] T001-001 [Foundation] Constantes: chaves de permissão de sistema (`DELIVER_KITS='deliver-kits'`, `CONFIRM_CASH='confirm-cash'`, manter `adm-q4-news`) em `src/shared/constants`. Tipo `UserPermissionGrant = { key: string; eventIds: string[] }`.
- [x] T001-002 [Foundation] VO/entidade `PermissionDef` (`{ key, label, description?, system }`) em `src/server/domain/user/` (ou `permission/`), com create/fromPersistence/toJSON.
- [x] T001-003 [Foundation] `User`: `permissions` → `UserPermissionGrant[]`; `hasPermission(key, eventId?)` (admin=>true; `['*']`=global; sem eventId=global); `grantPermission(key, eventIds)`, `revokePermission(key)`; `restore`/`toJSON` atualizados. **Retrocompat:** aceitar `string[]` legado na restore (vira `{key, eventIds:['*']}`).
- [x] T001-004 [GNR] `FirebaseUserRepositoryAdmin`: ler `permissions` em ambos os formatos (legado `string[]` e novo) e **escrever sempre no novo**; gravar também `permissionIndex: string[]` (achatado `key:eventId`, incl. `key:*`) para query; idem `mapUserDocumentToResponse` (`api/auth/shared.ts`).
- [x] T001-005 [Foundation] `IPermissionRepository` + `FirebasePermissionRepositoryAdmin` (coleção `permissions`): get/list/upsert/delete (delete bloqueado p/ `system`).
- [x] T001-005b [Infra] ~~Script de seed~~ **SUBSTITUÍDO** (criar pela própria plataforma): a coleção `permissions` nasce no 1º write da tela "Permissões"; `CreatePermission` reconhece chaves de sistema (`deliver-kits`/`confirm-cash`/`adm-q4-news`) e marca `system=true` automaticamente (protege exclusão). Script removido.
- [x] T001-006 [Test] Testes de domínio: `hasPermission` (admin bypass; escopo por evento; `['*']`; retrocompat string legada; Q4-News `hasPermission('adm-q4-news')` sem eventId).

### Aplicação (Use Cases)
- [x] T001-007 [US1] Catálogo: `ListPermissions`, `CreatePermission`, `UpdatePermission` (system não editável na chave nem deletável). Zod schemas.
- [x] T001-008 [US1] Usuários: `ListUsers`/`SearchUsers` (por nome/email/CPF) e `SetUserPermissions(targetUserId, grants[])` (atribuir/remover com `eventIds`).
- [x] T001-009b [US-team] `ListEventTeam(eventId)`: retorna o time **derivado** das permissões — usuários com permissões de operação no escopo do evento (via `permissionIndex` array-contains-any: `deliver-kits:<id>`, `confirm-cash:<id>`, `:*`), com nome/email + permissões que possuem.
- [x] T001-009 [GNR] Expor permissões no perfil: incluir `permissions` no `UserDTO` e no retorno de `/auth/me` (via `mapUserDocumentToResponse`).
- [x] T001-010 [Test] Testes de use cases: set/list permissões; create/update catálogo (bloqueio em system); search users.

### API (admin-only)
- [x] T001-011 [US1] `GET/POST /api/admin/permissions` + `PATCH /api/admin/permissions/[key]` (verifyAdmin).
- [x] T001-012 [US1] `GET /api/admin/users` (listar/buscar) + `PUT /api/admin/users/[userId]/permissions` (atribuir grants com eventos) (verifyAdmin).
- [x] T001-012b [US-team] `GET /api/admin/events/[eventId]/team` → time derivado das permissões (verifyAdmin).

### UI / Front
- [x] T001-013 [GNR] AuthContext/`useAuth` expõem `permissions`; novo `useRequirePermission(key, { eventId? })` (consciente de `profileLoading`, admin bypassa).
- [x] T001-014 [US1] `adminService` + hooks (catálogo + usuários/atribuição + time) e telas admin: **Permissões** (catálogo CRUD), **Usuários** (buscar + atribuir permissões por evento, com seleção de eventos / "Todos") e **Time do evento** (área que mostra o time **derivado** das permissões, por evento: quem é entrega / caixa); novos itens de nav no `admin/layout`.

### Validação
- [x] T001-015 [Validation] `npm test && npm run lint` (Node 23 via nvm). Smoke: admin cria/atribui permissão por evento; usuário comum recebe permissões no `/auth/me`; Q4-News segue funcionando.

## Dependencies

```
T001-001 → T001-002 → T001-003 → T001-004 → T001-005 → T001-005b (seed manual)
(001..005) → T001-006

T001-003,004,005 → T001-007,008,009 → T001-010

T001-007 → T001-011
T001-008,009 → T001-012

T001-004(index) + T001-008 → T001-009b → T001-012b → T001-014
T001-009 → T001-013 → T001-014
T001-011,012 → T001-014

(tudo) → T001-015
```

---

## Acceptance Criteria

Ver `acceptance.md`.
