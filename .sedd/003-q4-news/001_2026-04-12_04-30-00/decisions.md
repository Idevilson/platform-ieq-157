# Decisions - Migration 001

## D001-001: Padrão DDD espelhando Eventos
**Source:** Architecture analysis + user confirmation
**Decision:** Toda a implementação segue exatamente o padrão do módulo de eventos (entity, repository, use cases, schemas, hooks, services).
**Impact:** Consistência, facilidade de manutenção, curva de aprendizado zero.

## D001-002: Permissão granular via campo permissions[]
**Source:** Spec + user confirmation
**Decision:** Adicionar campo `permissions: string[]` ao User entity e Firestore. Admin geral tem acesso a tudo. `adm-q4-news` dá acesso apenas ao Q4-News.
**Impact:** User entity precisa de novo método `hasPermission()`. API routes admin precisam de `verifyQ4NewsAdmin()`.

## D001-003: Todos os campos obrigatórios
**Source:** User (Note 002)
**Decision:** Slug (auto se vazio), título, resumo, conteúdo, YouTube URL e status são todos obrigatórios no schema Zod.
**Impact:** Schema mais restritivo, form validation mais simples.

## D001-004: YouTube embed nativo
**Source:** Constraint
**Decision:** Usar iframe nativo para embed do YouTube. Thumbnail extraída via `img.youtube.com/vi/{videoId}/maxresdefault.jpg`.
**Impact:** Zero dependências externas. Utility function para parse de 4 formatos de URL.

## D001-005: Código limpo
**Source:** User (Note 001)
**Decision:** Early return obrigatório. Zero comentários inúteis. Design system existente.
**Impact:** Aplica a todas as tasks.
