# Acceptance Criteria - Migration 001 (Fase 1: Permissões)

Expectativa: "Admin gerencia catálogo de permissões e atribui qualquer permissão a um usuário
comum escolhendo a quais eventos vale (ou global); backend checa hasPermission(perm, eventId)
com admin bypass; /auth/me expõe permissões; gating por permissão pronto; retrocompatível."

## Critérios

- [ ] **AC-001:** Catálogo lista permissões de sistema (deliver-kits, confirm-cash, adm-q4-news)
  - Verificar: tela admin de Permissões mostra as de sistema (marcadas como "sistema").

- [ ] **AC-002:** Admin cria uma permissão custom (rótulo + chave)
  - Verificar: criar aparece no catálogo; não pode editar a chave de uma de sistema nem deletá-la.

- [ ] **AC-003:** Admin atribui permissão a um usuário escolhendo eventos
  - Verificar: na tela de Usuários, buscar usuário, ligar `confirm-cash` com evento X; salvar.

- [ ] **AC-004:** `hasPermission(perm, eventId)` respeita o escopo
  - Verificar (teste): usuário com `confirm-cash` em [X] → true para X, false para Y; admin → true sempre.

- [ ] **AC-005:** Global e retrocompat
  - Verificar (teste): grant com `['*']` → true para qualquer evento; permissão legada `string[]` lida como global; `hasPermission('adm-q4-news')` sem eventId continua funcionando.

- [ ] **AC-006:** `/auth/me` expõe as permissões (com escopo)
  - Verificar: resposta de `/auth/me` inclui `permissions: [{ key, eventIds }]`.

- [ ] **AC-007b:** Time do evento (derivado) visível
  - Verificar: ao atribuir `deliver-kits`/`confirm-cash` a usuários no evento X, a área "Time do evento" lista esses usuários e o que cada um pode fazer (sem coleção `teams`).

- [ ] **AC-007:** Gating por permissão disponível
  - Verificar: `useRequirePermission` espera o perfil carregar (sem redirect indevido em aba nova) e admin sempre passa.

- [ ] **AC-008:** Não-regressão
  - Verificar: Q4-News continua funcionando; nada de inscrição/lote/consulta/webhook quebra;
    `npm test && npm run lint` verde (Node 23).
