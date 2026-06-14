# Feature 005 — Upgrade de Categoria de Inscrição com Cobrança de Diferença

- **Feature ID:** 005
- **Branch:** main (trabalhar na branch atual — não criar branch)
- **Criado em:** 2026-06-14
- **Status:** spec (aguardando `/sedd.clarify`)

## Expectation

O administrador localiza a inscrição de um participante que escolheu a categoria errada
(mais barata) e troca para a categoria correta (mais cara), cobrando automaticamente a
**diferença** — respeitando o preço da **data da inscrição** (early bird) e as **taxas**
do meio de pagamento escolhido (PIX, cartão ou dinheiro físico). A troca de categoria só
é efetivada **após o pagamento da diferença confirmar** (via SSE/webhook). Enquanto
pendente, fica visível como "upgrade pendente" no admin e na consulta pública por CPF
(com área para **contatar o suporte** reenviar o meio de pagamento). A consulta pública
continua mostrando o pagamento **original** e o total arrecadado do admin reflete o novo
valor automaticamente após a confirmação. Nenhum fluxo existente quebra.

## Problema / Motivação

Um participante "de fora" se inscreveu no evento `geracao-forte` marcando a categoria
"de dentro" (`redencao`, mais barata) e **já pagou**. Hoje não há como o admin corrigir a
categoria nem cobrar a diferença — `Inscription.categoryId`/`valor` são imutáveis e só
existe `UpdateCampoMissionario`. É preciso um fluxo seguro de upgrade de categoria com
cobrança da diferença, sem quebrar consulta pública, webhook, brinde ou receita.

## User Stories

- **US1 (Admin):** Como admin, localizo a inscrição (busca por nome/CPF/email/telefone já
  existente), abro o detalhe e escolho uma nova categoria + método de pagamento, vejo o
  **preview da diferença** e gero a cobrança.
- **US2 (Admin):** Ao gerar, sou levado para uma **nova aba** numa página dedicada
  (somente admin) onde emito/compartilho o pagamento (QR/copia-e-cola PIX, link de
  checkout do cartão, ou confirmo recebimento em dinheiro) e acompano a confirmação em
  tempo real (SSE).
- **US3 (Sistema):** Quando o participante paga a diferença, o webhook confirma o
  pagamento de ajuste e **aplica** a troca de categoria/valor automaticamente.
- **US4 (Participante):** Ao consultar minha inscrição por CPF em `/eventos`, se há um
  upgrade pendente, vejo um aviso "Upgrade pendente — contate o suporte" com o contato
  para que o suporte reenvie o meio de pagamento. Continuo vendo meu pagamento original
  (nunca a cobrança de ajuste).
- **US5 (Admin):** Posso **cancelar** um upgrade pendente (cancela a cobrança no Asaas e
  limpa o estado), para não ficar preso.
- **US6 (Admin):** O total arrecadado ("Receita Confirmada" + relatório diário) reflete o
  novo valor da inscrição após a confirmação da diferença.

## Regras de Negócio

### RB1 — Cálculo da diferença (base, sem taxa)
```
baseNova       = novaCategoria.getCurrentPrice(inscription.criadoEm).getCents()
diferencaBase  = baseNova - inscription.valorCents
```
- Usa `inscription.criadoEm` (não `new Date()`) para respeitar o early bird **da data da
  inscrição dela** (`EventCategory.getCurrentPrice(now)` compara `now <= earlyBirdDeadline`).
- `inscription.valorCents` é a base já registrada (sem taxa) — fonte do que ela já pagou.

### RB2 — Taxas por cima (não entram no cálculo do que ela deve)
- `breakdown = AsaasFeeCalculator.calculateBreakdown(Money.fromCents(diferencaBase), metodo)`.
- PIX: R$1,99 fixo. Cartão: 2,99% + R$0,49. A taxa é cobrada por cima da diferença; o
  participante paga a taxa novamente nesta cobrança.

### RB3 — Somente upgrade (diferença > 0)
- Se `diferencaBase <= 0` (downgrade), **não** gerar cobrança. Apenas permitir troca de
  categoria e exibir aviso de "valor pago a mais — estorno manual via Asaas". Refund
  automático está **fora de escopo**.

### RB4 — Pré-condições
- Inscrição deve estar `confirmado` (ela já pagou o original).
- Nova categoria deve existir no evento e ser diferente da atual.
- Não pode haver outro `pendingUpgrade` ativo (ou o fluxo reaproveita/regenera a cobrança
  existente em vez de duplicar — ver RB6).

