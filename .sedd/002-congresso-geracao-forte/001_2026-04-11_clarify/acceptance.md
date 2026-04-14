# Acceptance Criteria — Migration 001

**Feature:** 002-congresso-geracao-forte
**Migration:** 001

Cada item é verificável manual ou automaticamente. Marcar `[x]` apenas quando 100% verde.

---

## AC do Visitante (página pública)

- [ ] **AC-001** Acessar `/eventos/geracao-forte` retorna 200 e renderiza a página completa
  > Verificar: navegar pelo browser, sem 404
- [ ] **AC-002** Página exibe a logo `follow-me-logo.png` no hero
  > Verificar: inspecionar img/Image, src deve apontar para `/_next/.../follow-me-logo`
- [ ] **AC-003** Página exibe o tema "Marcos 8:34" e descrição contextual
  > Verificar: texto presente no DOM
- [ ] **AC-004** Página mostra datas "03 a 05 de julho de 2026"
  > Verificar: texto no hero ou seção informativa
- [ ] **AC-005** Card de brinde mostra "X / 500 restantes" em tempo real
  > Verificar: rede mostra request a `/api/events/geracao-forte/perks/summary`; valor atualiza ao recarregar
- [ ] **AC-006** Quando inscrições < 500: card mostra contador
  > Verificar: estado padrão na seed
- [ ] **AC-007** Quando inscrições >= 500: card mostra "Pulseiras esgotadas"
  > Verificar: simular 500 inscrições, recarregar página

## AC de Categorias

- [ ] **AC-008** Antes de 31/05/2026 23:59:59 BRT: Redenção mostra R$ 120 e Outras Localidades mostra R$ 200
  > Verificar: mock de data, checar valores
- [ ] **AC-009** Após 31/05/2026 23:59:59 BRT: Redenção mostra R$ 150 e Outras Localidades mostra R$ 250
  > Verificar: mock de data, checar valores
- [ ] **AC-010** Card "Outras Localidades" exibe checkmarks "Almoço" e "Janta"
  > Verificar: DOM
- [ ] **AC-011** Card "Redenção" NÃO exibe seção de benefícios (lista vazia)
  > Verificar: DOM
- [ ] **AC-012** Backend ignora valor enviado pelo front e calcula via `getCurrentPrice`
  > Verificar: enviar `valor: 1` no body de POST /api/inscriptions, esperar persistência com valor correto

## AC de Inscrição (visitante e logado)

- [ ] **AC-013** Visitante consegue se inscrever via guest form (CPF, nome, email, telefone)
  > Verificar: fluxo E2E
- [ ] **AC-014** Usuário logado consegue se inscrever via user form
  > Verificar: fluxo E2E
- [ ] **AC-015** Inscrição duplicada (mesmo CPF no mesmo evento) é rejeitada com 409
  > Verificar: tentar inscrever 2x
- [ ] **AC-016** Inscrição é criada com `temBrinde === undefined` (será setado pelo webhook após confirmação do pagamento)
  > Verificar: Firestore após criar inscrição, antes de qualquer pagamento

## AC de Pagamento (PIX)

- [ ] **AC-017** Após criar inscrição com método PIX, recebo QR code e copia-e-cola
  > Verificar: response do POST /api/inscriptions/[id]/payment
- [ ] **AC-018** Tela de pagamento mostra breakdown: "Valor R$ X + Taxa R$ Y = Total R$ Z"
  > Verificar: DOM
- [ ] **AC-019** `Payment.breakdown` é persistido com `valorBase`, `valorTaxa`, `valorTotal`, `metodo: 'PIX'`
  > Verificar: Firestore após criar pagamento
- [ ] **AC-020** Webhook Asaas confirma a inscrição
  > Verificar: simular webhook, status muda para `confirmado`

## AC de Pagamento (Cartão)

- [ ] **AC-021** Tela de pagamento permite escolher entre PIX e Cartão
  > Verificar: `PaymentMethodSelector` no DOM
