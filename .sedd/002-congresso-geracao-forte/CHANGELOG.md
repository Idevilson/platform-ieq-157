# Changelog — 002-congresso-geracao-forte

## [2026-04-11] — Feature criada

- Spec inicial do *Congresso Setorizado da Geração Forte* (tema Follow Me, Marcos 8:34).
- Expectativa capturada (11 itens).
- Análise de arquitetura via 3 sub-agentes (Architecture Scout, Impact Analyzer, Pattern & Reuse Discovery).
- Architecture Contract congelado (tech stack, padrões, location bindings, decisões-chave).
- 7 user stories definidas (US1–US7).
- 14 functional requirements (FR-01 a FR-14).
- 4 NFRs (concorrência, idempotência, performance, auditoria).
- 9 NEEDS_CLARIFICATION listadas (datas, programação, cores de pulseira, refeições, métodos de pagamento, timezone, escopo do refator startup, política FIFO do brinde, localização do asset).
- `interfaces.ts` com DTOs estendidos (EventCategoryDTO, EventPerkDTO, InscriptionDTO, PaymentDTO com breakdown).
- 3 mockups ASCII: página do evento, checkout PIX com taxa, painel admin de brindes.
- Branch git **não criada** (preferência do usuário — trabalho na branch atual `main`).

## [2026-04-11] — Migration 001 (clarify)

- Resolveu 9 NEEDS_CLARIFICATION + 2 sub-pendências (parcelamento, tokenização)
- 12 decisões registradas (D001-001 a D001-012) + 3 derivadas (D001-D1, D001-D2, D001-D3)
- 61 tasks geradas em 10 áreas (Foundation, Domain, App, Infra, API, Front reusable, Front específico, Admin, Seed, Testes)
- 46 acceptance criteria definidos
- Insight crítico: ordem de inscrição (não pagamento) **simplificou a arquitetura** — eliminou race condition do brinde por desenho. EventPerk virou metadado descritivo.
- Asset `MARCA-DAGUA-02.png` movido para `src/assets/images/geracao-forte/follow-me-logo.png`
- Cartão de crédito habilitado com parcelamento até 12x e juros repassados ao pagante
- Tokenização cartão via Asaas SDK no frontend (sem PCI no backend)

## [2026-04-11] — Migration 001 (revisão D001-009)

- Política de alocação do brinde **revertida**: agora é **FIFO por pagamento confirmado** (não por ordem de inscrição)
- Os 500 primeiros pagamentos confirmados ganham a pulseira
- Alocação atômica via Firestore transaction no `ProcessAsaasWebhook`
- Idempotência via guard `inscription.temBrinde !== undefined`
- Tasks atualizadas: T001-008, T001-011, T001-012, T001-017, T001-018, T001-020, T001-025, T001-026, T001-052, T001-056, T001-057
- ACs atualizados: AC-016, AC-027, AC-028, AC-029, AC-031 + AC-031b adicionado
- `numeroInscricao` removido do escopo (não é mais necessário)
- Race condition agora é mitigada por: (a) Firestore retry, (b) guard de idempotência, (c) testes de carga
