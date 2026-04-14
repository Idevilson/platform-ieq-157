# Implementation Constraints — Feature 002

Constraints obrigatórias para `/sedd.implement` desta feature. Estas regras valem para **toda task** gerada — não há exceções sem confirmação explícita do usuário.

---

## C1 — Sem comentários inúteis

- **NÃO** escrever comentários que descrevem o que o código óbvio faz
- **NÃO** escrever comentários redundantes com nomes de função/variável
- **NÃO** comentários de seção (`// ─── Helpers ───`) só por organização
- **NÃO** TODO sem ticket associado
- **NÃO** comentários `// added for X` ou `// used by Y`
- **SIM** a comentários quando: invariante sutil, workaround de bug específico, restrição de framework não-óbvia, comportamento que surpreenderia o leitor
- **SIM** a JSDoc curto (1 linha) para tipos/funções públicas exportadas se agregar valor real

## C2 — SOLID obrigatório

| Princípio | Aplicação prática nesta feature |
|---|---|
| **S** — Single Responsibility | Use case = 1 arquivo. Componente React = 1 responsabilidade. Hook = 1 preocupação. |
| **O** — Open/Closed | `IAsaasFeeCalculator` deve permitir adicionar boleto/cartão/PIX sem modificar implementações existentes. |
| **L** — Liskov | Mocks de repositório nos testes passam pelos mesmos contratos do impl real. Sem `instanceof` checks. |
| **I** — Interface Segregation | `IEventPerkRepository` separado de `IEventRepository`. Não criar `IGodRepository`. |
| **D** — Dependency Inversion | Use cases dependem de interfaces (`domain/`), nunca de implementações (`infrastructure/`). Já é padrão do projeto — manter. |

Se uma task pedir algo que viola SOLID por conveniência: **parar e perguntar antes**.

## C3 — vercel-react-best-practices (57 regras)

Skill instalada em `~/.claude/skills/vercel-react-best-practices/` e configurada em `sedd.config.json → hooks.skills`. Aplicar **TODAS** as regras pertinentes em todo código React/Next.js novo desta feature.

### Regras críticas para esta feature

#### `async-*` (CRITICAL — Eliminating Waterfalls)

- **`async-parallel`**: Em qualquer use case que faça múltiplas leituras independentes, usar `Promise.all`. Ex.: `CreatePaymentForInscription` lê `inscription`, `event`, `user` — paralelizar.
- **`async-suspense-boundaries`**: Página `/eventos/geracao-forte` usa `<Suspense>` para streaming do contador de brindes (`PerkCounter`) sem bloquear o hero.
- **`async-api-routes`**: Em route handlers, iniciar promises cedo e await tarde.

#### `bundle-*` (CRITICAL — Bundle Size)

- **`bundle-barrel-imports`**: NÃO criar `index.ts` re-exportador. Importar direto do arquivo (`import { EventCard } from '@/components/eventos/EventCard'`, NÃO `from '@/components/eventos'`).
- **`bundle-dynamic-imports`**: `CardPaymentForm` (com SDK Asaas) deve usar `next/dynamic` — só carrega quando o método "Cartão" é selecionado.
- **`bundle-defer-third-party`**: Asaas SDK carregado após hidratação inicial.

#### `server-*` (HIGH — Server-Side Performance)

- **`server-cache-react`**: Em RSC, usar `React.cache()` para deduplicar leituras do mesmo evento dentro de uma única request.
- **`server-parallel-fetching`**: Página `/eventos/geracao-forte` paraleliza fetch do evento, das categorias e do perk summary.
- **`server-serialization`**: Passar para client components apenas o mínimo necessário (não passar entities inteiras).
- **`server-auth-actions`**: Endpoints admin (`/api/admin/events/.../perks`) autenticam como qualquer outra API route.

#### `client-*` (MEDIUM-HIGH — Client-Side)

- O projeto usa **TanStack Query**, não SWR. Adaptar `client-swr-dedup` → usar `useQuery` com `staleTime` adequado.
  - `usePerkSummary` → `staleTime: 30_000` (contador de brindes)
  - `useEventCategories` → `staleTime: 5 * 60_000` (já é o padrão atual)
- **`client-passive-event-listeners`**: Para qualquer scroll listener (improvável nesta feature).

#### `rerender-*` (MEDIUM — Re-render)

- **`rerender-derived-state-no-effect`**: `earlyBirdAtivo` é derivado da `now` vs `deadline` — calcular durante render, NUNCA via `useEffect`.
- **`rerender-functional-setstate`**: Em qualquer state update no `usePaymentPolling`, usar `setState(prev => ...)`.
- **`rerender-transitions`**: Para updates não-urgentes (ex.: atualização do contador), usar `startTransition`.

#### `rendering-*` (MEDIUM — Rendering)

- **`rendering-conditional-render`**: Usar ternário (`isOpen ? <X /> : null`), NÃO `isOpen && <X />` (evita render acidental de `0`/`false`).
- **`rendering-hoist-jsx`**: Hoistar JSX estático fora do componente (ex.: ícones SVG do hero).

#### `js-*` (LOW-MEDIUM)

- **`js-early-exit`**: Guards de validação no início dos use cases.
- **`js-set-map-lookups`**: Para qualquer lookup em arrays > 10 itens.

---

## C4 — Não-comprometido

Estas regras NÃO podem ser quebradas sem confirmação explícita do usuário:

- Não criar branches git automaticamente
- Não fazer commit nem push sem pedido explícito
- Não rodar comandos destrutivos sem confirmar
- Não criar arquivos `.md` de documentação que não foram pedidos
- Não introduzir backwards-compat hacks ou feature flags desnecessários

---

## Como o sedd.implement deve usar este arquivo

Antes de executar cada task:
1. Ler `CONSTRAINTS.md`
2. Verificar se a task envolve React/Next.js → aplicar C3
3. Verificar se a task envolve criação de classe/use case → aplicar C2
4. Em todo arquivo novo/modificado → aplicar C1
5. Antes de qualquer ação destrutiva → C4
