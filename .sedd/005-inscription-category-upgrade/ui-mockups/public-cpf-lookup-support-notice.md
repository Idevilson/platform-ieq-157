# Mockup — Aviso "Upgrade pendente" na consulta pública por CPF

Em `/eventos` (consulta por CPF). Renderizado quando a inscrição retornada tem
`pendingUpgrade`. NÃO mostra a cobrança de ajuste (filtrada); mostra o pagamento
original normalmente + este aviso.

```
┌──────────────────────────────────────────────────────────┐
│  Sua inscrição — Congresso Geração Forte                  │
│  Maria Souza · Categoria: Redenção · ✅ Pago              │
│  Pagamento: PIX · R$ 121,99 · Confirmado                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ⏳ Upgrade pendente                                │   │
│  │ Há uma atualização de categoria em andamento:     │   │
│  │ Redenção → Outras Localidades.                    │   │
│  │ Para concluir, falta o pagamento da diferença.    │   │
│  │                                                  │   │
│  │ Fale com o suporte para receber o meio de         │   │
│  │ pagamento (PIX, cartão ou dinheiro):              │   │
│  │            [ Falar com o suporte (WhatsApp) ]      │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

- Botão usa `whatsappContato` do evento.
- Texto deixa claro: a categoria ainda é a atual até o pagamento confirmar.
