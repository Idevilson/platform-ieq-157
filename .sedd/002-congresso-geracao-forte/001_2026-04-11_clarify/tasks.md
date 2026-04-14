# Tasks — Migration 001

**Migration:** 001
**Timestamp:** 2026-04-11
**Feature:** 002-congresso-geracao-forte
**Parent:** (none)

## Summary

**Total: 52 | Completed: 0 | Pending: 52**

Distribuído por área:
- Foundation (shared types/constants): 5
- Domain (entities/VOs/repositories): 8
- Application (use cases + schemas): 11
- Infrastructure (Firebase + Asaas): 6
- API (route handlers): 5
- Frontend reutilizável (extraído + novo genérico): 8
- Frontend específico do evento: 4
- Admin: 3
- Seed/setup: 2
- Testes (Vitest + Playwright): 9 — inaugura suite

---

## Tasks

### Foundation — Shared Types & Constants

- [ ] **T001-001** [Foundation][Contract] Estender `EventCategoryDTO` em `src/shared/types/event.ts` com `earlyBirdValor`, `earlyBirdValorFormatado`, `earlyBirdDeadline`, `beneficiosInclusos`, `valorAtual`, `valorAtualFormatado`, `earlyBirdAtivo` *(US1, US2)*
- [ ] **T001-002** [Foundation][Contract] Criar `EventPerkDTO` em `src/shared/types/event.ts` com `id`, `eventId`, `nome`, `descricao`, `limiteEstoque`, `quantidadeAlocada`, `quantidadeRestante`, `disponivel` *(US1, US4)*
- [ ] **T001-003** [Foundation][Contract] Estender `InscriptionDTO` em `src/shared/types/inscription.ts` (criar arquivo se não existir) com `numeroInscricao: number`, `temBrinde: boolean`, `perkId?: string`, `brindeAlocadoEm?: string` *(US4, US6)*
- [ ] **T001-004** [Foundation][Contract] Estender `PaymentDTO` em `src/shared/types/payment.ts` com `breakdown: PaymentBreakdownDTO | null` (campos `valorBase`, `valorTaxa`, `valorTotal`, `metodo`, `parcelas?`, `valorParcela?`) *(US3)*
- [ ] **T001-005** [Foundation][Contract] Adicionar `'CREDIT_CARD'` ao enum `PaymentMethod` em `src/shared/constants/` *(US3)*

### Domain — Entities, Value Objects, Repository Interfaces

- [ ] **T001-006** [Domain] Estender `EventCategory` entity (`src/server/domain/event/entities/EventCategory.ts`) com props `earlyBirdValor?: Money`, `earlyBirdDeadline?: Date`, `beneficiosInclusos: string[]` + método público `getCurrentPrice(now: Date): Money` + getter `isEarlyBirdAtivo(now: Date)` *(US2, FR-02)*
- [ ] **T001-007** [Domain] Criar entity `EventPerk` em `src/server/domain/event/entities/EventPerk.ts` com factory `create()` / `fromPersistence()`, propriedades `nome`, `descricao`, `limiteEstoque`, `quantidadeAlocada` (derivada), método `disponivel(): boolean` *(US4, FR-04)*
- [ ] **T001-008** [Domain] Estender `Inscription` entity (`src/server/domain/inscription/entities/Inscription.ts`) com `temBrinde?: boolean` (undefined até webhook, depois true/false), `perkId?: string`, `brindeAlocadoEm?: Date`. *(`temBrinde === undefined` é o sentinel de "não processado pelo webhook ainda" — usado como guard de idempotência)* *(US4, US7)*
- [ ] **T001-009** [Domain] Criar VO `PaymentBreakdown` em `src/server/domain/shared/value-objects/PaymentBreakdown.ts` (imutável, com `valorBase`, `valorTaxa`, `valorTotal`, `metodo`, `parcelas?`, `valorParcela?`) + método `toJSON()` *(US3, FR-06)*
- [ ] **T001-010** [Domain] Estender `Payment` entity (`src/server/domain/payment/entities/Payment.ts`) com `breakdown: PaymentBreakdown | null` *(US3)*
- [ ] **T001-011** [Domain] Criar interface `IEventPerkRepository` em `src/server/domain/event/repositories/IEventPerkRepository.ts` com métodos `save(perk)`, `findById(eventId, perkId)`, `findByEventId(eventId)`, e `allocateToInscription(eventId, perkId, inscriptionId): Promise<boolean>` (operação atômica via Firestore transaction; idempotente; retorna true se alocou, false se estoque esgotado) *(US4, FR-04, FR-05)*
- [ ] **T001-012** [Domain] Adicionar getter `EventPerk.canAllocate(): boolean` (retorna `quantidadeAlocada < limiteEstoque`) — método puro, sem efeito colateral *(US4)*
- [ ] **T001-013** [Domain] Estender `IPaymentRepository` para persistir e recuperar `breakdown` *(US3)*

