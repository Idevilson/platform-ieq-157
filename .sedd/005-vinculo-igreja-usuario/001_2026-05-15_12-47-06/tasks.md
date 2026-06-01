# Tasks - Migration 001

**Migration:** 001
**Timestamp:** 2026-05-15_12-47-06
**Parent:** (none)
**Feature:** vinculo-igreja-usuario

## Summary
Total: 47 | Completed: 47 | Pending: 0

## Tasks

### Foundation — Types & Constants

- [x] T001-001 [Foundation] Create shared types `src/shared/types/church.ts` — copiar de interfaces.ts (ChurchDTO, ChurchSummaryDTO, ChurchProps, CreateChurchDTO, UpdateChurchDTO, request/response types, SEDE_REDENCAO_SLUG, CHURCH_MODAL_DISMISS_KEY, ChurchBadgeVariant, ChurchErrorCode) + barrel export em `src/shared/types/index.ts`
- [x] T001-002 [Foundation] Estender `UserDTO` e `UserProfileResponse` em `src/shared/types/user.ts` com `churchId: string | null`
- [x] T001-003 [Foundation] Adicionar `ChurchInactiveError`, `ChurchNotFoundError`, `ChurchSlugAlreadyExistsError`, `CannotDeleteChurchWithMembersError`, `UserNotLinkedToChurchError` em `src/server/domain/shared/errors/index.ts` (ou arquivos dedicados se o pattern do projeto for esse)

### Foundation — Domain Layer

- [x] T001-004 [Foundation] Criar entity `Church` em `src/server/domain/church/entities/Church.ts` — constructor privado, `static create()`, `static fromPersistence()`, `toJSON()`, `toSummary()`, métodos `deactivate()`, `activate()`, `incrementMembers()`, `decrementMembers()`
- [x] T001-005 [Foundation] Criar interface `IChurchRepository` em `src/server/domain/church/repositories/IChurchRepository.ts` — findById, findBySlug, findAll, countMembers, save, update, delete, **transferUserChurch({userId, oldChurchId, newChurchId})**
- [x] T001-006 [Foundation] Estender `User` entity em `src/server/domain/user/entities/User.ts` — campo `_churchId: string | null`, métodos `setChurch(id)`, `clearChurch()`, `getChurchId()`, `isLinkedToChurch()`, atualizar `toJSON`

### Foundation — Infrastructure

- [x] T001-007 [Infrastructure] Estender `user-repository.ts` (`src/lib/firebase/user-repository.ts`) — incluir `churchId` em mapToFirestore/mapToEntity, default `null` para usuários antigos sem o campo
- [x] T001-008 [Infrastructure] Criar `FirebaseChurchRepositoryAdmin` em `src/server/infrastructure/firebase/repositories/FirebaseChurchRepositoryAdmin.ts` — getAdminFirestore, mapToEntity/mapToFirestore, findById, findBySlug, findAll (paginação), countMembers, save, update, delete
- [x] T001-009 [Infrastructure] Implementar `transferUserChurch` em `FirebaseChurchRepositoryAdmin` usando `firestore.runTransaction()` — lê user.churchId atual, valida coerência com oldChurchId esperado, decrementa totalMembros da igreja antiga (se houver), incrementa da nova (se houver), atualiza user.churchId atomicamente
- [x] T001-010 [Infrastructure] Criar seed `src/server/infrastructure/firebase/seeds/seedSedeRedencao.ts` — idempotente (set com merge se doc `sede-redencao` não existe), nome="SEDE DE REDENÇÃO", cidade="Redenção", estado="PA", ativo=true, totalMembros=0
- [x] T001-011 [Infrastructure] Criar script CLI `scripts/seed-churches.ts` que invoca `seedSedeRedencao()` — comando manual; adicionar npm script `npm run seed:churches` em package.json

### Application — Schemas & Use Cases (Church CRUD)

