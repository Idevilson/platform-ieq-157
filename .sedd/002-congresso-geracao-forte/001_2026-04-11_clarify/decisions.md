# Decisions — Migration 001

## D001-001: Datas do evento
**Source:** Q1 (user-req)
**Decision:** Congresso acontece de **03/07/2026 a 05/07/2026** (3 dias).
**Impact:** Página exibe "03–05 de julho de 2026". Campo `dataInicio`/`dataFim` no documento `events/geracao-forte`. Não afeta lógica de early bird (early bird = 31/05).

## D001-002: Local exato fica configurável
**Source:** Q1 (decision)
**Decision:** Endereço/local exato ainda não definido. Página lê do banco e exibe "Local a definir" se vazio. Admin pode editar via `PATCH /api/admin/events/geracao-forte`.
**Impact:** Não bloqueia desenvolvimento.

## D001-003: Programação placeholder
**Source:** Q2 (decision)
**Decision:** Página renderiza 3 cards (um por dia) com placeholder "Programação em breve". Estrutura de dados de programação editável fica para spec futura.
**Impact:** Página entrega valor sem depender da programação fechada.

## D001-004: Pulseira sem campo de cor no domínio
**Source:** Q3 (decision)
**Decision:** `EventPerk` tem `nome` e `descricao` apenas. Cor da pulseira é decisão operacional.
**Impact:** Modelo permanece genérico e reutilizável.

## D001-005: Benefícios estruturados no card
**Source:** Q4 (user-req)
**Decision:** `EventCategory.beneficiosInclusos: string[]` exibido como lista de checkmarks no card.
- Redenção → `[]`
- Outras Localidades → `["Almoço", "Janta"]`

## D001-006: PIX + Cartão com repasse integral de taxa
**Source:** Q5 (user-req)
**Decision:**
1. Métodos habilitados: PIX e Cartão de Crédito (boleto fora do escopo).
2. Repasse **INTEGRAL** da taxa Asaas ao cliente para AMBOS os métodos.
3. Aplicação **plataforma-wide**: todos os fluxos de pagamento existentes ganham o repasse, não só geracao-forte.
4. Cartão à vista (sem parcelamento) por default — parcelamento fica como pendência a confirmar.
5. UI de checkout exibe seleção de método antes do pagamento, com breakdown de taxa por método.
**Impact:**
- `CreatePaymentForInscription` recebe `metodo: 'PIX' | 'CREDIT_CARD'` como parâmetro
- `Payment` ganha breakdown (`valorBase`, `valorTaxa`, `valorTotal`, `metodo`)
- `AsaasService` ganha helper `calculateTotalForBase(valorBase, metodo)` que usa o `netValue` retornado pelo Asaas
- Pagamentos antigos (anteriores ao deploy) não são alterados — campos novos ficam null
- Componente `PaymentMethodSelector` novo

## D001-007: Early bird America/Sao_Paulo
**Source:** Q6 (decision)
**Decision:** `earlyBirdDeadline = 2026-05-31T23:59:59-03:00`. Comparação no backend usa `Date` em UTC.
**Impact:** Armazenado como Firestore Timestamp; `getCurrentPrice(now: Date)` na entity.

## D001-008: Refator startup/confirmado faz parte da feature
**Source:** Q7 (user-req)
**Decision:**
1. Extrair componente `EventConfirmationPage` (recebe props: `eventId`, `eventName`, `theme`, `eventDates`, `eventLocation`, `branding`).
2. Extrair hook `usePaymentPolling(inscriptionId)`.
3. Página atual `src/app/(main)/eventos/startup/confirmado/page.tsx` passa a ser um wrapper fino que renderiza `<EventConfirmationPage {...startupProps} />`.
4. Página nova `src/app/(main)/eventos/geracao-forte/confirmado/page.tsx` é outro wrapper fino com props da Geração Forte.
**Impact:**
- Refator do startup é necessário (testes visuais para garantir não-regressão)
- Reduz duplicação de ~500 linhas
- Custo: +1 dia de implementação, +1 dia de testes visuais

## D001-009 (REVISADA 2026-04-11): FIFO por pagamento confirmado, alocação atômica no webhook
**Source:** Q8 (user-req — versão final)
**Supersedes:** versão anterior baseada em ordem de inscrição (descartada)

