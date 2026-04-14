# Q4-News — Jornal Digital da Igreja

**Feature ID:** 003
**Created:** 2026-04-12
**Status:** Specified

---

## Expectation

> O Q4-News é o jornal digital da igreja, acessível por qualquer visitante do site através de um novo item "Q4-News" na barra de navegação superior. A página pública `/q4-news` exibe uma listagem de postagens em cards com thumbnail do YouTube (extraída automaticamente do link), título, resumo da descrição, data de publicação e autor. Ao clicar num card, o visitante é levado para `/q4-news/[slug]` onde vê o vídeo do YouTube em player embed responsivo, o texto completo da postagem e informações do autor/data. Apenas postagens com status "publicado" aparecem na listagem pública; rascunhos são invisíveis.
>
> Na área logada, usuários com a permissão `adm-q4-news` têm acesso a uma nova seção "Q4-News" em `/minha-conta/admin/q4-news`, onde podem criar, editar, publicar/despublicar e excluir postagens. O formulário de criação/edição possui campos para: título, descrição (texto com suporte a parágrafos), link do YouTube e status (rascunho/publicado). A thumbnail é gerada automaticamente a partir do link do YouTube sem necessidade de upload manual. A listagem admin mostra todas as postagens (incluindo rascunhos) com indicador visual de status, ordenadas por data de criação (mais recente primeiro).
>
> O sistema de permissões existente é estendido para incluir a role `adm-q4-news`, que é independente da role de admin geral — um usuário pode ter permissão apenas para gerenciar o Q4-News sem ser admin completo. Os dados são persistidos na coleção Firestore `q4-news-posts` seguindo o mesmo padrão DDD do módulo de eventos.

---

## User Stories

### US-001: Visitante vê listagem de notícias
Como visitante do site, quero acessar a página Q4-News pela navbar e ver as postagens publicadas em cards com thumbnail, título, resumo e data, para me manter informado sobre o jornal da igreja.

### US-002: Visitante vê detalhes de uma postagem
Como visitante, quero clicar em um card de notícia e ver a postagem completa com o vídeo do YouTube embutido e o texto completo, para assistir e ler o conteúdo.

### US-003: Admin cria postagem
Como usuário com permissão `adm-q4-news`, quero criar uma nova postagem informando título, descrição, link do YouTube e status, para publicar conteúdo no jornal da igreja.

### US-004: Admin edita postagem
Como admin Q4-News, quero editar postagens existentes (título, descrição, link, status), para corrigir informações ou atualizar conteúdo.

### US-005: Admin publica/despublica postagem
Como admin Q4-News, quero alternar o status de uma postagem entre rascunho e publicado, para controlar o que aparece na página pública.

### US-006: Admin exclui postagem
Como admin Q4-News, quero excluir postagens, para remover conteúdo desatualizado ou incorreto.

### US-007: Thumbnail automática do YouTube
Como admin Q4-News, quero que ao colar um link do YouTube a thumbnail seja extraída automaticamente, para não precisar fazer upload manual de imagem.

### US-008: Permissão granular adm-q4-news
Como administrador geral, quero atribuir a permissão `adm-q4-news` a usuários específicos sem dar acesso admin completo, para delegar a gestão do jornal a colaboradores.

---

## Architecture Analysis

### Current Architecture (Relevante)

**Tech Stack:** Next.js 15 (App Router) + TypeScript + Firebase Firestore + TailwindCSS + TanStack React Query + Zod

**Padrão DDD em camadas:**
```
src/server/domain/       → Entidades, Value Objects, Interfaces de Repository
src/server/application/  → Use Cases (1 arquivo = 1 caso de uso) + schemas Zod
src/server/infrastructure/ → Implementações Firebase (repositories)
src/app/api/             → Route handlers Next.js (público + admin)
src/app/(main)/          → Páginas públicas
src/app/minha-conta/admin/ → Páginas admin
src/components/          → Componentes React por feature
src/hooks/               → React Query hooks (queries + mutations)
src/lib/services/        → Service layer frontend (abstrai chamadas API)
src/shared/              → Types + constants compartilhados
```

