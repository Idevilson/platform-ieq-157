# Feature 006 — Operação do Evento: Permissões Granulares + Entrega de Kit + Caixa (dinheiro)

- **Feature ID:** 006
- **Branch:** main (trabalhar na branch atual — **não criar branch**)
- **Criado em:** 2026-06-14
- **Status:** spec (aguardando `/sedd.clarify`)

## Expectation

O administrador concede **permissões granulares** a usuários comuns, escolhendo **a quais
eventos** cada permissão se aplica, e pode **criar/gerenciar** essas permissões num catálogo.
Usuários com permissão de **entrega** podem, numa **área dedicada** (também acessível ao
admin) escopada aos seus eventos, localizar a inscrição/participante e registrar a **entrega**
de cada item do **kit** (LED só para quem ganhou o brinde; holográfica e garrafa para todos os
confirmados); usuários com permissão de **caixa** confirmam **somente** pagamentos em
**dinheiro** (individual e lote), nunca PIX/cartão. Tudo fica registrado e **visível no painel
admin**: quem **entregou** cada item e quem **aprovou** cada pagamento em dinheiro (pelo
**nome**). O kit é **configurável por evento**. A inscrição em **lote** passa a exibir o brinde
por participante. Nada existente quebra.

## Problema / Motivação

O admin precisa **delegar** parte da operação de um evento (entregar kits, fazer caixa de
dinheiro) a usuários comuns, com permissões **escopadas por evento** e sem dar acesso ao
painel admin completo. Hoje: só há papéis `user`/`admin`; existe `User.hasPermission` mas
quase não é usado; não há gestão de usuários/permissões; não existe conceito de "kit" nem de
"entregue" (só "alocado"); o brinde por participante de lote **existe no domínio mas é
descartado no DTO** (não aparece na tela); e "quem confirmou" o dinheiro fica embutido num
`paymentId` falso, ilegível.

## User Stories

- **US1 (Admin):** Crio/edito permissões num **catálogo** e atribuo a qualquer usuário,
  escolhendo **a quais eventos** valem.
- **US2 (Admin):** Configuro a **lista de itens do kit** de cada evento (nome, se é
  condicional ao brinde, se é por tamanho).
- **US3 (Equipe — entrega):** Numa **área dedicada** escopada aos meus eventos, busco por
  CPF/nome e **marco a entrega** de cada item do kit — **por inscrição** (individual) ou
  **coletivamente para o lote** (no caso da inscrição coletiva).
- **US4 (Equipe — caixa):** Confirmo **somente** inscrições/lotes em **dinheiro**.
- **US5 (Admin):** No painel admin vejo **quem entregou** cada item e **quem aprovou** o
  dinheiro (pelo **nome**), tanto no individual quanto no lote/participante.
- **US6 (Admin):** No detalhe do **lote**, vejo o **brinde por participante** (LED).
- **US7 (Admin):** "Crio o time" apenas **atribuindo permissões**; uma área **"Time do
  evento"** mostra o time **derivado** (quem é entrega/caixa por evento) — sem entidade de
  time separada.

## Regras de Negócio

### RB1 — Permissões granulares + catálogo
- Catálogo de permissões (CRUD admin): `{ chave, rótulo, descrição, sistema }`. Permissões
  **de sistema** têm efeito no código (`deliver-kits`, `confirm-cash`, e o já existente
  `adm-q4-news`). Chaves **custom** podem ser criadas/rotuladas mas só agem onde houver
  código que as verifique.
- `User.hasPermission(perm, eventId)`: admin sempre `true`; senão precisa ter a permissão
  **com o evento no escopo**.

### RB2 — Escopo por evento
- Cada atribuição é `{ usuário, permissão, eventos[] }`. Ações da equipe validam
  `hasPermission(perm, eventId)` para o evento do alvo. Fora do escopo → negado.