**Decision:**
1. Critério: os **500 primeiros pagamentos confirmados** ganham o brinde (FIFO por timestamp de confirmação no webhook Asaas).
2. Inscrições não pagas NÃO consomem brinde.
3. Alocação atômica via **Firestore transaction** no `ProcessAsaasWebhook`:
   - Ler `events/{eventId}/perks/{perkId}` → checar `quantidadeAlocada < limiteEstoque`
   - Se sim: incrementar `quantidadeAlocada`, gravar `inscription.temBrinde = true`, `inscription.perkId = perkId`, `inscription.brindeAlocadoEm = serverTimestamp()`
   - Se não: gravar `inscription.temBrinde = false`
4. Idempotência: antes de entrar na transaction, verificar se `inscription.temBrinde !== undefined`. Se já alocado, não fazer nada.
5. Pagamento parcelado (cartão): inscrição confirma na primeira parcela recebida — é nesse momento que o brinde é alocado.
6. Pagamento estornado depois de alocar brinde: **fora do escopo** desta feature (anotar para spec futura).

**Impact:**
- Schema Firestore: subcollection `events/{eventId}/perks/{perkId}` com campos `nome`, `descricao`, `limiteEstoque`, `quantidadeAlocada`
- `Inscription` entity ganha `temBrinde: boolean`, `perkId?: string`, `brindeAlocadoEm?: Date` (sem `numeroInscricao` — não é mais necessário)
- `EventPerk` entity tem método `canAllocate(): boolean` e a alocação é responsabilidade do **repository** (que executa a transaction)
- `IEventPerkRepository.allocateToInscription(eventId, perkId, inscriptionId): Promise<boolean>` é o método transactional crítico
- `ProcessAsaasWebhook` chama `eventPerkRepository.allocateToInscription` dentro da mesma transaction que confirma o pagamento e a inscrição
- `CreateInscription` **NÃO** precisa de transaction (sem contador) — mantém implementação simples atual
- Painel admin mostra holders ordenados por `brindeAlocadoEm`

**Trade-off aceito:** A complexidade transactional do webhook é o preço para FIFO por pagamento (mais justo do que FIFO por inscrição). Race condition é mitigada por: (a) Firestore transaction com retry automático, (b) idempotência via guard `temBrinde !== undefined`, (c) testes de carga (T001-056 e T001-057).

## D001-010: Asset movido e renomeado
**Source:** Q9 (user-req)
**Decision:** Imagem em `src/assets/images/geracao-forte/follow-me-logo.png`, importada na página via `import` (otimizado por Next/Image). Padrão consistente com `src/assets/images/startup/tema.png`.
**Impact:** Já executado.

---

## Decisões derivadas (impacto cruzado)

### D001-D1 (REVISADA): EventPerk com alocação atômica
**Derivada de:** D001-009 (versão final)
**Supersedes:** versão anterior que tratava EventPerk como metadado descritivo

`EventPerk` é entity completa com:
- `props`: id, eventId, nome, descricao, limiteEstoque, quantidadeAlocada
- método `canAllocate(): boolean` (puro, baseado em props locais)
- a alocação real é feita pelo **repositório** (`IEventPerkRepository.allocateToInscription`) via Firestore transaction — porque a entity sozinha não tem acesso ao mecanismo transactional

O método `allocateToInscription` retorna `true` se alocou, `false` se estoque esgotado. É **idempotente** — chamar 2x com a mesma `inscriptionId` retorna o mesmo resultado sem duplicar.

### D001-D2: Cartão de crédito muda escopo da AsaasService
**Derivada de:** D001-006
Habilitar cartão exige:
- `AsaasService.createPayment` aceitar `billingType: 'CREDIT_CARD'`
- Tokenização do cartão via Asaas SDK no front (D001-012)
- Revisar fluxo de checkout: form de cartão tokenizado + seletor de parcelas
- Variável `NEXT_PUBLIC_ASAAS_PUBLIC_KEY` no `.env.example`

### D001-D3 (REVISADA): Webhook precisa de Firestore transaction para alocar perk
**Derivada de:** D001-009 (versão final)
**Supersedes:** versão anterior que dispensava transaction no webhook

`ProcessAsaasWebhook` agora é a operação **mais sensível** do fluxo:
1. Verifica se webhook é de pagamento confirmado (`PAYMENT_CONFIRMED` ou `PAYMENT_RECEIVED`)
2. Carrega `Payment` e `Inscription` referenciados
3. **Idempotência**: se `inscription.temBrinde !== undefined`, retorna sucesso sem fazer nada
4. Inicia Firestore transaction:
   - Marca `payment.status = CONFIRMED`
   - Marca `inscription.status = 'confirmado'`
   - Lê o perk principal do evento
   - Se `quantidadeAlocada < limiteEstoque`: incrementa, marca `inscription.temBrinde = true`, `inscription.perkId = perkId`, `inscription.brindeAlocadoEm = serverTimestamp()`
   - Senão: marca `inscription.temBrinde = false`