- [x] T001-012 [Application] Criar Zod schemas em `src/server/application/church/schemas.ts` — createChurchSchema, updateChurchSchema, listChurchesSchema, listChurchMembersSchema, setUserChurchSchema, slugSchema (validação de formato)
- [x] T001-013 [Application] Criar use case `CreateChurch` em `src/server/application/church/CreateChurch.ts` — safeParse, gerar slug se omitido, verificar unicidade do slug (throw `ChurchSlugAlreadyExistsError`), salvar via repository
- [x] T001-014 [Application] Criar use case `UpdateChurch` em `src/server/application/church/UpdateChurch.ts` — buscar, **slug imutável** (rejeitar se vier no payload), atualizar campos permitidos, persistir
- [x] T001-015 [Application] Criar use case `ListChurches` em `src/server/application/church/ListChurches.ts` — suporta `ativo?: boolean` para filtrar; público sempre filtra `ativo: true`, admin pode listar todas
- [x] T001-016 [Application] Criar use case `GetChurchById` em `src/server/application/church/GetChurchById.ts` — throw `ChurchNotFoundError` se inexistente
- [x] T001-017 [Application] Criar use case `DeactivateChurch` em `src/server/application/church/DeactivateChurch.ts` — seta `ativo: false`
- [x] T001-018 [Application] Criar use case `DeleteChurch` em `src/server/application/church/DeleteChurch.ts` — só permite se `totalMembros === 0`, senão throw `CannotDeleteChurchWithMembersError`
- [x] T001-019 [Application] Criar use case `ListChurchMembers` em `src/server/application/church/ListChurchMembers.ts` — query `users` por `churchId`, busca opcional por nome/email (regex case-insensitive), paginação cursor-based, limit default 50

### Application — Use Cases (User-Church Linking)

- [x] T001-020 [Application] Criar use case `SetUserChurch` em `src/server/application/user/SetUserChurch.ts` — recebe `{userId, newChurchId}`, valida que igreja existe E está ativa (throw `ChurchInactiveError` se não), invoca `repository.transferUserChurch({userId, oldChurchId: atual, newChurchId})`. **Idempotente:** se newChurchId === oldChurchId, no-op silencioso
- [x] T001-021 [Application] Criar use case `ClearUserChurch` em `src/server/application/user/ClearUserChurch.ts` — auto-serviço, recebe `userId`, invoca `transferUserChurch({userId, oldChurchId: atual, newChurchId: null})`. No-op se já era null
- [x] T001-022 [Application] Criar use case `AdminRemoveUserFromChurch` em `src/server/application/user/AdminRemoveUserFromChurch.ts` — recebe `{userId, churchId}`, valida que o user está vinculado àquela churchId, invoca `transferUserChurch({userId, oldChurchId: churchId, newChurchId: null})`

### API Routes — Público

- [x] T001-023 [API] `GET /api/churches/route.ts` — lista igrejas com `ativo: true` (chama `ListChurches`), retorna `PublicChurchListResponse`

### API Routes — User Auto-Serviço

- [x] T001-024 [API] `GET /api/user/church/route.ts` — auth obrigatória, busca user, resolve `church` via `GetChurchById` se `churchId !== null`, retorna `UserChurchResponse`
- [x] T001-025 [API] `PUT /api/user/church/route.ts` — auth obrigatória, valida body com `setUserChurchSchema`, invoca `SetUserChurch`
- [x] T001-026 [API] `DELETE /api/user/church/route.ts` — auth obrigatória, invoca `ClearUserChurch`, retorna 204

### API Routes — Admin

- [x] T001-027 [API] `GET/POST /api/admin/churches/route.ts` — usar `verifyAdmin()` reutilizado, GET lista todas, POST cria
- [x] T001-028 [API] `PATCH/DELETE /api/admin/churches/[churchId]/route.ts` — PATCH chama `UpdateChurch` ou `DeactivateChurch`, DELETE chama `DeleteChurch` (com tratamento do `CannotDeleteChurchWithMembersError` → 409)
- [x] T001-029 [API] `GET /api/admin/churches/[churchId]/members/route.ts` — chama `ListChurchMembers`, suporta query params `search`, `limit`, `offset`/`cursor`
- [x] T001-030 [API] `DELETE /api/admin/churches/[churchId]/members/[userId]/route.ts` — chama `AdminRemoveUserFromChurch`

### Frontend — Service Layer

- [x] T001-031 [Frontend] Criar `src/lib/services/churchService.ts` — métodos: listPublicChurches, getUserChurch, setUserChurch, clearUserChurch, listAdminChurches, createChurch, updateChurch, deactivateChurch, deleteChurch, listChurchMembers, adminRemoveMember

