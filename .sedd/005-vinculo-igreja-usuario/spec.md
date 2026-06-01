# vinculo-igreja-usuario — Vínculo de Usuário com Igreja

**Feature ID:** 005
**Created:** 2026-05-15
**Status:** Specified

---

## Expectation

> Cada usuário com conta na plataforma IEQ poderá declarar **uma** igreja a que pertence — cada usuário tem no máximo um vínculo ativo por vez. O MVP entrega a entidade `Church` no domínio com seed automático da "SEDE DE REDENÇÃO" (única opção disponível inicialmente). O sistema suporta N igrejas cadastradas (futuras unidades podem ser criadas pelo admin sem alteração de schema), mas o usuário só pode pertencer a uma de cada vez.
>
> Após login, se o usuário ainda não declarou nenhuma igreja, um modal pergunta de qual unidade ele faz parte. O modal é dispensável ("Agora não") e não bloqueia a navegação; a dispensa é guardada em `sessionStorage`, então o modal reaparece em sessões futuras enquanto `churchId === null`. Em toda interface logada (header desktop/mobile, modal/dropdown da conta, tela inicial logada), o componente `<ChurchBadge>` mostra a igreja do usuário; quando `churchId === null`, exibe "Sem vínculo" em destaque de alerta, clicável para abrir o modal.
>
> Na área admin (`/minha-conta/admin/igrejas`), administradores (`role: 'admin'`) podem criar novas igrejas, editar dados, inativar (sem excluir quando há membros), e ver a listagem de membros de cada igreja com busca por nome/email. O admin também pode remover o vínculo de qualquer usuário a uma igreja — operação que não desativa o usuário, apenas zera `churchId`. **Nenhuma notificação é enviada** quando admin remove vínculo: o próximo acesso do usuário recarrega o perfil do Firestore e o badge reativamente passa a exibir "Sem vínculo", reabrindo o modal naturalmente. Usuários pré-existentes na plataforma **não são auto-vinculados** — o modal pós-login os captura quando entrarem.

---

## Goals

- [ ] Criar entidade `Church` no domínio (`src/server/domain/church/`) com Firestore collection `churches`
- [ ] Adicionar `churchId: string | null` em `UserDTO`, persistir no Firestore com default `null`
- [ ] Modal `<ChurchSelectorModal>` ativado automaticamente após login se `churchId === null`
- [ ] Componente único `<ChurchBadge>` com variantes `header | account | home | compact`
- [ ] Usuário pode trocar de igreja (substituição atômica) ou se desvincular pelo próprio `/minha-conta`
- [ ] CRUD admin de igrejas em `/minha-conta/admin/igrejas` (criar, editar, inativar)
- [ ] Listagem de membros por igreja com busca e ação "Remover vínculo"
- [ ] Contador `totalMembros` consistente via transação Firestore (decrementa antiga + incrementa nova em troca)
- [ ] Seed idempotente da "SEDE DE REDENÇÃO" (slug `sede-redencao`)
- [ ] Página `/minha-conta` ganha seção "Minha igreja"

## Non-Goals

- Permissão granular `adm-igrejas` — apenas `role: 'admin'` por enquanto
- Vínculo simultâneo com múltiplas igrejas (1 user = 1 church por vez)
- Multi-tenant (igreja não é tenant; é declaração de pertencimento)
- Hierarquia de igrejas (matriz/filial)
- Aprovação de vínculo pelo admin da igreja
- Notificação por email/in-app quando admin remove vínculo (UX reativa cobre)
- Migração retroativa: relacionar `churchId` com inscrições antigas de eventos
- Acoplar com o Congresso Geração Forte (spec 002) — categorias do evento ficam independentes
- Tornar vínculo obrigatório (modal é sempre dispensável)
- Histórico de mudanças de igreja (substituição não preserva igreja anterior)

---

## User Stories

### US-001: Usuário declara vínculo via modal pós-login
**Como** usuário logado sem igreja declarada
**Quero** ver um modal pedindo para escolher minha igreja após login
**Para que** meu perfil reflita a comunidade a que pertenço