### Impact Assessment

**Arquivos a MODIFICAR:**
1. `src/components/common/Header.tsx` — adicionar link "Q4-News" na navbar (desktop + mobile)
2. `src/app/minha-conta/admin/layout.tsx` — adicionar item "Q4-News" no menu admin
3. `src/shared/constants/index.ts` — adicionar `NewsStatus`, `NEWS_STATUSES`, `NEWS_STATUS_LABELS`
4. `src/shared/types/index.ts` — exportar novos types de q4news
5. `src/lib/services/adminService.ts` — adicionar métodos CRUD para q4-news
6. `src/server/domain/user/entities/User.ts` — adicionar método `hasPermission(perm)` ou `isQ4NewsAdmin()`
7. `src/server/domain/shared/errors/index.ts` — adicionar `NewsNotFoundError`

**Arquivos NOVOS (por camada):**

*Domain:*
- `src/server/domain/q4news/entities/NewsPost.ts`
- `src/server/domain/q4news/repositories/INewsPostRepository.ts`

*Application:*
- `src/server/application/q4news/schemas.ts`
- `src/server/application/q4news/CreateNewsPost.ts`
- `src/server/application/q4news/UpdateNewsPost.ts`
- `src/server/application/q4news/ListNewsPosts.ts`
- `src/server/application/q4news/GetNewsPostById.ts`
- `src/server/application/q4news/DeleteNewsPost.ts`

*Infrastructure:*
- `src/server/infrastructure/firebase/repositories/FirebaseNewsPostRepositoryAdmin.ts`

*API Routes:*
- `src/app/api/q4news/route.ts` (GET público)
- `src/app/api/q4news/[newsId]/route.ts` (GET público)
- `src/app/api/admin/q4news/route.ts` (GET + POST admin)
- `src/app/api/admin/q4news/[newsId]/route.ts` (PATCH + DELETE admin)

*Frontend:*
- `src/lib/services/q4newsService.ts`
- `src/hooks/queries/useQ4News.ts`
- `src/hooks/queries/useAdminQ4News.ts`
- `src/hooks/mutations/useAdminQ4NewsMutations.ts`
- `src/shared/types/q4news.ts`
- `src/components/q4news/NewsCard.tsx`
- `src/components/q4news/YoutubeEmbed.tsx`
- `src/components/admin/CreateNewsModal.tsx`

*Páginas:*
- `src/app/(main)/q4-news/page.tsx`
- `src/app/(main)/q4-news/[id]/page.tsx`
- `src/app/minha-conta/admin/q4-news/page.tsx`

### Reusable Assets

| Asset | Path | Como reutilizar |
|-------|------|-----------------|
| Entity pattern | `server/domain/event/entities/Event.ts` | Mesma estrutura: constructor privado, create/fromPersistence, toJSON/toSummary |
| Repository pattern | `server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin.ts` | Mesma estrutura: getAdminFirestore, mapToEntity, mapToFirestore, parseDate |
| Use case pattern | `server/application/event/CreateEvent.ts` | safeParse + generateSlug + save |
| API admin auth | `app/api/admin/events/route.ts:verifyAdmin()` | Reutilizar ou adaptar para permission granular |
| Query hooks | `hooks/queries/useEvents.ts` | Mesma estrutura: keys factory + useQuery |
| Mutation hooks | `hooks/mutations/useAdminEventMutations.ts` | Mesmo padrão: useMutation + invalidateQueries |
| Service layer | `lib/services/eventService.ts` | Mesma estrutura: apiClient.get → parse → return |
| Admin service | `lib/services/adminService.ts` | Estender com métodos para q4news |
| Modal pattern | `components/admin/CreateEventModal.tsx` | Mesmo padrão de form com useState + mutation |
| Admin page | `app/minha-conta/admin/page.tsx` | Tabela com filtros + modal de criação |

### Patterns to Follow