5. Commit da transaction → tudo ou nada

Race condition mitigada por: (a) Firestore retry automático em conflito de transaction, (b) guard de idempotência antes de entrar na transaction, (c) teste de carga T001-056/T001-057 valida o comportamento.

## D001-011: Cartão com parcelamento + juros repassados
**Source:** P1 (user-req)
**Decision:**
1. Cartão de crédito permite parcelamento até **12x** (default).
2. Juros do parcelamento são integralmente repassados ao pagante — igreja recebe líquido o `valorBase`.
3. UI exibe lista de parcelas com valor por parcela e total final por opção.
4. `AsaasService.calculateTotalForBase(valorBase, metodo, parcelas?)` calcula o total para cada opção.
5. Inscrição é confirmada quando a **primeira parcela** é recebida (política padrão Asaas).
**Impact:**
- `Payment` entity ganha `parcelas?: number`
- `PaymentBreakdown` ganha `parcelas?` e `valorParcela?`
- `CreatePaymentForInscription` aceita `parcelas?: number`
- Componente `CardPaymentForm` tem seletor de parcelas
- Webhook `PAYMENT_OVERDUE` fica fora do escopo desta feature (anotar para spec futura)

## D001-012 (REVISADA 2026-04-11): Asaas Checkout (hosted) para cartão
**Source:** descoberta durante implementação — Asaas só oferece SDK em Java, não tem SDK JS público para tokenização no front
**Supersedes:** versão anterior baseada em "tokenização via Asaas SDK no frontend"

**Decision:**
1. Cartão de crédito usa **Asaas Checkout (hosted page)** via `POST /v3/checkouts`.
2. Backend cria a sessão de checkout com `valorTotal` (já com taxa repassada calculada pelo `AsaasFeeCalculator`).
3. Asaas retorna `checkoutUrl` — frontend redireciona o usuário.
4. Cliente paga no domínio do Asaas (PCI scope = Asaas, zero pra nós).
5. Após pagar, Asaas redireciona para `successUrl` configurada (callback): `/eventos/{eventId}/confirmado?inscriptionId=X&checkout=success`.
6. Webhook Asaas confirma normalmente — fluxo de alocação de brinde idêntico.
7. Parcelamento até 12x via `chargeTypes: ['INSTALLMENT']` + `installmentCount`.

**Impact:**
- Removidas tasks: T001-040 (`CardPaymentForm`), T001-041 (`InstallmentSelector`)
- Removida env: `NEXT_PUBLIC_ASAAS_PUBLIC_KEY` não é necessária
- `Payment` entity ganha `checkoutUrl?: string`
- `AsaasService.createCheckout` adicionado
- `CreatePaymentForInscription` faz fork: PIX → cria payment + QR; CREDIT_CARD → cria checkout + retorna URL
- `PaymentMethodSelector` simplifica: "PIX (na hora)" e "Cartão (até 12x)" — clique em cartão = redirect
- Adicionada env `NEXT_PUBLIC_APP_URL` para construir callbacks

**Trade-off aceito:** Cliente sai temporariamente do nosso domínio durante o pagamento com cartão. Compensa: zero PCI scope, zero código de tokenização, suporte nativo a parcelamento, mais seguro.

## D001-012-OLD: Tokenização via Asaas SDK no frontend (DESCARTADA)
**Source:** P2 (user-req — default)
**Decision:**
1. Card data tokenizada no front via SDK do Asaas (`asaas-checkout-js` ou equivalente).
2. Backend recebe apenas o `creditCardToken` — nunca dados crus do cartão.
3. Sem PCI compliance no backend.
4. Componente `CardPaymentForm` encapsula o SDK e expõe callback `onTokenized(token)`.
5. Variável `NEXT_PUBLIC_ASAAS_PUBLIC_KEY` necessária — verificar se existe; se não, adicionar a `.env.example`.
**Impact:**
- `AsaasService.createPayment` aceita `creditCardToken: string` quando `metodo === 'CREDIT_CARD'`
- Novo componente `CardPaymentForm` com integração SDK
- Documentação no README sobre a env var