- [ ] **AC-022** Ao escolher Cartão: aparece form com tokenização Asaas SDK
  > Verificar: `CardPaymentForm` carregado, sem dados crus do cartão tocando o backend
- [ ] **AC-023** Aparece seletor de parcelas (1x à vista até 12x) com valor por parcela
  > Verificar: `InstallmentSelector` no DOM
- [ ] **AC-024** Juros do parcelamento são repassados ao pagante (igreja recebe líquido `valorBase`)
  > Verificar: `breakdown.valorTotal = valorBase + (taxaCartão + jurosParcelamento)`
- [ ] **AC-025** Backend recebe apenas `creditCardToken`, nunca dados crus do cartão
  > Verificar: inspecionar payload de POST /api/inscriptions/[id]/payment
- [ ] **AC-026** `Payment.breakdown` persistido com `metodo: 'CREDIT_CARD'`, `parcelas: N`, `valorParcela: X`

## AC de Brinde

- [ ] **AC-027** Os primeiros 500 pagamentos confirmados (FIFO por timestamp do webhook) → `temBrinde = true`
  > Verificar: teste integration T001-056
- [ ] **AC-028** A partir do 501º pagamento confirmado → `temBrinde = false`, inscrição confirmada normalmente
- [ ] **AC-029** Inscrições não pagas NÃO consomem brinde (só pagantes confirmados consomem estoque)
  > Verificar: criar 1000 inscrições sem pagar, confirmar 500 → exatamente 500 com brinde
- [ ] **AC-030** Comprovante exibe badge "🎁 Você ganhou a pulseira" quando `temBrinde === true`
  > Verificar: página de confirmação após pagamento
- [ ] **AC-031** Webhook é idempotente: chamar 2x para o mesmo pagamento não duplica `quantidadeAlocada` (guard via `inscription.temBrinde !== undefined`)
  > Verificar: teste integration T001-057
- [ ] **AC-031b** Sob concorrência (600 webhooks simultâneos em um perk de limite 500) → exatamente 500 alocações, 100 negativas. Sem race condition.
  > Verificar: teste integration T001-056

## AC de Confirmação (refator startup compartilhado)

- [ ] **AC-032** `/eventos/geracao-forte/confirmado` mostra status do pagamento e atualiza via polling
  > Verificar: E2E
- [ ] **AC-033** `/eventos/startup/confirmado` continua funcionando exatamente como antes (não-regressão visual)
  > Verificar: snapshot visual T001-061
- [ ] **AC-034** Hook `usePaymentPolling` polla a cada 30s e para quando `status === confirmado`
  > Verificar: rede

## AC de Admin

- [ ] **AC-035** Admin acessa página do evento Geração Forte e vê card "Brindes restantes: X / 500"
- [ ] **AC-036** Admin vê tabela paginada de holders (quem tem direito ao brinde)
- [ ] **AC-037** Admin consegue exportar a lista em CSV

## AC de Seed

- [ ] **AC-038** `npx tsx scripts/seed-geracao-forte.ts` cria o evento, 2 categorias e 1 perk
- [ ] **AC-039** Rodar o seed 2x não duplica nada (idempotente)

## AC Plataforma-wide (taxa)

- [ ] **AC-040** Pagamentos no evento `startup` (existente) NÃO foram alterados pelo deploy (campos `breakdown` ficam null para registros antigos)
- [ ] **AC-041** Novos pagamentos do startup também ganham `breakdown` (mudança plataforma-wide aplicada)
- [ ] **AC-042** A função de cálculo de taxa é a mesma usada por todos os fluxos de pagamento

## AC de Testes (cobertura)

- [ ] **AC-043** Suite Vitest passa: T001-053..057
- [ ] **AC-044** Suite Playwright passa: T001-058..060
- [ ] **AC-045** Snapshot visual do startup verde: T001-061
- [ ] **AC-046** `npm run lint && npm test` passa sem warnings novos