### RB5 — Upgrade é PENDENTE até pagar (invariante central)
- Gerar upgrade **não** altera `categoryId`/`valor`. Cria `inscription.pendingUpgrade` e um
  `Payment` `tipo:'AJUSTE'` (status `PENDING`).
- `applyUpgrade()` (troca `categoryId`/`valor`, limpa `pendingUpgrade`) só é chamado
  **quando o pagamento da diferença confirma** (webhook PIX/cartão) ou quando o admin
  confirma recebimento em dinheiro.

### RB6 — Idempotência e não-duplicação
- Se já existe `pendingUpgrade`, nova requisição **regenera** a cobrança (cancela a antiga
  no Asaas) em vez de criar uma segunda.
- Webhook de ajuste é idempotente: se o `Payment` já está confirmado ou `pendingUpgrade` já
  foi aplicado, não reprocessa; **não** mexe em brinde.

### RB7 — Métodos suportados para a diferença
- `PIX`, `CREDIT_CARD`, `CASH` (dinheiro físico, confirmado manualmente pelo admin).

## Garantias de Não-Regressão (críticas)

### GNR1 — Consulta pública por CPF não pode mostrar a cobrança de ajuste
- `FirebasePaymentRepositoryAdmin.findByInscriptionId` passa a **ignorar** pagamentos
  `tipo:'AJUSTE'` (filtro **em memória**, tratando `tipo` ausente como primário →
  compatível com dados legados sem o campo).
- Isso protege automaticamente: `LookupInscriptionByCPF.getPaymentInfo` (consulta/
  verificação pública), `CreatePaymentForInscription.handleExistingPayment`, o webhook
  padrão e `GET /api/inscriptions/[id]/payment`.
- A cobrança `AJUSTE` é sempre acessada por `findByAsaasPaymentId` (exato) — nunca por
  `findByInscriptionId`.

### GNR2 — SSE do participante prefere o pagamento principal
- `status-stream/route.ts` (`paymentRef.onSnapshot` → `snap.docs[0]`) passa a escolher,
  em memória, o doc com `tipo !== 'AJUSTE'`.

### GNR3 — Aviso "contate o suporte" na consulta pública
- Expor `pendingUpgrade` em `Inscription.toJSON()` e no output de `LookupInscriptionByCPF`.
- Quando `pendingUpgrade` existir, a UI da consulta por CPF mostra área "Upgrade pendente
  (categoria atual → nova) — contate o suporte" com o WhatsApp do evento.

### GNR4 — Total arrecadado reflete o upgrade sem mudar código de receita
- A receita deriva de `inscription.valor` de inscrições `confirmado`:
  - Card "Receita Confirmada": `admin/eventos/[id]/page.tsx:406-407`.
  - Relatório diário: `BuildDailyReport.ts:128-130`.
  - (`sumConfirmedByEventId` — que somaria pagamentos — está **sem caller**.)
- Como `applyUpgrade()` atualiza `inscription.valor` para `targetValorCents` e a inscrição
  já é `confirmado`, o total sobe automaticamente quando a diferença confirma. **Nenhuma
  mudança no código de receita.**
- Observação: `receitaHoje` do relatório (`atualizadoEm >= hoje`) contará o valor cheio da
  inscrição no dia do upgrade (não só o delta). É só o "+X hoje" do WhatsApp; total fica
  correto. Aceito como está.

### GNR5 — Pagamento original e brinde intocados
- O `Payment` original confirmado nunca é alterado/cancelado. O webhook de ajuste não
  realoca brinde (a inscrição já está confirmada e o brinde já processado).

## Architecture Analysis

### Arquitetura atual relevante
- **DDD em camadas:** `domain` (entities/value-objects), `application` (use cases),
  `infrastructure` (Firebase repos, Asaas), `app/api` (rotas), `app`/`components`/`hooks` (UI).
- **Inscription** (`src/server/domain/inscription/entities/Inscription.ts`): `categoryId` e
  `valor` são `readonly`; mutações existentes: `setCampoMissionario`, `setPaymentId`,
  `confirm`, `confirmManually`, `cancel`, `markBrindeAllocated`.
- **Preço por data:** `EventCategory.getCurrentPrice(now)` (early bird via
  `now <= earlyBirdDeadline`). Categorias `geracao-forte`: `redencao` (R$120/150) vs
  `outras-localidades` (R$200/250), deadline early bird 2026-06-07.
