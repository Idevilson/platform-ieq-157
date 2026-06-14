# Clarification - Migration 001

**Timestamp:** 2026-06-14
**Branch:** main (trabalhar na branch atual — não criar branch)
**Feature:** 005-inscription-category-upgrade
**Parent:** (none)

## Expected Outcome

Admin troca a categoria de uma inscrição já paga (ex.: `redencao` → `outras-localidades`)
e cobra a **diferença** no método escolhido (PIX/cartão/dinheiro), respeitando o preço da
**data da inscrição** (early bird) e aplicando a **taxa** por cima. A troca de categoria só
é efetivada **após o pagamento da diferença confirmar** (SSE/webhook). Enquanto pendente,
aparece "upgrade pendente" no admin e na consulta pública por CPF (com área "contate o
suporte"). Consulta pública continua mostrando o pagamento original; total arrecadado
reflete o novo valor após a confirmação. Nada existente quebra.

## Architecture Assessment

> Síntese da análise direta dos arquivos impactados (feita nas etapas anteriores).

**Estado atual:**
- `Inscription` (`domain/inscription/entities/Inscription.ts`): `categoryId`/`valor`
  `readonly`; mutações existentes `setCampoMissionario`/`setPaymentId`/`confirm`. **Sem**
  troca de categoria hoje.
- Preço por data: `EventCategory.getCurrentPrice(now)` (early bird `now <= deadline`).
- Pagamentos em subcoleção `events/{e}/inscriptions/{i}/payments/{p}` — múltiplos por
  inscrição já suportados. `Payment` não guarda `externalReference` localmente.
- `FirebasePaymentRepositoryAdmin.findByInscriptionId` (l.80-88): retorna **o mais recente**
  (`orderBy criadoEm desc`). `findByAsaasPaymentId` (l.68-78): exato.
- `ProcessAsaasWebhook.confirmPayment`: curto-circuita por idempotência de brinde
  (`isBrindeProcessed()`) → 2ª cobrança não reconciliaria pelo fluxo padrão.
- SSE: `status-stream/route.ts` (ReadableStream + `onSnapshot`, usa `snap.docs[0]`) +
  `useInscriptionSSE` (EventSource). **Padrão a espelhar.**
- Consulta pública: `LookupInscriptionByCPF.getPaymentInfo` (l.133) usa
  `findByInscriptionId` → risco de exibir cobrança de ajuste.
- Receita: card `admin/eventos/[id]/page.tsx:406-407` e `BuildDailyReport.ts:128-130`
  somam `inscription.valor` de confirmadas. `sumConfirmedByEventId` **sem caller**.
- Admin guard: `verifyAdmin` (Bearer) nas rotas; `useRequireAdmin` em `admin/layout.tsx`.

**Dependências impactadas:** ~10 módulos diretos (entities Inscription/Payment, 2 repos,
webhook, lookup, status-stream, ConfirmModal, adminService/types) + criação de use cases,
rotas e UI nova.

**Riscos:**
- 🔴 `findByInscriptionId` "mais recente" expõe ajuste à consulta pública → mitigado por
  filtro de `tipo` em memória (GNR1).
- 🟡 `status-stream` `docs[0]` ambíguo com 2 pagamentos → filtro de `tipo` (GNR2).
- 🟡 SSE sem header `Authorization` → ID token em query param + `verifyAdmin`.
- 🟢 `categoryId`/`valor` → private+getter: refactor mecânico (leitores usam getter).

## Expectation Details

### DEVE fazer:
- **[TASK_SOURCE:user-req]** Permitir admin trocar categoria de inscrição individual já
  `confirmado` e cobrar a diferença.
- **[TASK_SOURCE:user-req]** Calcular diferença = `novaCategoria.getCurrentPrice(criadoEm)
  − inscription.valorCents` (base, respeita early bird da data dela).
- **[TASK_SOURCE:user-req]** Aplicar taxa por cima via `AsaasFeeCalculator` (taxa NÃO entra
  no cálculo da diferença).
- **[TASK_SOURCE:user-req]** Suportar PIX, cartão e dinheiro físico para a diferença.
- **[TASK_SOURCE:decision]** Upgrade é **pendente**: categoria só muda em `applyUpgrade()`
  após confirmação do pagamento.
- **[TASK_SOURCE:user-req]** Redirecionar o admin para **nova aba**, página dedicada
  admin-only, para emitir/compartilhar o pagamento.
- **[TASK_SOURCE:user-req]** Confirmação por **SSE** (padrão de comunicação mantido).
- **[TASK_SOURCE:user-req]** Enquanto pendente, deixar claro "upgrade pendente" no admin e
  na consulta pública.
- **[TASK_SOURCE:user-req]** Na consulta pública por CPF com upgrade pendente, mostrar área
  "contate o suporte" (WhatsApp do evento) para reenviar o meio de pagamento.
- **[TASK_SOURCE:user-req]** Garantir que o upgrade reflita no **total arrecadado** do admin.
- **[TASK_SOURCE:user-req]** Não afetar a verificação/consulta pública de inscrições.
- **[TASK_SOURCE:edge-case]** Downgrade (diferença ≤ 0): trocar categoria sem cobrança e
  avisar estorno manual via Asaas.

### NÃO DEVE fazer:
- ❌ **[TASK_SOURCE:constraint]** Exibir a cobrança de ajuste (`AJUSTE`) na consulta pública
  por CPF nem no SSE do participante.
- ❌ **[TASK_SOURCE:constraint]** Alterar `categoryId`/`valor` antes do pagamento confirmar.
- ❌ **[TASK_SOURCE:constraint]** Tocar/cancelar o pagamento original confirmado.
- ❌ **[TASK_SOURCE:constraint]** Realocar brinde no webhook de ajuste.
- ❌ **[TASK_SOURCE:constraint]** Mudar o código de cálculo de receita.
- ❌ **[TASK_SOURCE:constraint]** Gerar refund/estorno automático (downgrade).
- ❌ **[TASK_SOURCE:constraint]** Suportar upgrade de inscrição de **lote** nesta migração.
- ❌ **[TASK_SOURCE:constraint]** Criar branch/commit/push.

## Questions & Answers

### Q1 — Contato de suporte na consulta pública
**Resposta:** Usar `whatsappContato` do evento (campo existente).
**[TASK_SOURCE:decision]** UI da consulta usa `event.whatsappContato`.

### Q2 — Autenticação do SSE da página dedicada
**Resposta:** **SSE mantido como padrão**; autenticar via Firebase **ID token em query
param**, validado por `verifyAdmin` (adminAuth.verifyIdToken + isAdmin) na rota de stream.
**[TASK_SOURCE:decision]** Rota `upgrade/status-stream` valida token de query antes de abrir.

### Q3 — Vencimento da cobrança da diferença
**Resposta:** +3 dias (padrão `calculateDueDate()`).
**[TASK_SOURCE:decision]** Reusar a regra de vencimento existente.

### Q4 — Confirmação de dinheiro registra autor
**Resposta:** Sim, `confirmedBy = adminId` (padrão `confirmManually`/`ConfirmBatchCashPayment`).
**[TASK_SOURCE:decision]** `ConfirmUpgradeCashPayment` grava o adminId.

## Notes & Discussions

### Note 001 — Invariante do campo `tipo`
**[TASK_SOURCE:decision]** `Payment.tipo`: `INSCRICAO` (default, inclui legados sem campo)
visível à consulta/leitores padrão; `AJUSTE` invisível a `findByInscriptionId`, só acessado
por `findByAsaasPaymentId`. Filtro em memória (não query Firestore, para não excluir legados).

### Note 002 — externalReference de ajuste
**[TASK_SOURCE:decision]** `eventId:adjustment:inscriptionId` — distinto de individual/batch;
roteia o branch novo do webhook.

### Note 003 — Idempotência
**[TASK_SOURCE:edge-case]** Rerequisitar upgrade com `pendingUpgrade` ativo → regenera a
cobrança (cancela a antiga) em vez de duplicar. Webhook de ajuste idempotente.
