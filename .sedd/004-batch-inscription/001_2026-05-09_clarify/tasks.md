# Tasks — Migration 001

**Migration:** 001
**Timestamp:** 2026-05-09_clarify
**Parent:** (none)

## Summary

Total: 30 | Completed: 0 | Pending: 30

---

## Tasks

### 🏗️ Foundation — Shared Types & Domain

- [ ] T001-001 [Foundation] Corrigir `interfaces.ts` da feature: substituir `'M' | 'F'` por `Gender = 'masculino' | 'feminino'` em `BatchParticipantProps` e `BatchInscriptionDTO` → `.sedd/004-batch-inscription/interfaces.ts`

- [ ] T001-002 [Foundation] Criar value object `BatchParticipant` com campos `nome: string` e `sexo: Gender`; validar nome não vazio → `src/server/domain/inscription/value-objects/BatchParticipant.ts`

- [ ] T001-003 [Foundation] Criar entidade `BatchInscription` seguindo padrão `private constructor + static create() + static fromPersistence() + toJSON()`; campos: `id, eventId, categoryId, status, paymentId?, valorTotal (Money), responsavel (object), cidade, participantes (BatchParticipant[]), inscriptionIds[]`; métodos: `confirm(), confirmCash(confirmedBy), cancel(), isPending(), isConfirmed()` → `src/server/domain/inscription/entities/BatchInscription.ts`

- [ ] T001-004 [Foundation] Criar interface `IBatchInscriptionRepository` com métodos: `findById(id): Promise<BatchInscription | null>`, `findByEventId(eventId): Promise<BatchInscription[]>`, `findByResponsavelCPF(cpf): Promise<BatchInscription[]>`, `save(batch): Promise<void>`, `update(batch): Promise<void>`, `delete(id): Promise<void>` → `src/server/domain/inscription/repositories/IBatchInscriptionRepository.ts`

- [ ] T001-005 [Foundation] Atualizar `src/shared/types/inscription.ts` adicionando: `CreateBatchInscriptionRequest`, `BatchInscriptionDTO`, `BatchParticipantDTO`, `BatchLookupResult`, `AdminBatchListItem`

---

### 🗄️ Infrastructure — Firebase Repository

- [ ] T001-006 [Infra] Criar `FirebaseBatchInscriptionRepositoryAdmin` implementando `IBatchInscriptionRepository`; coleção: `batchInscriptions` (top-level); subcoleção de payments: `batchInscriptions/{id}/payments/`; usar `collectionGroup` para query por `responsavel.cpf` → `src/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin.ts`

---

### ⚙️ Application — Use Cases

- [ ] T001-007 [Application] Criar use case `CreateBatchInscription`; validações: evento aberto, categoria existe, mínimo 2 e máximo 50 participantes, `userId` obrigatório (sem guest); criação: N `Inscription`s com `guestData = { nome, sexo, cidade }` e campo `batchId`, depois `BatchInscription` com `inscriptionIds[]`; `valorTotal = N × category.getCurrentPrice()` → `src/server/application/inscription/CreateBatchInscription.ts`

- [ ] T001-008 [Application] Criar use case `CreatePaymentForBatch`; para PIX: calcular `valorTotal` com `AsaasFeeCalculator` (única taxa R$1,99), criar Asaas customer pelo CPF do responsável, criar payment com `externalReference = eventId:batch:batchId`, salvar payment em `batchInscriptions/{id}/payments/`; para CASH: salvar payment local sem chamar Asaas → `src/server/application/payment/CreatePaymentForBatch.ts`

- [ ] T001-009 [Application] Criar use case `LookupBatchByCPF`; busca `batchInscriptions` por `responsavel.cpf`; enriquece com `eventTitle`, `categoryName`, status do payment; retorna `BatchLookupResult[]` → `src/server/application/inscription/LookupBatchByCPF.ts`