- **Pagamento/taxa:** `AsaasFeeCalculator` + `PaymentBreakdown`. `Payment` em subcoleção
  `events/{e}/inscriptions/{i}/payments/{p}` — suporta múltiplos pagamentos por inscrição.
- **Webhook:** `ProcessAsaasWebhook` roteia por `externalReference` (`eventId:inscriptionId`
  ou `eventId:batch:batchId`) e curto-circuita por idempotência de brinde.
- **SSE:** `status-stream/route.ts` (ReadableStream + `onSnapshot`) + `useInscriptionSSE`
  (EventSource). **Padrão a espelhar.**
- **Admin:** páginas sob `minha-conta/admin/layout.tsx` (`useRequireAdmin`); rotas
  `api/admin/**` com `verifyAdmin` (Bearer + `user.isAdmin()`). Detalhe da inscrição no
  `ConfirmModal` de `admin/eventos/[id]/page.tsx` já tem "Confirmar", "Regerar PIX", "Excluir".

### Impacto
- **Modificar:** `Inscription.ts`, `Payment.ts`, repos de inscrição e pagamento
  (`findByInscriptionId`, mappers), `ProcessAsaasWebhook.ts`, `LookupInscriptionByCPF.ts`,
  `status-stream/route.ts`, `ConfirmModal` (admin page), `adminService`/types
  (`InscriptionWithDetails`), UI de consulta por CPF.
- **Criar:** use cases `RequestInscriptionUpgrade`, `ConfirmUpgradeCashPayment`,
  `CancelInscriptionUpgrade`; rotas `upgrade/preview|POST|confirm-cash|cancel|status-stream`;
  página dedicada; `useUpgradeSSE`; hook de mutação; badge/seção UI.
- **DB/schema:** Firestore — campo `pendingUpgrade` no doc da inscrição; campo `tipo` no doc
  do pagamento (ambos opcionais/aditivos, compatíveis com legados).
- **Sem mudança** no código de receita (GNR4).

### Reuso
- `AsaasService.createPayment/getPixQrCode/cancelPayment`, `AsaasFeeCalculator`,
  `PaymentBreakdown`, `Money`, padrão SSE (`status-stream` + `useInscriptionSSE`),
  `verifyAdmin`, `useRequireAdmin`, padrões de `CreatePaymentForInscription` e
  `RegeneratePaymentForInscription`.

### Riscos / Tech debt
- `findByInscriptionId` retorna "o mais recente" → resolvido pelo filtro de `tipo` (GNR1).
- `status-stream` usa `docs[0]` sem ordenação → resolvido por filtro de `tipo` (GNR2).
- SSE não envia header `Authorization` → validar Firebase ID token via query param na rota
  de stream admin.
- `Inscription` tornar `categoryId`/`valor` privados com getters: refactor mecânico, muitos
  leitores usam `.categoryId`/`.valor` (mantidos via getter).

## Architecture Contract

Ver `_meta.json#architectureContract` (imutável). Destaques:
- `externalReference` de ajuste: **`eventId:adjustment:inscriptionId`**.
- Invariante `tipo`: `INSCRICAO` (default/legado) visível à consulta; `AJUSTE` invisível,
  só via `findByAsaasPaymentId`.
- `categoryId`/`valor` mudam **somente** via `applyUpgrade()` pós-confirmação.
- Receita continua derivando de `inscription.valor`.
- Trabalhar na branch atual; nunca commit/push.

## Fora de Escopo
- Refund/estorno automático (downgrade).
- Parcelamento da diferença.
- Trocar categoria de inscrições de **lote** (BatchInscription) — apenas inscrições
  individuais nesta feature.
- Trocar categoria de inscrição ainda `pendente` (não paga) — fora de escopo (admin pode
  excluir e refazer).

## Open Questions [NEEDS_CLARIFICATION]
- **Q1:** Origem do contato de suporte exibido na consulta — usar `whatsappContato` do
  evento (campo existente)? [assumido: SIM]
- **Q2:** Validação do SSE admin via ID token em query param é aceitável, ou a página deve
  buscar o estado via polling autenticado em vez de EventSource? [assumido: ID token em query]
- **Q3:** Expiração/vencimento da cobrança de diferença segue o padrão (+3 dias)? [assumido: SIM]
- **Q4:** Em dinheiro físico, a confirmação manual exige algum registro de quem confirmou
  (como `confirmManually`)? [assumido: registrar `confirmedBy` = adminId]
