# Clarification — Migration 001

**Timestamp:** 2026-04-11
**Feature:** 002-congresso-geracao-forte
**Branch:** (sem branch — trabalho na branch atual)
**Parent:** (none)

## Expected Outcome

Resolver as 9 `NEEDS_CLARIFICATION` da spec para destravar a geração de tasks. Após esta migration, o `tasks.md` da feature deve estar pronto para `/sedd.implement`.

## Architecture Assessment

Análise de arquitetura (3 sub-agents) já feita em `/sedd.specify`. Pontos aplicáveis:
- DDD, Next.js 15, Firestore, Asaas wrapper
- `EventCategory` precisa ser estendido
- `EventPerk` é entity nova
- `ProcessAsaasWebhook` precisa virar Firestore transaction (alocação atômica)
- Risco crítico: race condition na alocação de brinde — mitigado por transaction
- Risco alto plataforma-wide: repasse de taxa Asaas afeta TODOS os fluxos
- Projeto sem testes — feature inaugura suite Vitest + Playwright

---

## Questions & Answers

### Q1 — Datas e local do congresso

**Resposta do usuário:** "do dia 3 ao dia 5 de julho de 2026"

**Notas extraídas:**
- **[TASK_SOURCE:user-req]** Datas do evento: 03/07/2026 a 05/07/2026 (3 dias)
- **[TASK_SOURCE:edge-case]** Local exato (endereço completo) ainda não definido — fica em aberto, página deve ter campo configurável (vir do banco) e exibir "A definir" se vazio

### Q2 — Programação detalhada

**Resposta do usuário:** *(não respondida — aplicado default)*

**Notas extraídas:**
- **[TASK_SOURCE:decision]** Página renderiza seção "Programação" com placeholder genérico ("Em breve")
- **[TASK_SOURCE:user-req]** Estrutura de 3 cards (um por dia: 03/07, 04/07, 05/07) seguindo padrão visual do startup
- **[TASK_SOURCE:edge-case]** Programação detalhada (palestrantes, horários) virá depois — deve ser editável pelo painel admin no futuro (fora do escopo desta feature)

### Q3 — Cor(es) das pulseiras

**Resposta do usuário:** *(não respondida — aplicado default)*

**Notas extraídas:**
- **[TASK_SOURCE:decision]** Tratamento genérico: o `EventPerk` armazena `nome` e `descricao` ("Pulseira Geração Forte") sem campo específico de cor
- **[TASK_SOURCE:edge-case]** Cor física da pulseira é decisão operacional fora do código

### Q4 — Refeições para Outras Localidades

**Resposta do usuário:** "as refeições serão almoço e janta"

**Notas extraídas:**
- **[TASK_SOURCE:user-req]** Categoria "Outras Localidades" tem `beneficiosInclusos: ["Almoço", "Janta"]`
- **[TASK_SOURCE:user-req]** Categoria "Redenção" tem `beneficiosInclusos: []`
- **[TASK_SOURCE:user-req]** Card da categoria exibe os benefícios listados como ícones/checkmarks
- **[TASK_SOURCE:edge-case]** Distribuição operacional das refeições (voucher, credencial) está fora do escopo do código

### Q5 — Métodos de pagamento

**Resposta do usuário:** "os métodos de pagamento serão pix e cartão, iremos repassar todas as taxas para os pagantes das inscrições"

**Notas extraídas:**
- **[TASK_SOURCE:user-req]** Habilitar PIX **e** cartão de crédito como métodos de pagamento
- **[TASK_SOURCE:user-req]** Repasse INTEGRAL da taxa Asaas para PIX **e** para cartão (não só PIX)
- **[TASK_SOURCE:user-req]** Repasse aplica em TODOS os fluxos de pagamento da plataforma (escopo plataforma-wide), não só este evento
- **[TASK_SOURCE:edge-case]** Cartão tem taxa percentual + parcelamento — precisa decidir se permite parcelar e como repassa juros (default sugerido: à vista, sem juros, taxa fixa repassada)
- **[TASK_SOURCE:constraint]** `CreatePaymentForInscription` precisa receber `metodo: 'PIX' | 'CREDIT_CARD'` como parâmetro
- **[TASK_SOURCE:ai-suggestion]** UI de checkout passa a ter seleção de método antes do checkout (PIX vs Cartão), com breakdown de taxa por método
- **[TASK_SOURCE:constraint]** Boleto fica fora do escopo desta feature (pode entrar depois sem refator, pois a abstração de taxa já suporta)

### Q6 — Timezone do early bird

**Resposta do usuário:** *(não respondida — aplicado default)*

**Notas extraídas:**
- **[TASK_SOURCE:decision]** `earlyBirdDeadline = 2026-05-31T23:59:59-03:00` (America/Sao_Paulo, UTC-3)
- **[TASK_SOURCE:edge-case]** Comparação no backend usa `Date` UTC; armazenamento em Firestore via Timestamp; método `getCurrentPrice(now)` aceita Date e compara

### Q7 — Refator do startup/confirmado

**Resposta do usuário:** "iremos reutilizar a pagina de confirmação do startup, fazendo as mudanças visuais para o novo evento"

**Notas extraídas:**
- **[TASK_SOURCE:user-req]** Reutilizar a página `/eventos/startup/confirmado` adaptando visualmente para o novo evento
- **[TASK_SOURCE:decision]** Estratégia: extrair `EventConfirmationPage` reutilizável (componente que recebe `eventId`, `eventName`, `theme/branding`, `eventDates`, `eventLocation`) — startup e geracao-forte consomem o mesmo componente com props diferentes
- **[TASK_SOURCE:user-req]** Extrair hook `usePaymentPolling(inscriptionId)` (hoje inline na página)
- **[TASK_SOURCE:constraint]** Refator do startup/confirmado é parte desta feature — startup ganha de brinde a melhoria, sem regressão visual
- **[TASK_SOURCE:edge-case]** A página atual do startup tem ~500 linhas — refator precisa preservar comportamento de polling, exibição de PIX, cópia do código, "compartilhar comprovante"

