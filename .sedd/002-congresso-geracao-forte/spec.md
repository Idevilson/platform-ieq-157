# Feature 002 — Congresso Setorizado da Geração Forte

**ID:** 002
**Branch:** (sem branch dedicada — trabalho na branch atual)
**Created:** 2026-04-11
**Status:** spec

---

## Expectation

Quando esta feature estiver pronta:

1. **Acesso público**: Eu (visitante ou membro) consigo acessar `/eventos/geracao-forte` e ver uma página completa do *Congresso Setorizado da Geração Forte* — tema *Follow Me* (Marcos 8:34) — com logo, descrição, programação, local e CTA "Inscreva-se agora", seguindo o mesmo padrão visual e técnico de `/eventos/startup`.

2. **Categorias com early bird**: Posso escolher entre **Redenção** (R$ 120 até 31/05, R$ 150 após) e **Outras Localidades** (R$ 200 até 31/05, R$ 250 após — inclui almoço e janta, claramente sinalizado no card). O preço é calculado dinamicamente pelo backend conforme a data atual vs. `earlyBirdDeadline`.

3. **Taxa Asaas repassada ao cliente**: Antes de pagar, vejo o valor final já com a taxa do Asaas embutida (base + taxa). A igreja recebe líquido o valor base da categoria. Aplica-se a TODOS os fluxos de pagamento da plataforma, não só este evento.

4. **Contador de brinde ao vivo**: Vejo quantas pulseiras coloridas ainda restam dos 500 brindes. Se eu estiver dentro dos 500 quando me inscrevo, aparece "Você vai ganhar a pulseira de brinde 🎁".

5. **Inscrição + PIX**: Me inscrevo (logado ou guest via `SmartInscriptionForm`), gero PIX no Asaas, pago, e sou redirecionado para `/eventos/geracao-forte/confirmado` com polling até confirmação.

6. **Alocação atômica do brinde**: Após o webhook confirmar o pagamento, se eu estiver entre os 500 primeiros pagantes, fica registrado na minha inscrição `temBrinde: true`. Sem race condition mesmo com inscrições simultâneas (Firestore transaction).

7. **Admin (criação)**: Eu, admin, consigo criar o evento com as duas categorias, datas de virada e regra dos 500 brindes via seed/script ou painel.

8. **Admin (acompanhamento)**: No painel admin do evento, vejo "Brindes restantes: X / 500", lista de quem tem direito, e consigo exportar.

9. **Modelo extensível**: `EventCategory` ganha `earlyBirdPrice` e `earlyBirdDeadline` (não hardcoded para este evento). Existe entity `EventPerk` reutilizável com `limiteEstoque`.

10. **Taxa por método**: Taxa do Asaas é calculada por método (PIX/boleto/cartão) usando o `netValue` que o Asaas já retorna na resposta de criação de pagamento.

11. **Testes**: Suite cobrindo cálculo de early bird, repasse de taxa, alocação atômica de brinde, e fluxo E2E de inscrição → pagamento → webhook → confirmação com brinde.

---

## Architecture Analysis

### Current Architecture (Relevant)

DDD strict em Next.js 15 App Router:

- **Domain** (`src/server/domain/`): Entities (`Event`, `EventCategory`, `Inscription`, `Payment`), Value Objects (`Money`, `CPF`, `Email`), Repository interfaces.
- **Application** (`src/server/application/`): Use cases (`CreateEvent`, `CreateInscription`, `CreatePaymentForInscription`, `ProcessAsaasWebhook`), schemas Zod.
- **Infrastructure** (`src/server/infrastructure/`): `firebase/repositories/Firebase*Admin.ts` (impl Firestore), `asaas/AsaasService.ts` (wrapper SDK Asaas).
- **API** (`src/app/api/`): Route handlers Next.js — `/api/events`, `/api/inscriptions`, `/api/inscriptions/[id]/payment`, `/api/webhooks/asaas`.
- **Front** (`src/app/(main)/`, `src/components/`, `src/hooks/queries/`): Páginas, componentes, TanStack Query hooks.