### Application — Use Cases + Zod Schemas

- [ ] **T001-014** [App][Schema] Atualizar Zod schema de `EventCategory` em `src/server/application/event/schemas.ts` (adicionar `earlyBirdValor`, `earlyBirdDeadline`, `beneficiosInclusos`) *(US2)*
- [ ] **T001-015** [App][Schema] Criar Zod schema `EventPerk` em `src/server/application/event/schemas.ts` *(US4)*
- [ ] **T001-016** [App][Schema] Atualizar Zod schema de `CreatePayment` para aceitar `metodo: 'PIX' | 'CREDIT_CARD'`, `parcelas?: number`, `creditCardToken?: string` *(US3)*
- [ ] **T001-017** [App] Refatorar `CreateInscription` (`src/server/application/inscription/CreateInscription.ts`) para calcular preço via `EventCategory.getCurrentPrice(now)` em vez de aceitar valor do front. Inscrição é criada com `temBrinde: undefined` (será setado pelo webhook). *(US2, FR-02, FR-03)*
- [ ] **T001-018** [App] Aplicar mesma refatoração em `CreateGuestInscription` *(US2)*
- [ ] **T001-019** [App] Refatorar `CreatePaymentForInscription` (`src/server/application/payment/CreatePaymentForInscription.ts`) para: (a) aceitar `metodo` e `parcelas`, (b) calcular `breakdown` via `AsaasService.calculateTotalForBase`, (c) chamar Asaas com `valorTotal` para que `netValue >= valorBase`, (d) persistir `Payment.breakdown` *(US3, FR-06, FR-07)*
- [ ] **T001-020** [App] Refatorar `ProcessAsaasWebhook` (`src/server/application/payment/ProcessAsaasWebhook.ts`) para FIFO por pagamento confirmado: (a) guard de idempotência checando `inscription.temBrinde !== undefined`, (b) iniciar Firestore transaction que confirma pagamento + confirma inscrição + chama `eventPerkRepository.allocateToInscription` atomicamente, (c) setar `temBrinde = true/false` conforme retorno da alocação *(US4, FR-05, NFR-Concorrência, NFR-Idempotência)*
- [ ] **T001-021** [App] Criar use case `CreateEventPerk` *(US5)*
- [ ] **T001-022** [App] Criar use case `ListEventPerks` (admin — full DTO) *(US6)*
- [ ] **T001-023** [App] Criar use case `GetPerkSummary` (público — apenas `quantidadeRestante`, `limiteEstoque`, `disponivel`) *(US1, FR-08)*
- [ ] **T001-024** [App] Criar use case `ListPerkHolders` (admin — lista paginada de inscrições com `temBrinde=true`) *(US6)*

### Infrastructure — Firebase & Asaas

- [ ] **T001-025** [Infra] Criar `FirebaseEventPerkRepositoryAdmin` em `src/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin.ts` implementando `IEventPerkRepository`. O método `allocateToInscription` usa `db.runTransaction()`: lê perk doc, lê inscription doc (idempotência: se `temBrinde !== undefined`, abort), se `quantidadeAlocada < limiteEstoque` incrementa perk e marca inscription, senão só marca inscription com `temBrinde=false`. *(US4, FR-04, FR-05, NFR-Concorrência, NFR-Idempotência)*
- [ ] **T001-026** [Infra] Persistência da subcollection `events/{eventId}/perks/{perkId}` (sem operações de contador — não há mais contador) *(US4, US5)*
- [ ] **T001-027** [Infra] Estender `FirebasePaymentRepositoryAdmin` com persistência de `breakdown` (campos `valorBase`, `valorTaxa`, `valorTotal`, `metodo`, `parcelas`, `valorParcela`) *(US3)*
- [ ] **T001-028** [Infra] Estender `AsaasService.createPayment` para suportar `billingType: 'CREDIT_CARD'` com `creditCardToken` (tokenização SDK) e `installmentCount?` *(US3)*
- [ ] **T001-029** [Infra] Adicionar método `AsaasService.calculateTotalForBase(valorBase, metodo, parcelas?): Promise<PaymentBreakdownDTO>` que usa o `netValue` do Asaas e devolve breakdown completo *(US3, FR-06, FR-07)*
- [ ] **T001-030** [Infra] Adicionar `NEXT_PUBLIC_ASAAS_PUBLIC_KEY` ao `.env.example` (verificar se já existe) e documentar no README *(US3)*

