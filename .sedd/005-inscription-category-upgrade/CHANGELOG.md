# Changelog — 005 Inscription Category Upgrade

## [2026-06-14] - Feature Created

- Criada especificação inicial (spec.md) com Expectation no topo.
- 6 user stories (admin upgrade, página dedicada, webhook, consulta pública, cancelar, receita).
- 7 regras de negócio (cálculo base por data, taxa por cima, só upgrade, pré-condições,
  upgrade pendente, idempotência, métodos).
- 5 garantias de não-regressão (consulta pública por CPF, SSE participante, aviso de
  suporte, receita, brinde/pagamento original intocados).
- Architecture Contract definido e salvo em _meta.json (externalReference de ajuste,
  invariante de `tipo`, mudança de categoria só via applyUpgrade, receita por inscription.valor).
- interfaces.ts com contratos de domínio, use cases, webhook, SSE e consulta pública.
- 3 mockups: seção do ConfirmModal, página dedicada, aviso na consulta por CPF.
- 4 Open Questions [NEEDS_CLARIFICATION] para o /sedd.clarify.

## [2026-06-14] - Migration 001 (clarify)

- 4 questões resolvidas: contato = whatsappContato; SSE com ID token em query param (SSE
  mantido como padrão); vencimento +3 dias; dinheiro registra confirmedBy=adminId.
- 12 decisões registradas (decisions.md), incl. invariante de `tipo`, externalReference de
  ajuste, downgrade sem refund, receita inalterada no código.
- 24 tasks geradas (domínio → aplicação → API → UI → não-regressão → validação).
- 13 critérios de aceite (acceptance.md).
- Migração 001 marcada como in-progress no _meta.json.