### Impact Assessment

- **Files to modify:** ~15
- **Files potentially affected:** ~8 (todos os fluxos de pagamento — escopo plataforma-wide para taxa)
- **DB changes needed:** Sim — campos `earlyBirdPrice`, `earlyBirdDeadline` em categories; nova subcollection `events/{id}/perks`; campos `valorBase`, `valorTaxa`, `valorTotal` em payments; campo `temBrinde`, `perkId` em inscriptions.
- **API changes needed:** Sim — novos endpoints `/api/admin/events/[id]/perks` (CRUD) e `/api/events/[id]/perks` (read público para contador). Resposta de payment ganha campos de taxa.

### Reusable Assets

- **Componentes**: `SmartInscriptionForm`, `UserInscriptionForm`, `GuestInscriptionForm`, `CategorySelector`, `AlreadyInscribedCard`, `EventCard`, `ShareableReceipt`.
- **Hooks**: `useEventById`, `useEventCategories`, `useUserInscriptionByEvent`, `useAuth`.
- **Services**: `eventService`, `asaasService.findOrCreateCustomer`, `asaasService.createPayment` (já retorna `netValue`).
- **VOs**: `Money` (centavos imutáveis), `CPF`, `Email`, `Phone`.
- **Formatters**: `formatCurrency`, `formatDate`, `formatDateTime`.

### Patterns to Follow

- **Entity factory**: `EventCategory.create(id, dto)` + `EventCategory.fromPersistence(data)` — padrão obrigatório para `EventPerk`.
- **Repository interface no domain, impl na infra**: `IEventRepository` ↔ `FirebaseEventRepositoryAdmin`.
- **Use case por arquivo** com construtor injetando repositórios.
- **Schema Zod** em `application/{módulo}/schemas.ts`, validado no início do `execute()` do use case.
- **Value Object** para qualquer valor monetário (`Money`).

### Risks & Tech Debt

- `/eventos/startup/page.tsx` tem dados hardcoded em arrays mapeados (ex.: `['Compreender...', 'Discernir...']`) — vamos seguir o mesmo padrão (página é flagship, customizada) mas extrair `EventConfirmationPage` reutilizável da `startup/confirmado`.
- Projeto **não tem testes** hoje. Esta feature inaugura a suite Vitest + Playwright.
- `AsaasService.createPayment` já retorna `netValue` (linha 39) — taxa pode ser obtida sem hardcoding por método.
- Webhook atual (`ProcessAsaasWebhook`) confirma inscrição mas NÃO usa Firestore transaction — precisamos refatorar para atomicidade quando alocar perk.
- Não existe noção de "perk", "benefit" ou "reward" no domínio — é conceito 100% novo.

### Recommended Approach

1. **Estender `EventCategory`** com `earlyBirdPrice?: Money`, `earlyBirdDeadline?: Date`, `beneficiosInclusos: string[]` + método `getCurrentPrice(now: Date): Money`.
2. **Criar `EventPerk` entity** + `IEventPerkRepository` + `FirebaseEventPerkRepositoryAdmin` + use cases `CreateEventPerk`, `AllocatePerkToInscription`.
3. **Estender `Payment`** com `valorBase: Money`, `valorTaxa: Money`, `valorTotal: Money` (ou usar VO `PaymentBreakdown`).
4. **Refatorar `CreatePaymentForInscription`** para: (a) calcular taxa via Asaas `netValue`, (b) salvar breakdown.
5. **Refatorar `ProcessAsaasWebhook`** para usar Firestore transaction quando alocar perk.
6. **Criar página** `src/app/(main)/eventos/geracao-forte/page.tsx` espelhando `startup/page.tsx`.
7. **Extrair** `src/components/eventos/EventConfirmationPage.tsx` reutilizável + hook `usePaymentPolling`.
8. **Seed script** `scripts/seed-geracao-forte.ts` para criar o evento + categorias + perk no Firestore.
9. **Painel admin** ganha card de brindes restantes.
10. **Suite de testes** completa.

