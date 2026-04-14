# Clarification - Migration 001

**Timestamp:** 2026-04-12 04:30:00
**Feature:** 003-q4-news
**Parent:** (none)

## Expected Outcome

> Implementação completa do Q4-News com página pública de listagem/detalhe, painel admin com CRUD, permissão granular adm-q4-news, e extração automática de thumbnail do YouTube. Seguindo padrão DDD do módulo de eventos, early return, zero comentários inúteis.

## Architecture Assessment

Análise feita durante /sedd.specify com 3 sub-agents. Resumo:
- Projeto usa DDD em camadas (domain → application → infrastructure → api → frontend)
- Módulo de eventos é a referência direta (mesma stack, mesmo padrão)
- Header.tsx tem nav links hardcoded, admin layout.tsx tem navItems array
- Permissão atual é binária (user/admin), precisa ser estendida para granular
- Firestore via Firebase Admin SDK, sem migration — schema é implícito

## Notes & Discussions

### Note 001 — Diretrizes de código
**User said:** early return, zero comentários inúteis, seguir design system existente

**Key Points:**
- **[TASK_SOURCE:user-req]** Early return obrigatório em todas as funções
- **[TASK_SOURCE:user-req]** Zero comentários que repetem o código
- **[TASK_SOURCE:user-req]** Design system existente (tema escuro, gold accent)
- **[TASK_SOURCE:constraint]** Consistência com módulo de eventos

### Note 002 — Campos do formulário
**User said:** todos os campos obrigatórios (slug auto, título, resumo, conteúdo, youtube url, status)

**Key Points:**
- **[TASK_SOURCE:user-req]** Slug: opcional no form, gerado auto do título se vazio
- **[TASK_SOURCE:user-req]** Título: obrigatório
- **[TASK_SOURCE:user-req]** Resumo: obrigatório (texto curto pra listagem)
- **[TASK_SOURCE:user-req]** Conteúdo: obrigatório (texto completo pra detalhe)
- **[TASK_SOURCE:user-req]** Link YouTube: obrigatório, com preview de thumbnail
- **[TASK_SOURCE:user-req]** Status: obrigatório (rascunho/publicado)
- **[TASK_SOURCE:ai-suggestion]** Campos auto: youtubeVideoId, thumbnailUrl, autorId, autorNome, timestamps

### Note 003 — Restrições
- **[TASK_SOURCE:constraint]** NÃO criar rich text editor
- **[TASK_SOURCE:constraint]** NÃO criar tags/categorias
- **[TASK_SOURCE:constraint]** NÃO criar contador de visualizações
- **[TASK_SOURCE:constraint]** NÃO usar biblioteca externa pra YouTube embed
- **[TASK_SOURCE:edge-case]** Campo permissions[] pode ser undefined em usuários existentes — tratar graciosamente

## Expectation Details

### DEVE fazer:
- Criar domínio q4news completo (entidade, repository, use cases, schemas Zod)
- Implementar permissão granular adm-q4-news com campo permissions[] no User
- Criar 4 API routes (2 públicas + 2 admin)
- Criar página pública /q4-news + /q4-news/[id]
- Criar painel admin /minha-conta/admin/q4-news com modal CRUD
- Adicionar Q4-News na navbar e menu admin
- Extrair thumbnail/videoId automaticamente do YouTube URL
- Todos os campos do formulário obrigatórios
- Early return em todas as funções
- Seguir design system existente
- Zero comentários inúteis

### NÃO DEVE fazer:
- Rich text editor
- Sistema de tags/categorias
- Contador de visualizações
- Campo destaque
- Biblioteca externa pra YouTube
