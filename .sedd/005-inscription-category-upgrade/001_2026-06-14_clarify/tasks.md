# Tasks - Migration 001

**Migration:** 001
**Timestamp:** 2026-06-14_clarify
**Feature:** 005-inscription-category-upgrade
**Branch:** main (não criar branch, não commitar)
**Parent:** (none)

## Summary
Total: 25 | Completed: 25 | Pending: 0

> Nota: T001-025 adicionada na auditoria pré-aplicação (DeleteInscription com múltiplos pagamentos).

## Tasks

### Domínio (Foundation)
- [x] T001-001 [Foundation] Criar VO `PendingUpgrade` em `src/server/domain/inscription/value-objects/PendingUpgrade.ts` (targetCategoryId, targetValorCents, diferencaBaseCents, adjustmentPaymentId, metodo, criadoEm) com create/fromPersistence/toJSON.
- [x] T001-002 [Foundation] Em `Inscription.ts`: `categoryId`/`valor` → `private _` + getters; adicionar `pendingUpgrade` (+getter), `requestUpgrade(u)`, `applyUpgrade()` (seta categoryId/valor, limpa pendingUpgrade), `cancelUpgrade()`. Incluir `pendingUpgrade` em `toJSON`/`fromPersistence`/`CreateInscriptionDTO` n/a.
- [x] T001-003 [Foundation] Em `Payment.ts`: campo opcional `tipo: 'INSCRICAO'|'AJUSTE'` (default `'INSCRICAO'`) em create/fromPersistence/toJSON + getter.
- [x] T001-004 [Foundation] Persistência: `FirebaseInscriptionRepositoryAdmin` mapeia `pendingUpgrade` (doc <-> entidade); `FirebasePaymentRepositoryAdmin` mapeia `tipo`.
- [x] T001-005 [GNR1] `FirebasePaymentRepositoryAdmin.findByInscriptionId` passa a ignorar `tipo === 'AJUSTE'` (filtro em memória, `tipo` ausente = primário). `findByAsaasPaymentId` inalterado.
- [x] T001-006 [Test] Testes de domínio: requestUpgrade/applyUpgrade/cancelUpgrade; Payment.tipo default; findByInscriptionId ignora AJUSTE (e mantém legado sem tipo).

### Aplicação (Use Cases)
- [x] T001-007 [US1] Helper de cálculo `computeUpgradePreview(inscription, novaCategoria)`: diferencaBase = `novaCategoria.getCurrentPrice(inscription.criadoEm).getCents() − inscription.valorCents`; breakdown por método via `AsaasFeeCalculator`; flag `isDowngrade`.
- [x] T001-008 [US1] `RequestInscriptionUpgrade.ts` (`application/inscription/`): valida inscrição `confirmado` + categoria nova existente/diferente; downgrade → aplica troca + aviso (D001-005); upgrade → cria cobrança Asaas (PIX/CARD, `externalReference eventId:adjustment:inscriptionId`, dueDate +3d) ou intent CASH, salva `Payment{tipo:'AJUSTE'}`, `inscription.requestUpgrade(...)`. Idempotência (D001-012).
- [x] T001-009 [US3] `ProcessAsaasWebhook`: branch `:adjustment:` → `findByAsaasPaymentId`, marca RECEIVED/CONFIRMED (idempotente), `inscription.applyUpgrade()` (verifica adjustmentPaymentId), **não** realoca brinde.
- [x] T001-010 [Cash] `ConfirmUpgradeCashPayment.ts`: confirma Payment AJUSTE (status CONFIRMED, `confirmedBy=adminId`) + `applyUpgrade`.
- [x] T001-011 [US5] `CancelInscriptionUpgrade.ts`: cancela cobrança Asaas (try/catch), remove/cancela Payment AJUSTE, `inscription.cancelUpgrade()`.
- [x] T001-012 [Test] Testes de use cases + webhook: upgrade early-bird por data; taxa só sobre a diferença; downgrade; regenerar pendente; webhook confirma só o AJUSTE, aplica upgrade, idempotente, sem brinde; cash confirmedBy.