- [ ] T001-010 [Application] Criar use case `ConfirmBatchCashPayment`; recebe `batchId` + `adminUserId`; itera `inscriptionIds[]` e chama `inscription.confirmManually(adminUserId)` em cada um sequencialmente; atualiza `batch.status = 'confirmado'`; aloca brindes sequencialmente (não paralelo) → `src/server/application/inscription/ConfirmBatchCashPayment.ts`

- [ ] T001-011 [Application] Criar use case `DeleteBatch`; sequência: (1) cancelar payment Asaas se PIX pendente via `AsaasService.cancelPayment()`; (2) deletar cada `Inscription` em `inscriptionIds[]` via `IInscriptionRepository.delete()`; (3) deletar documento `batchInscriptions/{id}` → `src/server/application/inscription/DeleteBatch.ts`

- [ ] T001-012 [Application] Estender `ProcessAsaasWebhook` para detectar `externalReference = eventId:batch:batchId` (split por `:`, checar `parts[1] === 'batch'`); criar método privado `processBatchPayment(eventId, batchId, payment)`; verificar `batch.status !== 'confirmado'` (idempotência em nível de lote); confirmar inscrições **sequencialmente**; alocar brindes **sequencialmente** → `src/server/application/payment/ProcessAsaasWebhook.ts`

---

### 🌐 API Routes

- [ ] T001-013 [API] Criar `POST /api/batch-inscriptions`: exigir Bearer token (401 se ausente ou inválido); instanciar `CreateBatchInscription`; retornar `{ batch: BatchInscriptionDTO }` com status 201 → `src/app/api/batch-inscriptions/route.ts`

- [ ] T001-014 [API] Criar `GET /api/batch-inscriptions/[id]/payment`: busca payment do lote; se CASH retorna `{ payment: null, metodoPagamento: 'CASH' }`; se PIX retorna QR code e copia-e-cola → `src/app/api/batch-inscriptions/[id]/payment/route.ts`

- [ ] T001-015 [API] Criar `POST /api/batch-inscriptions/[id]/payment`: cria payment via `CreatePaymentForBatch`; exige Bearer token → `src/app/api/batch-inscriptions/[id]/payment/route.ts`

- [ ] T001-016 [API] Estender `GET /api/inscriptions/lookup`: além de chamar `LookupInscriptionByCPF`, chamar `LookupBatchByCPF` com o mesmo CPF; unificar resultados em `{ inscriptions: [...], batches: [...] }` → `src/app/api/inscriptions/lookup/route.ts`

- [ ] T001-017 [API] Criar `GET /api/admin/events/[eventId]/batch-inscriptions`: admin only (verificar token + role); listar lotes do evento via repositório; retornar `AdminBatchListItem[]` → `src/app/api/admin/events/[eventId]/batch-inscriptions/route.ts`

- [ ] T001-018 [API] Criar `POST /api/admin/batch-inscriptions/[id]/confirm-cash`: admin only; chamar `ConfirmBatchCashPayment` com `adminUserId` do token → `src/app/api/admin/batch-inscriptions/[id]/confirm-cash/route.ts`

- [ ] T001-019 [API] Criar `DELETE /api/admin/batch-inscriptions/[id]`: admin only; chamar `DeleteBatch`; retornar `{ deleted: true, inscriptionsRemoved: number }` → `src/app/api/admin/batch-inscriptions/[id]/route.ts`

---

### 🔗 Frontend — Service & Hooks

- [ ] T001-020 [Service] Adicionar `createBatchInscription(data: CreateBatchInscriptionRequest)` e `getBatchPayment(batchId)` e `createBatchPayment(batchId, method)` em `inscriptionService.ts` → `src/lib/services/inscriptionService.ts`

- [ ] T001-021 [Hook] Criar `useBatchInscriptionMutations.ts` com: `useCreateBatchInscription()`, `useCreateBatchPayment()`; invalidar queries relevantes no `onSuccess` → `src/hooks/mutations/useBatchInscriptionMutations.ts`

- [ ] T001-022 [Hook] Criar query `useBatchPayment(batchId)` com polling enquanto status for `PENDING`; parar polling ao confirmar → `src/hooks/queries/useBatchInscription.ts`

---