#### Acceptance Criteria
- [ ] Modal aparece automaticamente quando `user.churchId === null` após autenticação
- [ ] Lista igrejas com `ativo: true` ordenadas alfabeticamente
- [ ] **Seleção única** via radio buttons
- [ ] "Confirmar" persiste no backend e fecha o modal
- [ ] "Agora não" fecha o modal e marca `sessionStorage[CHURCH_MODAL_DISMISS_KEY] = '1'` (reaparece em próxima sessão)
- [ ] Modal não bloqueia navegação — usuário pode usar o site sem decidir
- [ ] Se houver apenas 1 igreja ativa, ela já vem pré-selecionada

### US-002: Usuário gerencia sua igreja em /minha-conta
**Como** usuário logado
**Quero** ver/trocar/remover minha igreja na minha conta
**Para que** eu possa atualizar quando mudar de comunidade

#### Acceptance Criteria
- [ ] Seção "Minha igreja" exibe card com nome + cidade/estado da igreja atual
- [ ] Botão "Trocar igreja" abre seletor com outras igrejas ativas disponíveis
- [ ] Botão "Remover vínculo" desvincula o usuário (volta para `churchId: null`)
- [ ] Trocar de igreja é **operação atômica** no backend (decrementa contador da antiga + incrementa da nova em transação)
- [ ] Update otimista no frontend com rollback em caso de erro
- [ ] Estado sem igreja mostra CTA "Vincule-se a uma igreja" que abre o modal

### US-003: Badge UI mostra estado de vínculo
**Como** usuário logado
**Quero** ver minha igreja destacada nas principais áreas da plataforma
**Para que** haja identificação visual e CTA quando ainda não estou vinculado

#### Acceptance Criteria
- [ ] Mesmo componente `<ChurchBadge>` reutilizado em header (desktop + mobile), modal/dropdown de conta e seção da home logada
- [ ] Quando `churchId !== null`: mostra nome da igreja
- [ ] Quando `churchId === null`: badge "Sem vínculo" em cor de alerta, clicável → abre `<ChurchSelectorModal>`
- [ ] Skeleton enquanto perfil carrega (largura fixa, sem layout shift)
- [ ] Variantes: `header` (inline pequeno), `account` (label + valor), `home` (card destacado), `compact` (só ícone + nome curto)
- [ ] Quando o backend devolver `churchId` referente a igreja inativa, badge ainda mostra o nome (não rompe), mas o seletor não a oferece em trocas

### US-004: Admin cria nova igreja
**Como** admin
**Quero** cadastrar novas igrejas (nome, slug, cidade, estado, ativo)
**Para que** usuários possam se vincular a elas

#### Acceptance Criteria
- [ ] Página `/minha-conta/admin/igrejas` lista todas as igrejas (ativas + inativas) com contador de membros
- [ ] "Nova igreja" abre `<CreateChurchModal>` — campos: nome (obrigatório), slug (auto-gerado, editável), cidade, estado (UF), ativo (default true)
- [ ] Slug único — validado no backend; conflito retorna `ChurchSlugAlreadyExistsError`
- [ ] Seed automático cria "SEDE DE REDENÇÃO" se inexistente no boot ou via script `scripts/seed-churches.ts`

### US-005: Admin lista membros de uma igreja
**Como** admin
**Quero** ver os usuários vinculados a cada igreja
**Para que** eu gerencie a comunidade

#### Acceptance Criteria
- [ ] Página `/minha-conta/admin/igrejas/[churchId]` mostra detalhes da igreja + lista de membros
- [ ] Busca por nome ou email com debounce
- [ ] Contador "X membros" (lido do campo denormalizado `totalMembros`)
- [ ] Paginação a partir de 50 membros (cursor-based)

### US-006: Admin remove vínculo de membro
**Como** admin
**Quero** desvincular um usuário de uma igreja
**Para que** eu possa corrigir cadastros incorretos