### API (rotas admin, verifyAdmin)
- [x] T001-013 [US1] `GET .../inscriptions/[inscriptionId]/upgrade/preview?newCategoryId&metodo` → UpgradePreview.
- [x] T001-014 [US1] `POST .../inscriptions/[inscriptionId]/upgrade` (body newCategoryId, metodo) → RequestInscriptionUpgrade.
- [x] T001-015 [Cash] `POST .../upgrade/confirm-cash` → ConfirmUpgradeCashPayment (adminId do token).
- [x] T001-016 [US5] `POST .../upgrade/cancel` → CancelInscriptionUpgrade.
- [x] T001-017 [US2] `GET .../upgrade/status-stream?adjustmentPaymentId&token` → SSE espelhando `status-stream`, escutando o Payment AJUSTE (por id) + inscription.pendingUpgrade; valida ID token (verifyAdmin) antes de abrir (D001-007).

### UI
- [x] T001-018 [US1] `useUpgradeSSE.ts` (espelha `useInscriptionSSE`) + hook de mutação `useRequestInscriptionUpgrade`/cancel/confirm-cash em `src/hooks/mutations/`.
- [x] T001-019 [US1] Seção "Trocar categoria" no `ConfirmModal` (`admin/eventos/[id]/page.tsx`): select categoria + método + preview (GET preview); ao gerar → `window.open(.../upgrade, '_blank')`. Esconde quando já há pendingUpgrade.
- [x] T001-020 [US1] Badge "Upgrade pendente (atual → nova)" na lista/detalhe admin; expor `pendingUpgrade` em `InscriptionWithDetails` (`adminService`/types + `ListEventInscriptions`).
- [x] T001-021 [US2] Página dedicada `src/app/minha-conta/admin/eventos/[id]/inscricoes/[inscriptionId]/upgrade/page.tsx` (admin-only): QR/copia-e-cola PIX, link checkout cartão (compartilhar), botão confirmar dinheiro; estado via `useUpgradeSSE` ("Aguardando pagamento" → "Upgrade confirmado").
- [x] T001-022 [US4] Consulta pública por CPF: `LookupInscriptionByCPF` expõe `pendingUpgrade` (já em toJSON) + nomes de categoria + `whatsappContato`; UI de `/eventos` renderiza área "Upgrade pendente — contate o suporte" (WhatsApp do evento).

### Não-regressão / Validação
- [x] T001-025 [GNR/gap] `DeleteInscription` deixa de assumir 1 pagamento por inscrição: adicionar `findAllByInscriptionId` ao `IPaymentRepository`/`FirebasePaymentRepositoryAdmin` e, no delete, cancelar na Asaas + deletar TODOS os pagamentos não-confirmados (inclui AJUSTE pendente), evitando cobrança/doc órfãos. (Achado na auditoria pré-aplicação.)
- [x] T001-023 [GNR2] `status-stream/route.ts` (participante): `paymentRef.onSnapshot` escolhe o doc com `tipo !== 'AJUSTE'` (filtro em memória). Teste: consulta por CPF e SSE do participante seguem mostrando o pagamento original com um AJUSTE presente. Teste GNR4: card de receita reflete novo `inscription.valor` após applyUpgrade.
- [x] T001-024 [Validation] `npm test && npm run lint`; smoke manual em sandbox Asaas (gerar diferença PIX, pagar, ver SSE confirmar e categoria/valor trocarem; testar cash e cancel).

## Dependencies

```
T001-001 → T001-002 → T001-004 → T001-005
T001-003 → T001-004
(T001-002,003,004,005) → T001-006

T001-002,003,005 → T001-007 → T001-008 → T001-009,010,011 → T001-012

T001-008 → T001-013,014
T001-010 → T001-015
T001-011 → T001-016
T001-009 + T001-005 → T001-017

T001-013,014,017 → T001-018 → T001-019,020,021
T001-005 + T001-022 (lookup) → T001-022 (UI)
T001-005 → T001-023

(tudo) → T001-024
```

Paralelizável: T001-001 ‖ T001-003; T001-013..016 entre si; T001-019 ‖ T001-020 ‖ T001-021 ‖ T001-022 após hooks.

---

## Acceptance Criteria

Ver `acceptance.md` para checklist de verificação.
