# Mockup — Área "Operação do Evento" (Fase 4) + auditoria

Rota `/minha-conta/operacao` — **gated por permissão** (admin OU usuário com
`deliver-kits`/`confirm-cash`). Mostra só os eventos do escopo do usuário.

## Busca + ação

```
┌ Operação do Evento ──────────────────────────────────────┐
│ Evento: [ Geração Forte ▼ ]   (só os do meu escopo)       │
│ Buscar: [ CPF ou nome........................ ] [Buscar]  │
├──────────────────────────────────────────────────────────┤
│ Idevilson Junior · 702.020.912-28 · Confirmado            │
│ Pagamento: PIX · Confirmado                               │
│                                                          │
│ KIT:                                                     │
│  [✓] Pulseira LED   🎁 (só porque ganhou o brinde)        │
│  [ ] Pulseira holográfica                                 │
│  [ ] Garrafa (M)                                          │
│      → marcar/desmarcar registra quem entregou + quando   │
│                                                          │
│ (se CASH e pendente)  [ ✓ Confirmar pagamento em dinheiro ]│
└──────────────────────────────────────────────────────────┘
```
- LED aparece desabilitada/oculta quando `temBrinde !== true`.
- "Confirmar dinheiro" só aparece para alvo CASH pendente e quem tem `confirm-cash`.

## Auditoria visível no painel admin (modais de detalhe)

```
Individual (ConfirmModal):
  Kit:
    Pulseira LED — entregue por Maria em 04/07 14:20
    Holográfica  — entregue por João em 04/07 14:21
    Garrafa      — pendente
  Pagamento (dinheiro): confirmado por Maria em 04/07 14:19

Lote (coletivo — entrega no nível do lote):
  Participantes: 10  ·  🎁 LED: 8 de 10 ganharam (exibição por participante)
  Kit do lote:
    Pulseira LED (8)  — entregue por Maria em 04/07 14:20
    Holográfica (10)  — entregue por Maria em 04/07 14:20
    Garrafa (10)      — pendente
  Lote: confirmado (dinheiro) por Maria em 04/07 14:19
  (a lista de participantes mostra quem tem 🎁 LED, mas a ENTREGA é coletiva)
```