### RB3 — Caixa (confirmar dinheiro) escopado
- Não-admin com `confirm-cash` (no evento X) confirma **somente** inscrição/lote **CASH** do
  evento X. Backend **rejeita** alvo não-CASH para não-admin (não só esconde o botão).
  Idempotente. Admin mantém o comportamento atual.
- **Ao confirmar (admin OU equipe), aloca o brinde** (perk) na hora — individual e lote — em
  paridade com o webhook (reusar `tryAllocatePerk`). Define `temBrinde`, habilitando o LED.

### RB4 — Kit configurável + entrega
- Cada evento tem `kitItems: { id, nome, condicionalAoBrinde?, porTamanho? }[]`.
- **Individual:** entrega rastreada por `(inscrição × itemId)` com `entreguePor (userId)` +
  `entregueEm`. Pode desmarcar (corrigir erro). Só para **confirmado**. Item
  `condicionalAoBrinde` (LED) só entregável se `temBrinde === true`.
- **Lote (coletivo):** entrega rastreada por `(lote × itemId)` — **um registro por item para o
  lote inteiro** (não por participante), com `entreguePor` + `entregueEm`. O LED coletivo
  cobre os participantes do lote que **ganharam o brinde** (a contagem/quem é apenas
  **exibida** — ver RB6). Só para lote **confirmado**.

### RB5 — Auditoria visível + armazenamento
- **Armazenamento (decisão):** entrega e auditoria ficam **embedados no próprio documento** —
  na **Inscription** (individual) e na **BatchInscription** (lote/coletivo). **Sem coleção
  separada** de entregas. Campos: `kitDeliveries[]` (por itemId), `confirmadoPor`+`confirmadoEm`.
- Caixa: gravar `confirmadoPor (userId)` + `confirmadoEm` como **campos próprios** (parar de
  embutir no `paymentId` falso `MANUAL-...`).
- **Desnormalizar o nome na escrita**: gravar também `entreguePorNome`/`confirmadoPorNome` no
  momento da ação (evita N+1 na leitura). `userId` é a fonte; o nome é cache de exibição.
- DTOs admin exibem o nome (`confirmadoPorNome`, `entreguePorNome`) nos modais admin
  (individual e lote).

### RB6 — Corrigir exposição do brinde no lote
- DTO/rota do lote passam a **expor `temBrinde`/`perkId`** por participante; o card do lote
  exibe a pulseira (LED) por participante (paridade com o individual).

## Garantias de Não-Regressão
- `hasPermission(perm)` sem eventId continua válido (admin/Q4-News). Mudança é **aditiva**
  (sobrecarga com `eventId` opcional).
- Confirmação de dinheiro do **admin** segue funcionando igual; só adiciona o registro
  legível de `confirmadoPor`.
- Alocação de brinde **não** muda; "entrega" é camada nova sobre "alocado".
- Inscrição individual/lote, consulta por CPF, webhook, receita e upgrade (feat 005) intactos.
- Sem Firebase custom claims (mantém leitura Firestore por request).

## Architecture Analysis

> Síntese da análise direta (3 agentes Explore) dos módulos impactados.

**Estado atual:**
- **Roles/permissões:** `UserRole = 'user' | 'admin'` (`shared/constants`). `UserRoleValue`
  só `isAdmin()`/`promoteToAdmin()`. **`User._permissions: string[]` + `hasPermission(perm)`**
  já existem (admin bypassa); persistido no Firestore (`users` doc). Único uso: Q4-News
  (`adm-q4-news`). **Sem custom claims.** `UserDTO`/`/auth/me` **não** expõem `permissions`.
- **Gestão de usuários:** inexistente (sem `/api/admin/users`, sem UI, `promoteToAdmin` nunca
  chamado).
- **Brinde/perk:** `EventPerk` (LED, primeiros 600). `temBrinde/perkId/brindeAlocadoEm` na
  `Inscription` e em `BatchParticipant`. Alocação no webhook/confirmação. **Sem "entregue".**