#### Acceptance Criteria
- [ ] Botão "Remover vínculo" em cada linha da lista de membros
- [ ] Confirmação modal ("Tem certeza?") antes de executar
- [ ] Operação seta `user.churchId = null` em transação que também decrementa `church.totalMembros`
- [ ] Não desativa nem exclui o usuário
- [ ] Nenhuma notificação é enviada — quando o usuário recarregar o perfil (próximo `/api/auth/me` ou sync-profile), o badge reativamente passa a "Sem vínculo" e o modal reabre na próxima sessão
- [ ] Use case `AdminRemoveUserFromChurch`, distinto de `UnlinkUserFromChurch` (auto-serviço)

### US-007: Admin edita ou inativa igreja
**Como** admin
**Quero** editar dados de uma igreja ou inativá-la
**Para que** o cadastro fique correto sem perder histórico

#### Acceptance Criteria
- [ ] Modal de edição permite alterar nome, cidade, estado, ativo
- [ ] **Slug é imutável após criação** (para não quebrar referências e URLs)
- [ ] Inativar (`ativo: false`) remove a igreja do seletor de novos vínculos
- [ ] Usuários já vinculados a uma igreja inativa permanecem vinculados (badge ainda funciona; podem trocar para uma ativa)
- [ ] Excluir só é permitido se `totalMembros === 0` — caso contrário, oferece inativar

---

## Architecture Analysis

### Current Architecture (Relevante)

**Tech Stack:** Next.js 15 (App Router) + TypeScript + Firebase Firestore + TailwindCSS + TanStack React Query + Zod + React Hook Form

**Padrão DDD em camadas** (consistente com Q4-News spec 003):

```
src/server/domain/        → Entities, Value Objects, Repository interfaces
src/server/application/   → Use cases (1 arquivo = 1 ação) + Zod schemas
src/server/infrastructure/→ Firebase repositories + seeds
src/app/api/              → Route handlers (público + admin)
src/app/(main)/           → Páginas públicas
src/app/minha-conta/      → Área logada
src/app/minha-conta/admin/→ Área admin (protegida por useRequireAdmin)
src/components/           → Componentes React por feature
src/hooks/                → React Query hooks (queries + mutations)
src/lib/services/         → Service layer frontend
src/shared/               → Types + constants compartilhados
```

### Impact Assessment

**Arquivos a MODIFICAR:**

1. `src/shared/types/user.ts` — adicionar `churchId: string | null` em `UserDTO` e `UserProfileResponse`
2. `src/server/domain/user/entities/User.ts` — métodos `setChurch(churchId)`, `clearChurch()`, `getChurchId()`
3. `src/lib/firebase/user-repository.ts` — incluir `churchId` em mapToFirestore/mapToEntity, default `null` para usuários antigos
4. `src/app/api/auth/sync-profile/route.ts` — garantir `churchId: null` em novos usuários
5. `src/providers/auth-provider.tsx` — disparar `<ChurchSelectorModal>` se `user.churchId === null` e sessionStorage sem dismiss
6. `src/components/common/Header.tsx` — embed `<ChurchBadge variant="header" />` para usuários logados
7. `src/app/minha-conta/admin/layout.tsx` — adicionar item "Igrejas" no menu admin
8. `src/app/minha-conta/page.tsx` — seção "Minha igreja" com `<UserChurchesSection />` (singular)
9. `src/shared/types/index.ts` — exportar tipos de church

**Arquivos NOVOS (por camada):**

*Domain:*
- `src/server/domain/church/entities/Church.ts`
- `src/server/domain/church/repositories/IChurchRepository.ts`
- `src/server/domain/shared/errors/ChurchNotFoundError.ts`
- `src/server/domain/shared/errors/ChurchSlugAlreadyExistsError.ts`
- `src/server/domain/shared/errors/CannotDeleteChurchWithMembersError.ts`
- `src/server/domain/shared/errors/ChurchInactiveError.ts`

