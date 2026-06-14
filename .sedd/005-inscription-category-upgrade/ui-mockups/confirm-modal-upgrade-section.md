# Mockup — Seção "Trocar Categoria" no ConfirmModal (admin)

Adicionada ao modal de detalhe da inscrição em `admin/eventos/[id]/page.tsx`.
Visível apenas quando a inscrição está `confirmado` e sem `pendingUpgrade` ativo.

```
┌────────────────────────────────────────────────────────┐
│  Detalhe da Inscrição                            [X]   │
├────────────────────────────────────────────────────────┤
│  Maria Souza · 123.456.789-00                          │
│  Categoria atual: Redenção (R$ 120,00)  · PIX · ✅      │
│  ...                                                   │
│                                                        │
│  ── Trocar categoria / cobrar diferença ──────────────│
│  Nova categoria:  [ Outras Localidades  ▼ ]           │
│  Método da diferença: ( ) PIX  ( ) Cartão  ( ) Dinheiro│
│                                                        │
│  Preview:                                              │
│    Diferença (base):           R$ 80,00               │
│    Taxa (PIX):                 R$  1,99               │
│    Total a cobrar:             R$ 81,99               │
│    * preço respeita a data da inscrição (early bird)  │
│                                                        │
│            [ Gerar upgrade e abrir cobrança ]          │
└────────────────────────────────────────────────────────┘
```

Estados:
- Downgrade (diferença ≤ 0): esconde "Total a cobrar"; mostra aviso
  "Categoria mais barata — sem cobrança; estorno manual via Asaas" e botão
  vira "Trocar categoria (sem cobrança)".
- Já existe upgrade pendente: seção some; aparece badge "Upgrade pendente"
  com botões [Abrir cobrança] (reabre a aba dedicada) e [Cancelar upgrade].
- Ao clicar "Gerar upgrade": chama POST upgrade → `window.open(.../upgrade, '_blank')`.
```

# Badge "Upgrade pendente" (lista e detalhe admin)

```
  Maria Souza   Redenção → Outras Localidades   [ Upgrade pendente ⏳ ]
```