---

## Architecture Contract (IMUTÁVEL)

### Tech Stack

| Camada | Tecnologia | Localização |
|---|---|---|
| State / data fetching | TanStack Query | `src/hooks/queries/` |
| Forms | React Hook Form + Zod | `src/components/inscription/` |
| Validation | Zod | `src/server/application/*/schemas.ts` |
| Domain | DDD entities + VOs | `src/server/domain/` |
| Use Cases | Application classes | `src/server/application/` |
| Persistência | Firebase Admin SDK | `src/server/infrastructure/firebase/repositories/` |
| Pagamento | `AsaasService` | `src/server/infrastructure/asaas/` |
| API | Next.js Route Handlers | `src/app/api/` |
| Testes unit | Vitest | `tests/unit/` |
| Testes e2e | Playwright | `tests/e2e/` |

### Pattern Bindings

| Padrão | Onde usar |
|---|---|
| Entity factory `create()` / `fromPersistence()` | Toda entity |
| Value Object imutável | Valores monetários, CPF, datas com regra |
| Repository interface no domain, impl na infra | Persistência |
| Use case por arquivo | Toda operação de aplicação |
| Zod schema separado por use case | Input validation |
| TanStack Query hooks | Leitura de dados no front |
| Firestore transaction | Operações com invariante de estoque |

### Location Bindings

| Tipo | DEVE ficar em | NUNCA criar em |
|---|---|---|
| Nova entity | `src/server/domain/event/entities/` | `application/` |
| Novo VO | `src/server/domain/shared/value-objects/` | duplicar entre módulos |
| Use case | `src/server/application/{módulo}/` | dentro de `route.ts` |
| Schema Zod | `src/server/application/{módulo}/schemas.ts` | dentro da entity |
| Repositório (impl) | `src/server/infrastructure/firebase/repositories/` | em `domain/` |
| Página do evento | `src/app/(main)/eventos/geracao-forte/` (hardcoded) | — |
| Componentes específicos do evento | `src/components/eventos/geracao-forte/` | em `app/` |
| Componentes reutilizáveis | `src/components/eventos/` | duplicar por evento |
| DTOs compartilhados | `src/shared/types/` | duplicar em FE/BE |

### Contract Bindings (compartilhado FE ↔ BE)

| Contrato | Localização | Usado por |
|---|---|---|
| `EventCategoryDTO` (estendido) | `src/shared/types/event.ts` | front + back |
| `EventPerkDTO` (novo) | `src/shared/types/event.ts` | front + back |
| `PaymentDTO` (estendido com `valorBase`, `valorTaxa`, `valorTotal`) | `src/shared/types/payment.ts` | front + back |
| `InscriptionDTO` (com `temBrinde`, `perkId`) | `src/shared/types/inscription.ts` | front + back |

### Decisões-chave

1. **Rota hardcoded** `/eventos/geracao-forte` (segue padrão `startup`).
2. **Taxa Asaas** lida do `netValue` retornado pelo SDK — escopo plataforma-wide. Pagamentos antigos não são alterados.
3. **EventPerk** como entity nova, persistido em subcollection `events/{id}/perks/{perkId}`. Alocação via Firestore transaction no `ProcessAsaasWebhook`.
4. **Early bird** como propriedade da `EventCategory` (campos opcionais), método `getCurrentPrice(now: Date)`.
5. **Refator** de `startup/confirmado` para extrair `EventConfirmationPage` + `usePaymentPolling`.
6. **Testes obrigatórios** — Vitest + Playwright (inaugura suite).

---

## User Stories