*Application:*
- `src/server/application/church/schemas.ts`
- `src/server/application/church/CreateChurch.ts`
- `src/server/application/church/UpdateChurch.ts`
- `src/server/application/church/ListChurches.ts`
- `src/server/application/church/GetChurchById.ts`
- `src/server/application/church/DeactivateChurch.ts`
- `src/server/application/church/DeleteChurch.ts`
- `src/server/application/church/ListChurchMembers.ts`
- `src/server/application/user/SetUserChurch.ts` (cria ou troca vínculo, transacional)
- `src/server/application/user/ClearUserChurch.ts` (auto-serviço)
- `src/server/application/user/AdminRemoveUserFromChurch.ts`

*Infrastructure:*
- `src/server/infrastructure/firebase/repositories/FirebaseChurchRepositoryAdmin.ts`
- `src/server/infrastructure/firebase/seeds/seedSedeRedencao.ts`
- `scripts/seed-churches.ts` (CLI para rodar manualmente)

*API Routes:*
- `src/app/api/churches/route.ts` — GET público (igrejas ativas)
- `src/app/api/user/church/route.ts` — GET (sua igreja), PUT (vincular/trocar), DELETE (desvincular)
- `src/app/api/admin/churches/route.ts` — GET + POST admin
- `src/app/api/admin/churches/[churchId]/route.ts` — PATCH + DELETE admin
- `src/app/api/admin/churches/[churchId]/members/route.ts` — GET (com busca + paginação)
- `src/app/api/admin/churches/[churchId]/members/[userId]/route.ts` — DELETE (remover vínculo)

*Frontend (services + hooks):*
- `src/lib/services/churchService.ts`
- `src/hooks/queries/useChurches.ts` (público)
- `src/hooks/queries/useUserChurch.ts` (singular)
- `src/hooks/queries/useAdminChurches.ts`
- `src/hooks/queries/useChurchMembers.ts`
- `src/hooks/mutations/useUserChurchMutations.ts`
- `src/hooks/mutations/useAdminChurchMutations.ts`

*Types:*
- `src/shared/types/church.ts`

*Components:*
- `src/components/church/ChurchBadge.tsx` (variantes)
- `src/components/church/ChurchSelectorModal.tsx`
- `src/components/church/UserChurchesSection.tsx`
- `src/components/admin/CreateChurchModal.tsx`
- `src/components/admin/EditChurchModal.tsx`
- `src/components/admin/ChurchMembersList.tsx`

*Páginas:*
- `src/app/minha-conta/admin/igrejas/page.tsx`
- `src/app/minha-conta/admin/igrejas/[churchId]/page.tsx`

### Reusable Assets

| Asset | Path | Como reutilizar |
|-------|------|-----------------|
| Entity pattern | `server/domain/event/entities/Event.ts` | Constructor privado, `create()`, `fromPersistence()`, `toJSON()`, `toSummary()` |
| Repository pattern | `server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin.ts` | `getAdminFirestore`, `mapToEntity`, `mapToFirestore`, `parseDate` |
| Use case pattern | `server/application/event/CreateEvent.ts` | `safeParse` + `generateSlug` + `save` |
| Admin API auth | `app/api/admin/events/route.ts:verifyAdmin()` | Reutilizar diretamente |
| Query hooks | `hooks/queries/useEvents.ts` | Query keys factory + `useQuery` |
| Mutation hooks | `hooks/mutations/useAdminEventMutations.ts` | `useMutation` + `invalidateQueries` |
| Service layer | `lib/services/eventService.ts` | `apiClient.get()` → check `success` → return data |
| Admin Modal | `components/admin/CreateEventModal.tsx` | Form com `useState` + mutation + Zod |
| Admin layout/menu | `app/minha-conta/admin/layout.tsx` | Adicionar novo item de menu |
| User entity | `server/domain/user/entities/User.ts` | Estender com `setChurch`/`clearChurch` |
| Permission check | `User.isAdmin()` | Reutilizado em todas as rotas admin |

### Patterns to Follow

