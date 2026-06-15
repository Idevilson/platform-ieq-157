# Decisions - Migration 001 (Fase 1: Permissões)

## D001-001: Permissões granulares escopadas por evento (catálogo)
**Source:** Decisões do usuário (Opção A + escopo por evento).
**Decision:** Catálogo de permissões `{ key, label, description, system }`. `User.permissions`
evolui de `string[]` para `Array<{ key, eventIds[] }>`. `hasPermission(perm, eventId?)`: admin
=> true; senão precisa do `perm` com o `eventId` no escopo (ou `['*']`). Retrocompat: string
legada = global; chamada sem `eventId` = checagem global.
**Impact:** User entity (+grant/revoke), User.restore/toJSON, FirebaseUserRepositoryAdmin map,
constants (system perm keys), uso do Q4-News intacto.

## D001-002: Permissões de sistema vs custom
**Source:** Alinhamento (efeito precisa de código).
**Decision:** Permissões **de sistema** (`deliver-kits`, `confirm-cash`, `adm-q4-news`) têm
efeito no código e são **seedadas**. O admin pode cadastrar permissões **custom** (rótulo/
chave), mas elas só agem onde houver código que as verifique.
**Impact:** Coleção `permissions` + seed; CRUD com proteção (system não deletável; chave
imutável).

## D001-003: /auth/me e UserDTO expõem permissões
**Source:** G4. O front precisa das permissões (com escopo) para gatekeepear.
**Decision:** Atualizar `mapUserDocumentToResponse` (`api/auth/shared.ts`) + `UserDTO` +
`UserDocument` para incluir `permissions: Array<{ key, eventIds[] }>`.
**Impact:** /auth/me, tipos compartilhados, AuthContext/useAuth.

## D001-004: Gating por permissão (useRequirePermission)
**Source:** G8 + Fase 4 (preparo).
**Decision:** Novo `useRequirePermission(perm, { eventId? })` consciente de `profileLoading`
(como o fix do `useRequireAdmin`), lendo as permissões do AuthContext. Admin sempre passa.
**Impact:** novo hook; AuthContext expõe permissions.

## D001-005: Telas admin (catálogo + usuários) são admin-only
**Source:** Restrição de escopo.
**Decision:** Gestão de permissões/usuários fica em `/minha-conta/admin/**` (admin-only via
layout). A área da **equipe** (não-admin) é a Fase 4 (`/minha-conta/operacao`).
**Impact:** nav admin + 2 telas; rotas `/api/admin/permissions` e `/api/admin/users`.

## D001-007: "Time" é derivado das permissões + view por evento
**Source:** Usuário — admin cria o time atribuindo permissões; UI mostra o time formado.
**Decision:** **Sem coleção `teams`**. O time é **derivado**: usuários com `deliver-kits`/
`confirm-cash` (ou qualquer permissão de operação) no escopo de um evento. A UI admin tem uma
área **"Time do evento"** listando, por evento, quem tem o quê.
**Query:** manter um índice achatado `permissionIndex: string[]` no doc do usuário (ex.:
`deliver-kits:geracao-forte`, `confirm-cash:*`) gravado junto com `permissions`, para
`array-contains-any` (`deliver-kits:<eventId>`, `confirm-cash:<eventId>`, `...:*`). Alternativa
p/ base pequena: varrer `users`. Recomendado: o índice.
**Impact:** repo de usuário grava `permissionIndex`; use case `ListEventTeam(eventId)`;
rota + tela "Time do evento".

## D001-006: Retrocompat e migração de dados
**Source:** Dados existentes.
**Decision:** Ler `permissions` tanto como `string[]` (legado → vira `{key, eventIds:['*']}`)
quanto como o novo shape. Escrever sempre no novo shape. Sem migração destrutiva.
**Impact:** FirebaseUserRepositoryAdmin + mapUserDocumentToResponse (normalização na leitura).