### 🎨 Frontend — Componentes

- [ ] T001-023 [Component] Criar `BatchParticipantRow.tsx`: linha com input de nome + seletor de sexo (Masculino/Feminino) + botão remover; emitir `onChange` e `onRemove` → `src/components/inscription/BatchParticipantRow.tsx`

- [ ] T001-024 [Component] Criar `BatchInscriptionForm.tsx` em 2 etapas: **Etapa 1** — campos do responsável (nome, CPF, email, telefone, dataNascimento, sexo, cidade) + campo único de cidade do grupo + lista dinâmica de `BatchParticipantRow` (mín 2, máx 50) + counter "N/50" + resumo de valor; **Etapa 2** — QR code PIX ou mensagem CASH; validação completa antes de avançar → `src/components/inscription/BatchInscriptionForm.tsx`

- [ ] T001-025 [Component] Estender `InscriptionLookup.tsx` para renderizar `BatchLookupResult[]` retornados pelo lookup: card expansível mostrando responsável, cidade, nº de participantes, status do payment, copia-e-cola PIX; lista de participantes (nome + sexo) quando expandido → `src/components/inscription/InscriptionLookup.tsx`

---

### 📄 Frontend — Páginas

- [ ] T001-026 [Page] Criar página `inscricao-coletiva`: verificar autenticação (redirect para login se não logado); carregar categorias do evento; renderizar `BatchInscriptionForm`; exibir confirmação final após pagamento → `src/app/(main)/eventos/[id]/inscricao-coletiva/page.tsx`

- [ ] T001-027 [Page] Adicionar botão/link "Inscrever grupo" na página do evento `geracao-forte` logo acima ou abaixo do `SmartInscriptionForm`; visível apenas para `isAuthenticated`; navegar para `/eventos/geracao-forte/inscricao-coletiva` → `src/app/(main)/eventos/geracao-forte/page.tsx`

---

### 🛠️ Admin

- [ ] T001-028 [Admin] Adicionar seção "Lotes de Inscrição" na página admin do evento; buscar via `GET /api/admin/events/[id]/batch-inscriptions`; renderizar lista de `AdminBatchCard` → `src/app/minha-conta/admin/eventos/[id]/page.tsx`

- [ ] T001-029 [Admin] Criar componente `AdminBatchCard.tsx`: card expansível mostrando responsável (nome + CPF), cidade, nº participantes, valor total, status; lista de participantes quando expandido; botão "Confirmar pagamento" (visível só se `metodoPagamento === 'CASH'` e `status === 'pendente'`); botão "Excluir lote" com modal de confirmação → `src/components/admin/AdminBatchCard.tsx`

---

### ✅ Testes

- [ ] T001-030 [Test] Criar testes unitários para `BatchInscription` entity: `create()` com dados válidos, rejeição com < 2 participantes, rejeição com > 50, `confirm()`, `cancel()`, `toJSON()` → `tests/unit/domain/entities/BatchInscription.test.ts`

---

## Dependencies

```
T001-001
  ↓
T001-002, T001-003, T001-005
  ↓
T001-004
  ↓
T001-006 (repositório)
  ↓
T001-007 (CreateBatchInscription)
T001-009 (LookupBatchByCPF)
T001-010 (ConfirmBatchCashPayment)
T001-011 (DeleteBatch)
  ↓
T001-008 (CreatePaymentForBatch)
T001-012 (ProcessAsaasWebhook — estender)
  ↓
T001-013, T001-014, T001-015, T001-016 (API routes)
T001-017, T001-018, T001-019 (API admin)
  ↓
T001-020 (service)
  ↓
T001-021, T001-022 (hooks)
  ↓
T001-023 (BatchParticipantRow)
  ↓
T001-024 (BatchInscriptionForm)
T001-025 (InscriptionLookup estendido)
  ↓
T001-026, T001-027 (páginas)
T001-028, T001-029 (admin)

T001-030 (testes) → depende de T001-003
```

---

## Acceptance Criteria

Ver `acceptance.md` para checklist de verificação.
