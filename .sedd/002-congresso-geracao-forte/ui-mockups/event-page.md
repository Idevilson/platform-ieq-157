# Mockup — Página `/eventos/geracao-forte`

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header global IEQ]                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           ┌─────────────────────────────────┐                   │
│           │       GERAÇÃO FORTE             │                   │
│           │     ╔═══════════════╗           │                   │
│           │     ║  FOLLOW ME    ║           │                   │
│           │     ╚═══════════════╝           │                   │
│           │       Marcos 8:34               │                   │
│           └─────────────────────────────────┘                   │
│                                                                 │
│              [ INSCREVA-SE AGORA ]                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  "Se alguém quer vir após mim, negue-se a si mesmo,             │
│   tome a sua cruz e siga-me." — Marcos 8:34                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────── 🎁 BRINDE ESPECIAL ────────────┐                │
│   │                                            │                │
│   │   Os primeiros 500 inscritos ganham        │                │
│   │      uma pulseira colorida exclusiva       │                │
│   │                                            │                │
│   │   ╔══════════════════════════╗             │                │
│   │   ║    347 / 500 restantes   ║             │                │
│   │   ╚══════════════════════════╝             │                │
│   └────────────────────────────────────────────┘                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PROGRAMAÇÃO                                                   │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│   │  Dia 1     │  │  Dia 2     │  │  Dia 3     │                │
│   │  ...       │  │  ...       │  │  ...       │                │
│   └────────────┘  └────────────┘  └────────────┘                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   INSCRIÇÃO                                                     │
│                                                                 │
│   Early bird até 31/05/2026                                     │
│                                                                 │
│   ┌────────────────────────┐  ┌────────────────────────┐        │
│   │  REDENÇÃO              │  │  OUTRAS LOCALIDADES    │        │
│   │                        │  │                        │        │
│   │  R$ 120,00             │  │  R$ 200,00             │        │
│   │  (após 31/05: R$ 150)  │  │  (após 31/05: R$ 250)  │        │
│   │                        │  │                        │        │
│   │  Para moradores de     │  │  ✓ Almoço incluso      │        │
│   │  Redenção              │  │  ✓ Janta inclusa       │        │
│   │                        │  │                        │        │
│   │  [   SELECIONAR    ]   │  │  [   SELECIONAR    ]   │        │
│   └────────────────────────┘  └────────────────────────┘        │
│                                                                 │
│   [ SmartInscriptionForm — logado ou guest ]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Variantes

### Estado: brinde esgotado
```
   ┌──────────── 🎁 BRINDE ESPECIAL ────────────┐
   │                                            │
   │      Pulseiras esgotadas — obrigado!       │
   │      500 / 500 alocadas                    │
   └────────────────────────────────────────────┘
```

### Estado: após 31/05 (early bird expirado)
```
   Inscrições — preço cheio
   ┌────────────────────────┐  ┌────────────────────────┐
   │  REDENÇÃO              │  │  OUTRAS LOCALIDADES    │
   │  R$ 150,00             │  │  R$ 250,00             │
   │  (early bird encerrado)│  │  (early bird encerrado)│
```

### Estado: usuário já inscrito
- Renderiza `<AlreadyInscribedCard />` no lugar do form de inscrição.
