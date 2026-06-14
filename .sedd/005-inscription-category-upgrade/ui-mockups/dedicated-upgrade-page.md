# Mockup — Página dedicada de upgrade (nova aba, admin-only)

Rota: `/minha-conta/admin/eventos/[id]/inscricoes/[inscriptionId]/upgrade`
Protegida pelo `admin/layout.tsx` (`useRequireAdmin`). Aberta via `window.open(..., '_blank')`.
Estado em tempo real via `useUpgradeSSE`.

## Estado: aguardando pagamento (PIX)

```
┌──────────────────────────────────────────────────────────┐
│  Upgrade de categoria — Maria Souza                       │
│  Redenção  →  Outras Localidades                          │
├──────────────────────────────────────────────────────────┤
│  Diferença (base): R$ 80,00   Taxa: R$ 1,99               │
│  Total: R$ 81,99   ·   Método: PIX                        │
│                                                          │
│        ┌───────────────┐                                 │
│        │   [ QR CODE ]  │   Copia-e-cola:                 │
│        │               │   00020126...5204  [Copiar]     │
│        └───────────────┘   [Compartilhar no WhatsApp]    │
│                                                          │
│   ⏳ Aguardando pagamento...  (conexão SSE ● ao vivo)    │
│   A troca de categoria só será aplicada após o pagamento.│
│                                                          │
│                         [ Cancelar upgrade ]             │
└──────────────────────────────────────────────────────────┘
```

## Variações por método
- **Cartão:** no lugar do QR → `[ Abrir checkout ]` + `[Compartilhar link]`.
- **Dinheiro físico:** texto "Receber R$ 81,99 em espécie" +
  `[ ✓ Confirmar recebimento em dinheiro ]` (chama confirm-cash).

## Estado: confirmado (via SSE)

```
┌──────────────────────────────────────────────────────────┐
│  ✅ Upgrade confirmado!                                   │
│  Categoria atualizada para: Outras Localidades            │
│  Valor da inscrição agora: R$ 200,00                      │
│  Diferença paga: R$ 81,99 (PIX)                           │
│                                   [ Voltar ao evento ]    │
└──────────────────────────────────────────────────────────┘
```