1. **Entities:** Constructor privado + `static create()` + `static fromPersistence()` + `toJSON()` + `toSummary()`
2. **Use Cases:** 1 arquivo por ação, Zod `safeParse()`, throw `ValidationError`
3. **Repository:** Interface no domain, implementação Firebase na infrastructure
4. **API Routes:** `verifyAdmin()` → use case → NextResponse.json()
5. **Hooks:** Query keys factory, staleTime 5min, invalidateQueries on mutation success
6. **Service:** `apiClient.get()` → check `response.success` → return data or throw
7. **Slug:** `generateSlug(titulo)` com opção de slug customizado

### Code Standards (Obrigatório)

1. **Design system existente:** tema escuro com gold accent, cards com border-gold/20, bg-bg-tertiary, text-text-primary/secondary/muted — seguir 100% o padrão visual já usado em eventos
2. **Early return:** todas as funções devem usar early return para reduzir aninhamento — zero `else` desnecessário
3. **Zero comentários inúteis:** nenhum comentário que repita o nome da função/variável, nenhum `// Importa X`, nenhum `// Handle Y` — só comentar regras de negócio não óbvias
4. **Padrão DDD existente:** entidades com constructor privado + factory methods, use cases com Zod safeParse, repositórios Firebase com mapToEntity/mapToFirestore
5. **Consistência:** nomes de arquivos, hooks, services e components seguem exatamente a convenção do módulo de eventos

### Risks & Considerations

1. **Permissão granular:** O sistema atual só tem `UserRole = 'user' | 'admin'`. Precisamos estender para suportar `adm-q4-news` sem quebrar a lógica existente de admin. Opção: adicionar campo `permissions: string[]` no User entity e Firestore.
2. **YouTube URL parsing:** Precisamos suportar múltiplos formatos: `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID`.
3. **Cache:** React Query com staleTime de 5min é suficiente para notícias (não precisam de real-time).

---

## Firestore Schema

### Coleção: `q4-news-posts`

```
{
  // Documento ID = slug gerado do título (ou customizado)
  titulo: string,
  descricao: string,                    // Texto resumo (max 500 chars)
  conteudo: string,                     // Texto completo (com parágrafos)
  youtubeUrl: string,                   // URL original do YouTube
  youtubeVideoId: string,              // Extraído: "dQw4w9WgXcQ"
  thumbnailUrl: string,                // Gerado: img.youtube.com/vi/{id}/maxresdefault.jpg
  status: 'rascunho' | 'publicado',
  autorId: string,                     // UID do Firebase Auth
  autorNome: string,                   // Nome do autor (desnormalizado para listagem)
  criadoEm: Timestamp,
  atualizadoEm: Timestamp,
  publicadoEm: Timestamp | null,      // Preenchido quando status muda para publicado
}
```

### Índices necessários
- `status` + `publicadoEm DESC` (listagem pública)
- `status` + `criadoEm DESC` (listagem admin)

---

## Permissão: adm-q4-news

### Extensão do modelo de permissões

**Firestore — documento do usuário:**
```
users/{uid} {
  ...campos existentes,
  permissions: ['adm-q4-news']   // Array de strings (novo campo)
}
```

**User Entity — novo método:**
```typescript
hasPermission(permission: string): boolean {
  return this.isAdmin() || this._permissions.includes(permission)
}
```

**API Route — verificação:**
```typescript
async function verifyQ4NewsAdmin(request: NextRequest): Promise<string | null> {
  // ... extrair token, buscar user
  if (!user.hasPermission('adm-q4-news')) return null
  return decodedToken.uid
}
```

Admin geral (`role: 'admin'`) automaticamente tem todas as permissões. Permissão `adm-q4-news` dá acesso apenas ao Q4-News.

---

## YouTube URL Utilities

### Parsing de Video ID

Formatos suportados:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/v/VIDEO_ID`

### Geração de thumbnail
```
https://img.youtube.com/vi/{videoId}/maxresdefault.jpg
```
Fallback: `hqdefault.jpg` (se maxresdefault não existir)

### Embed URL
```
https://www.youtube.com/embed/{videoId}
```