### Frontend — Hooks

- [x] T001-032 [Frontend] Criar `src/hooks/queries/useChurches.ts` (público), `useUserChurch.ts`, `useAdminChurches.ts`, `useChurchMembers.ts` — cada um com query keys factory + useQuery, staleTime 5min
- [x] T001-033 [Frontend] Criar `src/hooks/mutations/useUserChurchMutations.ts` — `useSetUserChurch`, `useClearUserChurch`, com `invalidateQueries(['user', 'church'])` + `['auth', 'me']`
- [x] T001-034 [Frontend] Criar `src/hooks/mutations/useAdminChurchMutations.ts` — `useCreateChurch`, `useUpdateChurch`, `useDeactivateChurch`, `useDeleteChurch`, `useAdminRemoveMember`

### Frontend — UI Components

- [x] T001-035 [US-003] Criar `src/components/church/ChurchBadge.tsx` — props: `church | null` e `variant: header|account|home|compact`; 4 layouts; estado "Sem vínculo" clicável dispara callback
- [x] T001-036 [US-001] Criar `src/components/church/ChurchSelectorModal.tsx` — radio único entre igrejas ativas, mode `initial | change`, "Agora não" seta `sessionStorage[CHURCH_MODAL_DISMISS_KEY]='1'` e fecha; "Confirmar" chama mutation `useSetUserChurch`
- [x] T001-037 [US-002] Criar `src/components/church/UserChurchesSection.tsx` — card com church atual + botões "Trocar igreja" (abre modal mode=change) e "Remover vínculo" (chama `useClearUserChurch` com confirmação); estado vazio com CTA
- [x] T001-038 [US-004] Criar `src/components/admin/CreateChurchModal.tsx` — form RHF + Zod, slug auto-gerado a partir do nome com toggle para editar manualmente, mutation `useCreateChurch`
- [x] T001-039 [US-007] Criar `src/components/admin/EditChurchModal.tsx` — form com nome/cidade/estado/ativo, **slug exibido readonly** (imutável), mutation `useUpdateChurch`
- [x] T001-040 [US-005,US-006] Criar `src/components/admin/ChurchMembersList.tsx` — tabela com busca debounced, paginação "Carregar mais", botão "Remover vínculo" com confirmação dispara `useAdminRemoveMember`

### Frontend — Integration (modificação de arquivos existentes)

- [x] T001-041 [US-001] Integrar `<ChurchSelectorModal>` em `src/providers/auth-provider.tsx` — disparar quando user logado tem `churchId === null` e `sessionStorage[CHURCH_MODAL_DISMISS_KEY] !== '1'`
- [x] T001-042 [US-003] Inserir `<ChurchBadge variant="header" />` no header desktop e no menu mobile em `src/components/common/Header.tsx` (exibe só para usuário logado)
- [x] T001-043 [US-002] Adicionar `<UserChurchesSection>` à página `/minha-conta` (`src/app/minha-conta/page.tsx`)
- [x] T001-044 [US-003] Inserir `<ChurchBadge variant="home" />` na home logada (verificar se existe e onde — caso geral `src/app/(main)/page.tsx` para usuário autenticado, ou seção dedicada)
- [x] T001-045 [US-004,005] Criar páginas admin `src/app/minha-conta/admin/igrejas/page.tsx` (listagem + botão "Nova igreja") e `src/app/minha-conta/admin/igrejas/[churchId]/page.tsx` (detalhe + membros) + adicionar item "Igrejas" no menu em `src/app/minha-conta/admin/layout.tsx`

### QA — Tests & Infra

- [x] T001-046 [QA] Vitest unit: `Church` entity (create/fromPersistence/toJSON, increment/decrementMembers boundaries em 0), `User` entity (setChurch/clearChurch/isLinkedToChurch), e use cases `SetUserChurch` (vincular, trocar, no-op, inactive→error) + `AdminRemoveUserFromChurch` (unlinked→error)
- [x] T001-047 [QA] Playwright e2e fluxo crítico — (a) signup novo user → login → modal aparece → confirma SEDE → badge mostra; (b) admin remove vínculo via UI → user faz logout/login → modal reabre. Adicionar índices em `firestore.indexes.json` (composto `users(churchId asc, nome asc)` e `churches(ativo asc, nome asc)`)