### US1 — Visualizar página do evento (público)
**Como** visitante
**Quero** acessar `/eventos/geracao-forte`
**Para** conhecer o Congresso Setorizado da Geração Forte e me inscrever

**Critérios:**
- Página exibe logo "Follow Me" (`MARCA-DAGUA-02.png`), tema, descrição, datas, local
- Mostra as duas categorias com preço atual (early bird ou cheio, conforme data)
- Card "Outras Localidades" sinaliza claramente "inclui almoço e janta"
- Card de brinde mostra "X de 500 pulseiras restantes" em tempo real
- CTA "Inscreva-se agora" leva ao formulário

### US2 — Inscrição com early bird (visitante ou logado)
**Como** participante
**Quero** me inscrever escolhendo categoria
**Para** garantir minha vaga no menor preço possível

**Critérios:**
- Backend calcula preço pela data atual vs `earlyBirdDeadline` (não confia no front)
- Form aceita user logado OU guest (com CPF)
- Deduplicação por CPF/userId no evento
- Após criar inscrição, é redirecionado para checkout PIX

### US3 — Pagamento com taxa repassada
**Como** participante
**Quero** ver o valor total já com a taxa antes de pagar
**Para** entender exatamente o que vou pagar

**Critérios:**
- Tela de pagamento mostra: "Valor da inscrição R$ X + taxa Asaas R$ Y = Total R$ Z"
- Asaas é chamado com valor que resulte em `netValue >= preçoBase`
- `Payment` persistido com `valorBase`, `valorTaxa`, `valorTotal`
- **Aplica em todos os fluxos de pagamento da plataforma**, não só este evento

### US4 — Confirmação e alocação atômica de brinde
**Como** participante pagante
**Quero** que meu brinde seja alocado assim que o pagamento confirma
**Para** ter certeza de que vou receber a pulseira

**Critérios:**
- Webhook Asaas (`PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED`) confirma inscrição E aloca perk em uma única Firestore transaction
- Se já houver 500 alocados, inscrição é confirmada SEM perk (`temBrinde: false`)
- Sem race condition: 501 webhooks simultâneos → exatamente 500 com brinde
- Página `/eventos/geracao-forte/confirmado` faz polling e mostra status + se ganhou brinde

### US5 — Admin: criar evento e perks
**Como** admin
**Quero** criar o evento Geração Forte com categorias e perk de 500 pulseiras
**Para** lançar a inscrição

**Critérios:**
- Seed script `scripts/seed-geracao-forte.ts` cria evento + 2 categorias + 1 perk
- Script é idempotente (safe to re-run)
- Endpoint `POST /api/admin/events/[id]/perks` permite criar perks via painel também

### US6 — Admin: acompanhar brindes
**Como** admin
**Quero** ver brindes restantes e quem tem direito
**Para** organizar a entrega no evento

**Critérios:**
- Painel admin do evento mostra "Brindes restantes: X / 500"
- Lista paginada de inscrições com `temBrinde: true`
- Export CSV da lista

### US7 — Cobertura de testes
**Como** desenvolvedor
**Quero** testes cobrindo as regras críticas
**Para** garantir que early bird, taxa e brinde funcionam sob concorrência

**Critérios:**
- Unit (Vitest): `EventCategory.getCurrentPrice`, `EventPerk.allocate`, cálculo de taxa repassada
- Integration: `ProcessAsaasWebhook` com 600 chamadas concorrentes — exatamente 500 alocações
- E2E (Playwright): visitante cria inscrição → recebe PIX → webhook simula pagamento → vê brinde no comprovante

---

## Functional Requirements