### API — Route Handlers

- [ ] **T001-031** [API] Criar `GET /api/events/[eventId]/perks/summary` (público — para o contador na página) *(US1, FR-08)*
- [ ] **T001-032** [API] Criar `POST /api/admin/events/[eventId]/perks` (admin — criar perk) *(US5, FR-09)*
- [ ] **T001-033** [API] Criar `GET /api/admin/events/[eventId]/perks` (admin — lista completa) *(US6, FR-09)*
- [ ] **T001-034** [API] Criar `GET /api/admin/events/[eventId]/perks/[perkId]/holders?page=N` (admin — quem tem direito) *(US6)*
- [ ] **T001-035** [API] Atualizar `POST /api/inscriptions/[inscriptionId]/payment` para aceitar `metodo`, `parcelas`, `creditCardToken` no body *(US3)*

### Frontend — Componentes reutilizáveis (extraídos + novos)

- [ ] **T001-036** [Front] **Extrair** componente `EventConfirmationPage` em `src/components/eventos/EventConfirmationPage.tsx` a partir de `src/app/(main)/eventos/startup/confirmado/page.tsx`. Recebe props: `eventId`, `eventName`, `eventDates`, `eventLocation`, `branding` (cores/logo) *(US7, FR-12)*
- [ ] **T001-037** [Front] **Extrair** hook `usePaymentPolling(inscriptionId)` em `src/hooks/usePaymentPolling.ts` (polling 30s + backoff) *(US7, FR-13)*
- [ ] **T001-038** [Front] Refatorar `src/app/(main)/eventos/startup/confirmado/page.tsx` para wrapper fino que renderiza `<EventConfirmationPage>` com props do startup. **Garantir não-regressão visual.** *(US7)*
- [ ] **T001-039** [Front] Criar `PaymentMethodSelector` em `src/components/payment/PaymentMethodSelector.tsx` (PIX vs Cartão, com preview de breakdown) *(US3)*
- [ ] **T001-040** [Front] Criar `CardPaymentForm` em `src/components/payment/CardPaymentForm.tsx` integrando Asaas SDK de tokenização. Expõe callback `onTokenized(token)` *(US3)*
- [ ] **T001-041** [Front] Criar `InstallmentSelector` em `src/components/payment/InstallmentSelector.tsx` (1x a 12x com valor por parcela e total) *(US3)*
- [ ] **T001-042** [Front] Estender `CategorySelector` (`src/components/inscription/CategorySelector.tsx`) para mostrar early bird vs preço cheio + lista de `beneficiosInclusos` como checkmarks *(US1, US2)*
- [ ] **T001-043** [Front] Criar `PerkCounter` em `src/components/eventos/PerkCounter.tsx` (contador "X de Y restantes" com fetch via TanStack Query, refetch a cada 30s) *(US1, US4)*
- [ ] **T001-044** [Front] Criar `CheckoutSummary` em `src/components/payment/CheckoutSummary.tsx` (mostra `valorBase + valorTaxa = valorTotal`) *(US3)*

### Frontend — Páginas específicas do Geração Forte

- [ ] **T001-045** [Front] Criar `src/app/(main)/eventos/geracao-forte/page.tsx` espelhando o padrão do startup: hero com `follow-me-logo.png`, descrição com Marcos 8:34, card de brinde com `<PerkCounter>`, seção de programação (3 cards placeholder), seção de inscrição com `<SmartInscriptionForm>` e `<CategorySelector>` estendido *(US1, FR-01)*
- [ ] **T001-046** [Front] Criar `src/app/(main)/eventos/geracao-forte/confirmado/page.tsx` como wrapper fino renderizando `<EventConfirmationPage>` com props da Geração Forte *(US7)*
- [ ] **T001-047** [Front] Importar `src/assets/images/geracao-forte/follow-me-logo.png` na página (asset já movido) *(US1)*
- [ ] **T001-048** [Front] Adicionar evento Geração Forte à listagem em `/eventos` (via API, deve aparecer automaticamente após seed) — validar o `EventCard` *(US1)*

