# Decisions — Migration 001

---

## D001-001: Gender type

**Source:** Agent B (Dependency Mapper)

**Decisão:** Usar `'masculino' | 'feminino'` conforme type `Gender` existente no codebase (`src/shared/constants/index.ts`). A spec e `interfaces.ts` usavam `'M' | 'F'` — corrigir antes de implementar.

**Impacto:** `BatchParticipant` VO usa `sexo: Gender`. UI usa labels "Masculino" / "Feminino" (não "M" / "F").

---

## D001-002: Armazenamento do Payment do lote

**Source:** Agent A (Current State Mapper)

**Decisão:** Payment do lote armazenado em `batchInscriptions/{batchId}/payments/{paymentId}` (subcoleção do batch), não em `events/{eventId}/inscriptions/.../payments/` (que é para inscrições individuais).

**Impacto:** `FirebaseBatchInscriptionRepositoryAdmin` gerencia a subcoleção de payments. Rota `GET|POST /api/batch-inscriptions/[id]/payment` usa esse repositório.

---

## D001-003: Perk allocation sequencial no lote

**Source:** Agent C (Risk Assessor)

**Decisão:** No webhook handler do lote, alocar brindes **sequencialmente** (um de cada vez) para evitar contention no documento de EventPerk no Firestore. Não usar `Promise.all()` para alocações.

**Impacto:** Webhook de lote é mais lento (até ~50 × latência de 1 alocação) mas seguro. Para 50 participantes com brinde disponível, tempo estimado: ~2-5 segundos. Aceitável pois o usuário não aguarda o webhook em tempo real.

---

## D001-004: Idempotência no nível do lote

**Source:** Agent C (Risk Assessor)

**Decisão:** Além da idempotência por inscrição individual (`isBrindeProcessed()`), adicionar checagem no nível do lote: se `batch.status === 'confirmado'`, retornar sucesso imediatamente sem reprocessar.

**Impacto:** `ProcessBatchPayment` use case (ou extensão do `ProcessAsaasWebhook`) verifica `batch.status` antes de iterar sobre `inscriptionIds`.

---

## D001-005: Endpoint batch requer autenticação obrigatória

**Source:** Agent C (Risk Assessor)

**Decisão:** `POST /api/batch-inscriptions` retorna 401 se não houver Bearer token válido. Nenhum fallback para guest. O `userId` do token é armazenado como `responsavelUserId` no batch.

**Impacto:** Diferente do `POST /api/inscriptions` que aceita guest. A rota batch deve verificar token antes de qualquer operação.

---

## D001-006: Reutilização de confirmManually para aprovação CASH

**Source:** Agent B (Dependency Mapper)

**Decisão:** Para aprovação CASH pelo admin, reutilizar `inscription.confirmManually(confirmedBy: string)` que já existe na entidade `Inscription`. O `confirmedBy` recebe o `userId` do admin que aprovou.

**Impacto:** Não criar método novo na entidade. Criar use case `ConfirmBatchCashPayment` que itera sobre `inscriptionIds` e chama `confirmManually` em cada um, depois atualiza `batch.status = 'confirmado'`.

---

## D001-007: Exclusão do lote reutiliza DeleteInscription

**Source:** Agent A (Current State Mapper)

**Decisão:** Use case `DeleteBatch` chama `DeleteInscription` N vezes para as inscrições do lote, depois exclui o documento `batchInscriptions/{batchId}`. O `DeleteInscription` já cancela o pagamento Asaas — mas como o lote tem um único payment, cancelar apenas uma vez antes de deletar as inscrições.

**Impacto:** Sequência: (1) cancelar payment Asaas se PIX pendente → (2) deletar inscrições individuais → (3) deletar batch document.

---

## D001-008: Página dedicada para inscrição coletiva

**Source:** Decisão do usuário na conversa

**Decisão:** Rota `/eventos/[eventId]/inscricao-coletiva` — página própria com proteção de autenticação server-side. A página do evento mostra botão "Inscrever grupo" visível apenas para usuários logados.

**Impacto:** Novo arquivo `src/app/(main)/eventos/[id]/inscricao-coletiva/page.tsx`. Sem alteração na `SmartInscriptionForm`.