### Q8 — Política de alocação dos 500 brindes

**Resposta inicial:** "quem pega é definido com base na ordem da inscrição"
**Resposta final (revisada 2026-04-11):** "devemos mudar para os 500 pagamentos confirmados"

**Notas extraídas (versão final):**
- **[TASK_SOURCE:user-req]** Critério de alocação = ordem do **pagamento confirmado** (FIFO por timestamp de confirmação no webhook)
- **[TASK_SOURCE:user-req]** Os 500 primeiros pagantes confirmados ganham o brinde, independente de quando se inscreveram
- **[TASK_SOURCE:decision]** Estratégia: alocação **atômica via Firestore transaction** dentro do `ProcessAsaasWebhook`. Transaction lê `perk.quantidadeAlocada`, se < 500 incrementa e marca `inscription.temBrinde = true`; senão marca `false`.
- **[TASK_SOURCE:constraint]** Race condition crítica: 600 webhooks simultâneos → exatamente 500 alocações. Garantia via Firestore transaction (retry automático em conflito).
- **[TASK_SOURCE:constraint]** Idempotência: chamar webhook 2x para o mesmo pagamento NÃO incrementa 2x. Verificar `inscription.temBrinde !== undefined` antes de alocar.
- **[TASK_SOURCE:edge-case]** Inscrições não pagas NÃO consomem brinde — só pagantes confirmados.
- **[TASK_SOURCE:edge-case]** Pagamentos parcelados (cartão): inscrição confirma na **primeira parcela recebida** — é nesse momento que o brinde é alocado.
- **[TASK_SOURCE:edge-case]** Pagamento estornado depois de alocar brinde: fora do escopo desta feature (anotar para spec futura — fluxo de cancelamento).
- **[TASK_SOURCE:ai-suggestion]** Página/comprovante mostra status do brinde após confirmação (não antes — só vira certo depois do pagamento).
- **[TASK_SOURCE:ai-suggestion]** Painel admin mostra holders por ordem de alocação (timestamp de confirmação do pagamento).

**Por que mudou:** A primeira escolha (ordem de inscrição) simplificava a arquitetura mas tinha o trade-off de "brindes perdidos" (1-500 que nunca pagaram). FIFO por pagamento confirmado é mais justo (quem efetivamente paga garante a vaga) e maximiza a entrega dos 500 brindes — mas exige robustez transactional no webhook.

### Q9 — Local do MARCA-DAGUA-02.png

**Resposta do usuário:** "pode mover a imagem da logo para a pasta correta e renomeie ela para um nome mais descritivo"

**Notas extraídas:**
- **[TASK_SOURCE:decision]** Asset movido para `src/assets/images/geracao-forte/follow-me-logo.png` (já executado)
- **[TASK_SOURCE:user-req]** Importação na página via `import` (otimizado pelo Next/Image), seguindo padrão do startup

---

### P1 — Parcelamento no cartão

**Resposta do usuário:** "iremos permitir o aparcelamento e a taxa ficará por conta do pagante"

**Notas extraídas:**
- **[TASK_SOURCE:user-req]** Cartão de crédito permite **parcelamento**
- **[TASK_SOURCE:user-req]** Juros do parcelamento são repassados **integralmente ao pagante** (igreja recebe líquido sempre)
- **[TASK_SOURCE:decision]** Default de parcelas máximas: **12x** (cobre maioria dos casos sem expor cliente a juros excessivos)
- **[TASK_SOURCE:constraint]** Asaas calcula juros por parcela — usar `installmentValue` retornado pelo SDK
- **[TASK_SOURCE:user-req]** UI exibe: "1x R$ X (à vista) | 2x R$ Y | 3x R$ Z | ..." com o total final por opção
- **[TASK_SOURCE:edge-case]** Inscrição é confirmada quando o **primeiro recebimento** chega (não esperar todas as parcelas) — política Asaas padrão
- **[TASK_SOURCE:edge-case]** Se cliente cancelar cartão depois, Asaas notifica via webhook `PAYMENT_OVERDUE` — fluxo de cancelamento de inscrição precisa ser revisitado (fora do escopo desta feature, anotar para próxima)

### P2 — Tokenização Asaas SDK

**Resposta do usuário:** "pode seguir com o ponto 2 default"

**Notas extraídas:**
- **[TASK_SOURCE:user-req]** Tokenização via Asaas SDK no frontend (sem PCI compliance no backend)
- **[TASK_SOURCE:constraint]** Card data NUNCA passa pelo nosso backend — é tokenizado no front e enviado como `creditCardToken` para o `AsaasService.createPayment`
- **[TASK_SOURCE:constraint]** Variável de env `NEXT_PUBLIC_ASAAS_PUBLIC_KEY` necessária para o SDK do front (verificar se já existe)
- **[TASK_SOURCE:ai-suggestion]** Componente `CardPaymentForm` encapsula o SDK, expõe `onTokenized(token)` callback

---

## Pendências resolvidas

Todas as 9 NEEDS_CLARIFICATION + 2 sub-pendências respondidas. Pronto para gerar tasks.

## Pendências remanescentes (não bloqueantes para tasks)

- **Local exato do evento**: campo configurável, admin edita antes do lançamento.
- **Programação detalhada**: estrutura pronta, conteúdo via painel admin (futuro).
- **Cor física da pulseira**: decisão operacional.
- **Cancelamento de inscrição via webhook OVERDUE**: fora do escopo, anotar para spec futura.