### Admin

- [ ] **T001-049** [Admin] Adicionar card "Brindes restantes: X / 500" na página `src/app/minha-conta/admin/eventos/[id]/page.tsx`, com fetch do `GetPerkSummary` *(US6, FR-11)*
- [ ] **T001-050** [Admin] Adicionar tabela paginada "Quem tem direito ao brinde" usando `ListPerkHolders` *(US6)*
- [ ] **T001-051** [Admin] Adicionar botão "Exportar CSV" na tabela de holders *(US6)*

### Seed / Setup

- [ ] **T001-052** [Seed] Criar `scripts/seed-geracao-forte.ts` (idempotente): cria evento `geracao-forte`, 2 categorias (Redenção R$120/150, Outras Localidades R$200/250 com `beneficiosInclusos: ['Almoço', 'Janta']`), 1 perk "Pulseira Geração Forte" com `limiteEstoque: 500`, `quantidadeAlocada: 0` *(US5, FR-10)*

### Testes (inaugura suite)

- [ ] **T001-053** [Test][Unit] `EventCategory.getCurrentPrice` — early bird ativo (now < deadline), expirado (now > deadline), sem early bird (props undefined) *(FR-02)*
- [ ] **T001-054** [Test][Unit] `PaymentBreakdown` VO — criação, imutabilidade, `toJSON()` *(FR-06)*
- [ ] **T001-055** [Test][Unit] `AsaasService.calculateTotalForBase` — para PIX (sem parcelas), CREDIT_CARD à vista, CREDIT_CARD parcelado 12x. Mock do response Asaas com `netValue` *(FR-07)*
- [ ] **T001-056** [Test][Integration] `eventPerkRepository.allocateToInscription` sob concorrência — disparar 600 alocações simultâneas em um perk com `limiteEstoque: 500`, esperar exatamente 500 `temBrinde=true` e 100 `temBrinde=false`. Usa Firestore Emulator. *(FR-05, NFR-Concorrência)*
- [ ] **T001-057** [Test][Integration] `ProcessAsaasWebhook` — chamar webhook 2x para o mesmo pagamento NÃO incrementa `quantidadeAlocada` 2x (idempotência via guard `temBrinde !== undefined`). Chamar webhook após estoque esgotado → `temBrinde=false`, inscrição confirmada normalmente. *(FR-05, NFR-Idempotência)*
- [ ] **T001-058** [Test][E2E] Visitante acessa `/eventos/geracao-forte` (data simulada antes de 31/05), vê early bird, escolhe Redenção, preenche guest form, recebe PIX, simula webhook → confirmado com brinde *(US1, US2, US4)*
- [ ] **T001-059** [Test][E2E] Mesmo fluxo com cartão de crédito tokenizado (mock SDK), parcelado 3x *(US3)*
- [ ] **T001-060** [Test][E2E] Visitante acessa após 31/05 — vê preço cheio em ambas as categorias *(US2)*
- [ ] **T001-061** [Test][Visual] Snapshot de `/eventos/startup/confirmado` antes e depois do refator (não-regressão) *(US7)*

---

## Dependencies

```
[Foundation: T001-001..005]
       ↓
[Domain: T001-006..013]
       ↓
[App: T001-014..024] ←→ [Infra: T001-025..030]
       ↓                      ↓
[API: T001-031..035] ←————————┘
       ↓
[Front reusable: T001-036..044]
       ↓
[Front geracao-forte: T001-045..048] + [Admin: T001-049..051]
       ↓
[Seed: T001-052]
       ↓
[Tests: T001-053..061] (paralelo desde T001-006)
```

**Caminho crítico**: Foundation → Domain → CreateInscription transactional (T001-017) + AsaasService (T001-028, T001-029) → API → Front. O refator do startup (T001-036..038) pode rodar em paralelo desde o início.

---

## Acceptance Criteria

Ver `acceptance.md` para checklist de verificação.