| ID | Requisito | Status |
|---|---|---|
| FR-01 | Página `/eventos/geracao-forte` renderiza hero, descrição, categorias, brinde, CTA | — |
| FR-02 | `EventCategory.getCurrentPrice(now)` retorna early bird ou cheio | — |
| FR-03 | Backend calcula preço no `CreateInscription` (não confia em valor enviado pelo front) | — |
| FR-04 | `EventPerk` entity com `limiteEstoque`, `quantidadeAlocada`, `allocate()` | — |
| FR-05 | `ProcessAsaasWebhook` aloca perk em Firestore transaction | — |
| FR-06 | `Payment` persiste `valorBase`, `valorTaxa`, `valorTotal` | — |
| FR-07 | Asaas é chamado com valor calculado para que `netValue >= valorBase` | — |
| FR-08 | Endpoint público `GET /api/events/[id]/perks` retorna `{ remaining, total }` | — |
| FR-09 | Endpoint admin CRUD `/api/admin/events/[id]/perks` | — |
| FR-10 | Seed `scripts/seed-geracao-forte.ts` idempotente | — |
| FR-11 | Painel admin mostra brindes restantes + lista exportável | — |
| FR-12 | `EventConfirmationPage` reutilizável extraído de `startup/confirmado` | — |
| FR-13 | `usePaymentPolling` hook reutilizável | — |
| FR-14 | Suite de testes Vitest + Playwright cobrindo FR-02, FR-04, FR-05, FR-06, fluxo E2E | — |

---

## Non-Functional Requirements

- **Concorrência**: 600 webhooks simultâneos → exatamente 500 perks alocados (Firestore transaction).
- **Idempotência**: Webhook recebido 2x para o mesmo pagamento NÃO aloca 2 perks.
- **Performance**: Página de evento carrega < 2s no 4G; contador de brinde tolera staleness de até 30s.
- **Auditoria**: Toda alocação de perk loga `inscriptionId`, `perkId`, `timestamp`, `webhookEventId`.

---

## Open Questions / NEEDS_CLARIFICATION

- [NEEDS_CLARIFICATION] **Datas do evento**: data(s) e horário(s) exatos do congresso? Local específico (endereço completo)?
- [NEEDS_CLARIFICATION] **Programação**: lista de palestrantes, ministrações, horários — ou deixar página com seção genérica até definirem?
- [NEEDS_CLARIFICATION] **Cores das pulseiras**: "pulseira colorida" — qual cor? Há mais de uma cor (uma por categoria)?
- [NEEDS_CLARIFICATION] **Almoço/janta para "Outras Localidades"**: quantas refeições? Vouchers? Pulseira diferente?
- [NEEDS_CLARIFICATION] **Métodos de pagamento**: só PIX como hoje? Habilitar boleto/cartão (com taxas diferentes)?
- [NEEDS_CLARIFICATION] **Prazo do early bird**: 31/05 termina às 23:59:59 do horário de Brasília? Confirmar timezone.
- [NEEDS_CLARIFICATION] **Refator do startup**: refatorar `startup/confirmado` para `EventConfirmationPage` reutilizável faz parte desta feature ou vira spec separada?
- [NEEDS_CLARIFICATION] **Política para os 500 brindes**: alocar por ordem de pagamento confirmado (FIFO) ou por ordem de criação da inscrição?
- [NEEDS_CLARIFICATION] **Lugar da MARCA-DAGUA-02.png**: mover para `src/assets/images/geracao-forte/` (importada) ou `public/images/geracao-forte/` (servida estaticamente)?

---

## Acceptance Criteria (resumo)

A feature está pronta quando:
- [ ] `/eventos/geracao-forte` renderiza completa, com contador de brindes em tempo real
- [ ] Inscrição funciona para visitante e logado
- [ ] Preço é calculado pelo backend conforme data
- [ ] Pagamento PIX exibe breakdown da taxa antes de confirmar
- [ ] Webhook aloca perk atomicamente, sem race condition (verificado por teste de carga)
- [ ] Painel admin mostra brindes restantes
- [ ] Suite de testes (unit + integration + e2e) passa
- [ ] Todas as `NEEDS_CLARIFICATION` resolvidas
