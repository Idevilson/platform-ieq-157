# Implementation Progress — 006 (Migração 001: Permissões)

## Summary
| Migração | Total | Done | Progress |
|----------|-------|------|----------|
| 001 (Fase 1) | 18 | 18 | 100% |

## Notas
- Estilo aplicado: early return, idempotência, sem comentários inúteis (feedback do usuário).
- Testes da feature rodam com Node 23 (`PATH="$HOME/.nvm/versions/node/v23.11.1/bin:$PATH"`).
- Suíte: 14 falhas pré-existentes (testes legados não tocados) + 105 passam.

## Task Log — Migração 001
- [x] T001-001 Constantes de permissão (system/ops/grant)
- [x] T001-002 PermissionDef + IPermissionRepository
- [x] T001-003 User: permissões escopadas + hasPermission(key, eventId?) + grant/revoke + permissionIndex (retrocompat)
- [x] T001-004 FirebaseUserRepositoryAdmin (grants + permissionIndex) + auth/shared (normaliza)
- [x] T001-005 FirebasePermissionRepositoryAdmin (coleção permissions)
- [x] T001-005b scripts/seed-permissions.ts (idempotente)
- [x] T001-006 Testes de domínio (UserPermissions.test.ts) — 12/12 ✅
- [x] T001-009 UserDTO + /auth/me expõem permissions
- [ ] T001-007 Catálogo: ListPermissions/CreatePermission/UpdatePermission
- [ ] T001-008 Usuários: ListUsers/SearchUsers + SetUserPermissions
- [ ] T001-009b ListEventTeam (time derivado)
- [ ] T001-010 Testes de use cases
- [ ] T001-011 API /api/admin/permissions
- [ ] T001-012 API /api/admin/users + /[userId]/permissions
- [ ] T001-012b API /api/admin/events/[eventId]/team
- [ ] T001-013 useRequirePermission + AuthContext expõe permissions
- [ ] T001-014 adminService + hooks + telas (Permissões, Usuários, Time do evento)
- [ ] T001-015 Validação (npm test && lint)