1. **Entities:** Constructor privado + `static create()` + `static fromPersistence()` + `toJSON()` + `toSummary()`
2. **Use Cases:** 1 arquivo por ação, Zod `safeParse()`, throw `ValidationError` ou erro de domínio
3. **Repository:** Interface no domain, implementação Firebase na infrastructure
4. **API Routes:** `verifyAdmin()` → use case → `NextResponse.json()`
5. **Hooks:** Query keys factory, staleTime 5min, `invalidateQueries` em mutations
6. **Service:** `apiClient.get()` → check `response.success` → return data or throw
7. **Slug:** `generateSlug(nome)` com possibilidade de override
8. **Transações Firestore:** mudanças que afetam `user.churchId` E `church.totalMembros` rodam em `db.runTransaction()` para garantir consistência
9. **Early return:** funções sem `else` desnecessário
10. **Zero comentários inúteis:** só comentar regras de negócio não óbvias
11. **Design system:** tema escuro + gold accent, `border-gold/20`, `bg-bg-tertiary`, `text-text-primary/secondary/muted`

### Risks & Considerations

1. **Backward compat:** usuários existentes não terão campo `churchId` no Firestore.
   → Repository normaliza para `null` em `mapToEntity`; modal pega na sessão seguinte.

2. **UX do modal:** se aparecer em toda navegação irrita.
   → Dispensável via `sessionStorage[CHURCH_MODAL_DISMISS_KEY]`; reaparece só em nova sessão. Nunca bloqueia.

3. **Reatividade pós-admin-remove:** quando admin remove vínculo, o usuário só percebe quando o perfil for refetchado.
   → Não há push de notificação. O fluxo natural — `/api/auth/me` no próximo load + invalidação React Query — garante que badge passe a "Sem vínculo" e modal reabra. **É comportamento desejado, não bug.**

4. **Concorrência em troca de igreja:** se user troca rapidamente A → B, duas transações concorrentes não podem deixar contadores inconsistentes.
   → `SetUserChurch` usa `db.runTransaction()` que lê o `user.churchId` atual, decrementa `totalMembros` da igreja anterior (se existir) e incrementa da nova, tudo atomicamente.

5. **Performance — lista de membros:** com muitos usuários, query Firestore por `churchId` precisa de índice.
   → Índice composto `users(churchId, nome)` criado via firestore.indexes.json. Paginação cursor-based, limit 50.

6. **Seed da SEDE DE REDENÇÃO:** rodar idempotentemente.
   → Função `seedSedeRedencao()` faz `set` com merge se documento `sede-redencao` não existe; pode rodar no boot do server ou via `scripts/seed-churches.ts`.

7. **SSR & badge:** badge precisa de fallback enquanto perfil carrega.
   → Skeleton com largura fixa para evitar layout shift.

8. **Contador de membros:** denormalizar `totalMembros` no documento da igreja.
   → Atualizar **transacionalmente** dentro dos use cases `SetUserChurch`, `ClearUserChurch`, `AdminRemoveUserFromChurch`. Sem Cloud Functions, sem `count()` em runtime.

9. **Permissão admin de criar igreja:** apenas `role: 'admin'` por ora — registrar como decisão futura migrar para permissão granular `adm-igrejas` quando houver delegação.

10. **Igreja inativada:** usuários vinculados continuam vinculados.
    → `<ChurchBadge>` resolve o nome via cache de churches, mesmo que `ativo: false`. Seletor não a oferece em novos vínculos/trocas.

---

## Firestore Schema

### Coleção: `churches`

```
{
  // Documento ID = slug (string), ex: "sede-redencao"
  nome: string,                   // "SEDE DE REDENÇÃO"
  slug: string,                   // "sede-redencao" (igual ao doc ID)
  cidade?: string,                // "Redenção"
  estado?: string,                // "PA" (UF)
  ativo: boolean,                 // default true
  totalMembros: number,           // denormalizado, default 0
  criadoEm: Timestamp,
  atualizadoEm: Timestamp,
}
```

