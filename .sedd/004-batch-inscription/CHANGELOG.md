# Changelog — 004-batch-inscription

## [2026-05-09] — Migration 001 criada

- Análise de arquitetura via 3 sub-agents (Current State, Dependency, Risk)
- Divergência crítica encontrada: Gender deve ser `'masculino' | 'feminino'`
- 8 decisions registradas em decisions.md
- 30 tasks geradas cobrindo domain → infra → application → API → frontend → admin → testes
- 18 acceptance criteria definidos
- Coverage da expectativa: ~95% 🟢

## [2026-05-09] — Feature criada

- Spec inicial criada com 7 user stories
- Análise de arquitetura via 3 agentes paralelos
- Contrato de arquitetura definido e salvo
- Interfaces TypeScript geradas (BatchInscription, BatchParticipant, DTOs, Admin)
- UI mockups criados: batch-form.md, cpf-lookup-batch.md
- Decisões de design confirmadas:
  - Apenas usuários logados podem criar lotes
  - Responsável preenche dados completos (mesmo que GuestInscriptionForm)
  - Participantes: apenas nome + sexo
  - Cidade: campo único para todo o lote
  - Limite: 50 participantes
  - Pagamento: PIX (único) ou dinheiro físico (confirmação manual pelo admin)
  - Firebase: coleção top-level `batchInscriptions` com array embedado
  - externalReference webhook: `eventId:batch:batchId`
  - Admin: aprovar pagamento dinheiro + excluir lote inteiro
  - Página dedicada para inscrição coletiva (não tab embutida no evento)
