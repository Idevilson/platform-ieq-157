# Mockup — Admin: Permissões & Usuários (Fase 1)

Nova aba no painel admin (`/minha-conta/admin/permissoes` e `/usuarios`).

## Catálogo de permissões

```
┌ Permissões ──────────────────────────────────────────────┐
│ chave            rótulo                  sistema  [+ Nova] │
│ deliver-kits     Entregar kits           ✓ sistema        │
│ confirm-cash     Confirmar dinheiro      ✓ sistema        │
│ adm-q4-news      Gerenciar Q4-News       ✓ sistema        │
│ check-in         Check-in (custom)       — custom   [edit]│
└──────────────────────────────────────────────────────────┘
```

## Atribuir permissão a um usuário (escopo por evento)

```
┌ Usuário: Maria (maria@x.com) ────────────────────────────┐
│ Permissões:                                              │
│  [✓] Entregar kits                                       │
│       Eventos:  [✓] Geração Forte  [ ] Startup  [ ] Todos │
│  [✓] Confirmar dinheiro                                   │
│       Eventos:  [✓] Geração Forte  [ ] Startup            │
│  [ ] Gerenciar Q4-News                                    │
│                                            [ Salvar ]     │
└──────────────────────────────────────────────────────────┘
```
- "Todos" = escopo global (`eventIds: ['*']`).
- Admin não precisa de permissões (bypassa tudo).

## Time do evento (derivado — sem coleção `teams`)

O "time" é só a visão de quem tem permissões de operação no evento. Atribuir permissões = criar
o time.

```
┌ Time — Geração Forte ────────────────────────────────────┐
│ Membro            Entrega   Caixa                         │
│ Maria (maria@x)     ✓         ✓                           │
│ João  (joao@x)      ✓         —                           │
│ Ana   (ana@x)       —         ✓                           │
│ (lista derivada de users.permissions; editar = tela Usuário)│
└──────────────────────────────────────────────────────────┘
```