### Modificação em `users/{uid}`

```
{
  ...campos existentes,
  churchId: string | null,        // novo; default null no signup
}
```

### Índices

- `users` por `churchId` (auto para queries de igualdade)
- Composto: `users(churchId asc, nome asc)` para busca de membros ordenada
- `churches`: composto `ativo asc, nome asc` (para listagem do seletor)

### Seed Inicial

| Slug | Nome | Cidade | Estado | Ativo |
|------|------|--------|--------|-------|
| `sede-redencao` | SEDE DE REDENÇÃO | Redenção | PA | true |

---

## UI/UX

### `<ChurchSelectorModal />`

```
┌────────────────────────────────────────────┐
│  De qual igreja você faz parte?            │
│  ─────────────────────────────────────────  │
│  Selecione uma opção.                      │
│                                            │
│  ◉ SEDE DE REDENÇÃO                       │
│     Redenção · PA                          │
│                                            │
│  Outras unidades aparecerão aqui em breve. │
│                                            │
│  [Agora não]              [Confirmar →]    │
└────────────────────────────────────────────┘
```

### `<ChurchBadge />` — variantes

```
[header]    🏛 SEDE DE REDENÇÃO              (inline, pequeno, gold accent)
[header-0]  ⚠ Sem vínculo · vincular →       (alerta clicável)
[account]   Igreja: SEDE DE REDENÇÃO         (label + valor)
[home]      ┌──────────────────────────────┐
            │ Você é membro de             │
            │ 🏛 SEDE DE REDENÇÃO          │
            └──────────────────────────────┘
[home-0]    ┌──────────────────────────────┐
            │ ⚠ Você ainda não declarou    │
            │   sua igreja                 │
            │           [Selecionar →]     │
            └──────────────────────────────┘
[compact]   🏛 SEDE                          (só ícone + nome curto)
```

### `<UserChurchesSection />` em /minha-conta

```
Minha igreja
───────────────────────────────────────
┌─────────────────────────────────────┐
│ 🏛 SEDE DE REDENÇÃO                │
│    Redenção · PA                    │
│                                     │
│ [Trocar igreja]  [Remover vínculo]  │
└─────────────────────────────────────┘
```

Estado sem vínculo:
```
Minha igreja
───────────────────────────────────────
Você ainda não declarou sua igreja.
                       [Vincular-se →]
```

### Admin `/minha-conta/admin/igrejas`

```
Igrejas                                       [+ Nova igreja]
───────────────────────────────────────────────────────────
Nome                  Slug            Membros  Ativo
───────────────────────────────────────────────────────────
SEDE DE REDENÇÃO      sede-redencao   157      ●
                                               [ver][editar]
───────────────────────────────────────────────────────────
```

### Admin `/minha-conta/admin/igrejas/sede-redencao`

```
SEDE DE REDENÇÃO · Redenção - PA              [editar igreja]
157 membros
───────────────────────────────────────────────────────────
[ 🔍 Buscar por nome ou email ]
───────────────────────────────────────────────────────────
Nome              Email                  Ação
───────────────────────────────────────────────────────────
João da Silva     joao@example.com       [remover vínculo]
Maria Santos      maria@example.com      [remover vínculo]
...
                                          [carregar mais]
```

---

## Resolved Decisions (Clarify Migration 001)

Veja `001_2026-05-15_12-47-06/clarify.md` e `decisions.md` para o detalhe das 6 questões resolvidas:

- **D001-001:** Dispensa do modal via `sessionStorage` (reaparece em nova sessão)
- **D001-002:** Sem notificações ao usuário quando admin remove vínculo — UX reativa cobre
- **D001-003:** Usuário pode se auto-desvincular via `/minha-conta`
- **D001-004:** **1 usuário = 1 igreja por vez** (`churchId: string | null`, sem array)
- **D001-005:** Independência total da spec 002 (Congresso Geração Forte)
- **D001-006:** Contador `totalMembros` mantido por transação Firestore (consistência forte)