- **DTO do lote:** `BatchParticipantDTO = { nome, sexo, tamanho }`; rota
  `/api/admin/events/[eventId]/batch-inscriptions` **descarta** `temBrinde/perkId`.
  Individual **expõe** `temBrinde` (`InscriptionWithDetails`).
- **Caixa:** `ConfirmInscriptionManually` (individual; confirma qualquer pendente) e
  `ConfirmBatchCashPayment` (lote; só CASH). Admin-only (`verifyAdmin`). `confirmedBy`
  embutido em `paymentId` falso `MANUAL-{userId}-{ts}` (ilegível).
- **Gating de página:** `useRequireAdmin` (corrigido na 005 p/ esperar o perfil). Layout admin
  em `minha-conta/admin`.

**Impacto:** Domínio (User/permissões, KitItem, campos de entrega/confirmação em
Inscription e BatchParticipant), Aplicação (CRUD permissões, atribuição, config kit, entrega,
caixa escopada, enriquecimento de DTOs), Infra (repos: user permissions com escopo, kit,
entrega, confirmadoPor), API (`/api/admin/permissions`, `/api/admin/users`,
`/api/admin/events/[eventId]/kit`, rotas de entrega/caixa gated por permissão, `/auth/me`),
UI (gestão de permissões/usuários, config de kit, área "Operação do Evento",
brinde-por-participante no lote, auditoria nos modais).

**Reuso:** `User.hasPermission`, `verifyAdmin`/`_shared.ts` (padrão de auth nas rotas),
`EventPerk`/alocação (sem alterar), `ConfirmInscriptionManually`/`ConfirmBatchCashPayment`
(estender p/ registrar `confirmadoPor` + escopo), `useRequireAdmin` (base p/
`useRequirePermission`), padrões DDD do projeto.

**Riscos:** evoluir `User.permissions` de `string[]` p/ estrutura com escopo de eventos sem
quebrar o uso atual (compat retroativa: string sem escopo = global); abrir uma área para
**não-admin** exige gating cuidadoso (least privilege); resolver `userId→nome` adiciona
leituras (cache/batch).

## Architecture Contract
Ver `_meta.json#architectureContract` (imutável). Destaques: permissão escopada por evento
(`hasPermission(perm, eventId)`); permissões de sistema têm efeito, custom só com código;
caixa não-admin só CASH; LED condicional ao brinde; auditoria com nome nos DTOs admin; sem
custom claims; **não criar branch/commit**.

## Fases (migrações sugeridas no /sedd.clarify)
1. **Permissões**: catálogo (CRUD) + atribuição por evento + expor no `UserDTO`//`auth/me` +
   `useRequirePermission` + gating back/front + tela admin de usuários/permissões.
2. **Caixa escopada**: confirmar só CASH (individual + lote) por permissão+evento + auditoria
   `confirmadoPor`/`confirmadoPorNome` visível no admin.
3. **Kit + entrega**: `kitItems` por evento + entrega (individual e participante de lote, LED
   condicional) + **expor brinde por participante** + auditoria `entreguePor`/`entreguePorNome`.
4. **Área "Operação do Evento"**: rota gated por permissão (admin + equipe, escopada): buscar
   → entregar kit → confirmar dinheiro.

## Fora de Escopo
- Firebase custom claims / sincronizar permissões no token.
- Estorno/refund; alterar alocação de brinde.
- Permissões custom com **comportamento** automático (sem código que as verifique).
- Multi-tenant/igrejas; hierarquia de papéis.

## Gaps identificados (auditoria pré-clarify)

> Verificados direto no código. Devem ser resolvidos no `/sedd.clarify`.

- **G1 — RESOLVIDO por decisão do usuário.** O lote **não** vira inscrições individuais
  (fica independente/simples, como já é no código), e a **entrega do kit do lote é COLETIVA**
  (nível do lote, ver RB4) — não por participante. Portanto **não é preciso** id estável por
  participante para entrega. O **brinde por participante** permanece apenas **exibição**
  (RB6): leitura por índice é segura (read-only), e editar participantes não corrompe
  registros de entrega (que vivem no lote, não no participante).

