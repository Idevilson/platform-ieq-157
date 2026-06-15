# Clarification - Migration 001 (Fase 1: Permissões)

**Timestamp:** 2026-06-14
**Branch:** main (não criar branch)
**Feature:** 006-event-operations-permissions-kit
**Parent:** (none)
**Escopo desta migração:** **Fase 1 — Permissões** (catálogo + atribuição por evento +
expor no /auth/me + gating). Fases 2–4 (caixa, kit/entrega, área dedicada) virão como
migrações 002–004.

## Expected Outcome

O admin gerencia um **catálogo de permissões** e atribui qualquer permissão a um usuário
comum, escolhendo **a quais eventos** vale (ou global). O backend passa a checar
`hasPermission(perm, eventId)` (admin bypassa); o `/auth/me` expõe as permissões (com escopo)
para o front; e existe gating por permissão (`useRequirePermission`) pronto para as próximas
fases. Retrocompatível: permissões legadas (`string[]`) e o uso atual do Q4-News continuam
funcionando (string/sem evento = global).

## Architecture Assessment

> Síntese da análise direta (agentes Explore + leitura) dos módulos da Fase 1.

- **Permissões hoje:** `User._permissions: string[]` + `hasPermission(perm)` (admin bypassa);
  `get permissions`; **sem grant/revoke**. Persistido em `users/{id}.permissions` (escrito só
  se `.length`). Único uso: Q4-News (`adm-q4-news`). **Sem custom claims.**
- **`/auth/me`** (`api/auth/me/route.ts`) **bypassa a entidade**: lê o doc e mapeia via
  `mapUserDocumentToResponse` (`api/auth/shared.ts`) → `UserDTO` (sem `permissions`).
- **Gestão de usuários:** inexistente (sem `/api/admin/users`, sem UI). `promoteToAdmin`
  nunca é chamado.
- **Padrão de auth de rota:** `verifyAdmin` inline (Bearer → `adminAuth.verifyIdToken` →
  `userRepository.findById` → `user.isAdmin()`). Há `_shared.ts` (feat 005) como referência.
- **Gating de página:** `useRequireAdmin` (corrigido na 005 p/ esperar `profileLoading`).
- **Eventos:** repo carrega categorias embedadas; lista de eventos via `ListEvents`.

**Riscos:** evoluir `permissions` de `string[]` → escopo sem quebrar Q4-News (retrocompat);
abrir gestão de usuários (dado sensível — admin-only); cada checagem lê Firestore (ok).

## Expectation Details

### DEVE fazer (Fase 1):
- **[TASK_SOURCE:user-req]** Catálogo de permissões: permissões **de sistema** (com efeito no
  código) + possibilidade de o admin **cadastrar/rotular** permissões.
- **[TASK_SOURCE:decision]** `User.permissions` evolui para `Array<{ key, eventIds[] }>`
  (`eventIds: ['*']` = global) + `grantPermission/revokePermission` +
  `hasPermission(perm, eventId?)`. **Retrocompat:** string legada = global; sem `eventId` =
  global (Q4-News intacto).
- **[TASK_SOURCE:decision]** Permissões de sistema iniciais: `deliver-kits`, `confirm-cash`
  (+ `adm-q4-news` existente), **seedadas** numa coleção `permissions`.
- **[TASK_SOURCE:user-req]** Admin atribui permissão a um usuário **escolhendo os eventos**.
- **[TASK_SOURCE:decision]** `/auth/me` + `UserDTO` + `mapUserDocumentToResponse` expõem
  `permissions` (com escopo).
- **[TASK_SOURCE:ai-suggestion]** `useRequirePermission` (consciente de `profileLoading`,
  como o fix do `useRequireAdmin`) + expor permissões no AuthContext.
- **[TASK_SOURCE:user-req]** Telas admin: **catálogo de permissões** e **usuários** (buscar +
  atribuir por evento).

### NÃO DEVE fazer:
- ❌ **[TASK_SOURCE:constraint]** Usar Firebase custom claims (manter leitura Firestore).
- ❌ **[TASK_SOURCE:constraint]** Quebrar o uso atual de `hasPermission('adm-q4-news')`.
- ❌ **[TASK_SOURCE:constraint]** Dar efeito automático a permissões **custom** (só as de
  sistema têm comportamento no código).
- ❌ **[TASK_SOURCE:constraint]** Abrir gestão de usuários/permissões para não-admin (esta
  parte é admin-only; a área da equipe vem na Fase 4).
- ❌ **[TASK_SOURCE:constraint]** Criar branch/commit/push.

## Questions & Answers (resolvidas na spec)

- **Escopo em User.permissions:** `Array<{key, eventIds[]}>`, `['*']` = global; string legada
  = global. **[TASK_SOURCE:decision]**
- **Permissões de sistema:** `deliver-kits`, `confirm-cash`, `adm-q4-news`.
  **[TASK_SOURCE:decision]**
- **Resolver userId→nome:** desnormalizar nome na escrita (relevante nas fases 2/3; aqui só
  preparo). **[TASK_SOURCE:decision]**

## Notes & Discussions

### Note 001 — Gaps mecânicos desta fase
**[TASK_SOURCE:decision]** G3 (mutação de permissões no User), G4 (/auth/me expõe perms),
G7 (coleção + seed do catálogo), G8 (`useRequirePermission` com profileLoading) são
endereçados nas tasks abaixo. G1/G2/G5/G6 pertencem às fases 2–3.
