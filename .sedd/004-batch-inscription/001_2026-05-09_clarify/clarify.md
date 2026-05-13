# Clarification — Migration 001

**Timestamp:** 2026-05-09
**Branch:** main
**Parent:** (none)

---

## Expected Outcome

> Um usuário logado consegue inscrever até 50 participantes de uma vez em um evento. Responsável preenche dados completos (nome, CPF, email, telefone, dataNascimento, sexo, cidade). Participantes: apenas nome e sexo. Cidade única para o grupo. Único PIX ou dinheiro físico. Webhook confirma todo o lote. Admin pode aprovar CASH e excluir o lote. Consulta por CPF em /eventos mostra o lote vinculado ao CPF do responsável.

---

## Architecture Assessment

### Estado Atual

- `parseExternalReference` faz split por `:` e valida `parts.length !== 2` → formato batch `eventId:batch:batchId` (3 partes) será detectado automaticamente como "não individual"
- Payments são subcoleção: `events/{eventId}/inscriptions/{inscriptionId}/payments/{paymentId}` — não top-level
- `confirmManually(confirmedBy: string)` já existe na entidade `Inscription` — reutilizável para aprovação CASH do admin
- `Gender` no codebase é `'masculino' | 'feminino'` — **nossa spec usou 'M' | 'F', precisa corrigir**
- `AsaasService.cancelPayment()` existe — reutilizável na exclusão do lote

### Dependências Impactadas

- 8 arquivos existentes para modificar + ~11 novos
- Webhook estendido sem quebrar fluxo individual
- Admin usa `DeleteInscription` use case com cancelamento Asaas embutido — reutilizável por N inscriptions

### Riscos Identificados

- 🔴 Alto: Endpoint batch **obriga** Bearer token — modo guest proibido
- 🟡 Médio: Perk allocation com 50 transações concorrentes no mesmo documento — contention no Firestore; solução: alocação sequencial no webhook (não paralela)
- 🟡 Médio: Armazenamento do Payment do lote — subcoleção de qual documento? (`batchInscriptions/{id}/payments/` é o mais limpo)
- 🟢 Baixo: Webhook idempotência funciona por inscrição individual (já implementado)
- 🟢 Baixo: 50 inscrições × ~6 ops = 300 ops no Firestore (limite é 500 ✓)

### Constraints Técnicas

- Gender deve usar `'masculino' | 'feminino'` (tipo existente no codebase)
- Payment para batch precisa de subcoleção própria em `batchInscriptions`
- Perk allocation deve ser **sequencial** (não paralela) para evitar contention
- Rota batch deve retornar 401 se não houver Bearer token (sem fallback guest)

---

## Expectation Details

### DEVE fazer:
- Criar `BatchInscription` entity + `BatchParticipant` VO + `IBatchInscriptionRepository`
- Criar `CreateBatchInscription` use case (auth obrigatório)
- Criar `FirebaseBatchInscriptionRepositoryAdmin` (coleção top-level `batchInscriptions`)
- Criar `LookupBatchByCPF` use case
- Estender `ProcessAsaasWebhook` para detectar `eventId:batch:batchId` e confirmar lote sequencialmente
- Criar rota `POST /api/batch-inscriptions` com auth obrigatório
- Criar rota `GET|POST /api/batch-inscriptions/[id]/payment`
- Criar rotas admin para listar, aprovar CASH e excluir lote
- Criar `BatchInscriptionForm.tsx` + `BatchParticipantRow.tsx`
- Criar página dedicada `src/app/(main)/eventos/[id]/inscricao-coletiva/page.tsx`
- Adicionar botão "Inscrever grupo" na página do evento (visível só para logados)
- Estender `InscriptionLookup` para exibir lotes quando CPF é de responsável
- Corrigir Gender nos interfaces para `'masculino' | 'feminino'`
- Alocar brindes sequencialmente (não paralelo) para evitar contention

### NÃO DEVE fazer:
- ❌ Quebrar fluxo de inscrição individual existente
- ❌ Aceitar requisição batch sem Bearer token
- ❌ Criar endpoint batch dentro de `/api/inscriptions/` (rota separada)
- ❌ Alocar brindes em paralelo para o lote (sequencial obrigatório)
- ❌ Criar migration de banco (Firebase é schema-less)

---

## Notes & Discussions

### Note 001 — Decisões do planejamento confirmadas
**[TASK_SOURCE:decision]** Coleção Firebase: `batchInscriptions/{batchId}` top-level
**[TASK_SOURCE:decision]** Payment do lote: subcoleção `batchInscriptions/{batchId}/payments/{paymentId}`
**[TASK_SOURCE:decision]** externalReference batch: `eventId:batch:batchId`
**[TASK_SOURCE:decision]** Gender type: usar `'masculino' | 'feminino'` do codebase existente
**[TASK_SOURCE:decision]** Perk allocation: sequencial dentro do webhook handler do lote
**[TASK_SOURCE:constraint]** Endpoint batch requer autenticação obrigatória (Bearer token)

### Note 002 — Reutilização identificada pelos agentes
**[TASK_SOURCE:ai-suggestion]** `confirmManually(confirmedBy)` já existe em `Inscription` — reutilizar para aprovação CASH do admin (sem criar método novo)
**[TASK_SOURCE:ai-suggestion]** `AsaasService.cancelPayment()` já existe — reutilizar ao excluir lote com PIX pendente
**[TASK_SOURCE:ai-suggestion]** `DeleteInscription` use case já cancela pagamento Asaas — criar `DeleteBatch` que o chama N vezes
**[TASK_SOURCE:ai-suggestion]** `AsaasFeeCalculator` existente calcula PIX R$1,99 — chamada única para o valorTotal do lote

### Note 003 — Edge cases levantados
**[TASK_SOURCE:edge-case]** Lote com CASH: Payment não é criado no Asaas (mesmo comportamento do individual CASH)
**[TASK_SOURCE:edge-case]** Webhook do lote recebido 2x: checar `batch.status === 'confirmado'` antes de reprocessar (idempotência no nível do lote)
**[TASK_SOURCE:edge-case]** Exclusão de lote confirmado: permitida pelo admin mas deve cancelar/não cancelar Asaas (já pago)
**[TASK_SOURCE:edge-case]** Perk esgotado no meio do lote: continuar confirmando as inscrições restantes; apenas o `temBrinde` ficará false para os que não pegaram
**[TASK_SOURCE:user-req]** Consulta CPF deve mostrar lote agrupado (não 50 inscrições soltas)
**[TASK_SOURCE:user-req]** Admin: botão "Confirmar pagamento" só aparece para CASH + pendente
**[TASK_SOURCE:user-req]** Admin: botão "Excluir lote" disponível para qualquer status com confirmação

---

## Questions & Answers

*(sessão interativa — aguardando `pergunte` ou `tasks`)*