- **G2 — RESOLVIDO (decisão do usuário).** `ConfirmInscriptionManually` hoje só muda status.
  Passa a **alocar o brinde** no momento da confirmação — **seja por admin ou por usuário com
  permissão** (`confirm-cash`) — em **paridade com o webhook e o lote** (reusar a lógica de
  `tryAllocatePerk`). Assim o `temBrinde` é definido e o **LED fica elegível** para entrega.
  Implica injetar o `IEventPerkRepository` em `ConfirmInscriptionManually`.

- **G3 — `User` não tem mutação de permissões; shape é `string[]`.**
  Só `hasPermission(perm)` (1 arg) + `get permissions`. Persistido como `permissions: string[]`.
  → Evoluir p/ `Array<{ key, eventIds[] }>` + `grantPermission/revokePermission` + overload
  `hasPermission(perm, eventId?)`, com **retrocompat** (string legada = global; sem eventId =
  global). Toca `User`, `restore/toJSON`, `FirebaseUserRepositoryAdmin` e o uso do Q4-News.

- **G4 — `/auth/me` bypassa a entidade e não expõe permissões.**
  Lê o doc e mapeia via `mapUserDocumentToResponse` (`api/auth/shared.ts`). → Incluir
  `permissions` (com escopo) no mapper + `UserDTO`/`UserDocument`.

- **G5 — RESOLVIDO (decisão).** Auditoria `userId→nome` em lista seria N+1 → **desnormalizar
  o nome na escrita** (`entreguePorNome`/`confirmadoPorNome`), tudo **embedado no doc** da
  inscrição/lote (sem coleção separada). Ver RB5.

- **G6 — `confirmedBy` hoje vive num `paymentId` falso (`MANUAL-...`).**
  → Virar campos próprios `confirmadoPor`/`confirmadoEm` em `Inscription` e `BatchInscription`.

- **G7 — Catálogo de permissões precisa de coleção + seed.**
  Nova coleção `permissions` + seed das de sistema (`deliver-kits`, `confirm-cash`,
  `adm-q4-news`). Sem seed, o catálogo nasce vazio.

- **G8 — `useRequirePermission` precisa do tratamento de `profileLoading`.**
  Como o fix do `useRequireAdmin` (feat 005): esperar o perfil + depender do `/auth/me` trazer
  permissões; senão repete a corrida de redirect em aba nova.

- **G9 — Onde guardar `kitItems`.** Categorias são embedadas no doc do evento → `kitItems`
  segue o mesmo padrão (embedado). Decisão de modelagem (não bloqueia).

## Open Questions [NEEDS_CLARIFICATION]
- **Q1:** Modelo de escopo em `User.permissions`: `Array<{ key; eventIds: string[] }>` (com
  `eventIds: ['*']` = global) ou coleção separada de atribuições? [assumido: array no user com
  '*' = global; string legada = global]
- **Q2:** Permissões de sistema iniciais: `deliver-kits`, `confirm-cash` (+ `adm-q4-news`
  existente). Confirmar chaves/rótulos. [assumido: sim]
- **Q3:** A área "Operação do Evento" fica em `/minha-conta/operacao` (gated por permissão)?
  [assumido: sim]
- **Q4:** Desmarcar entrega (corrigir) é permitido para a equipe ou só admin? [assumido:
  equipe pode, com auditoria de quem alterou]
- **Q5:** `kitItems` por evento — editável a qualquer momento; itens já entregues somem da
  config? (manter histórico) [assumido: soft — não apaga entregas registradas]
- **Q6:** Resolver `userId→nome` — incluir também e-mail/curto id para desambiguar homônimos?
  [assumido: nome; com tooltip de e-mail opcional]
