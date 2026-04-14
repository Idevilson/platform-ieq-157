# Tasks - Migration 001

**Migration:** 001
**Timestamp:** 2026-04-12_04-30-00
**Parent:** (none)

## Summary
Total: 22 | Completed: 22 | Pending: 0

## Tasks

### Foundation — Domain Layer

- [x] T001-001 [Foundation] Create YouTube URL utility `src/lib/utils/youtube.ts` — parseVideoId (4 formatos), getThumbnailUrl, getEmbedUrl
- [x] T001-002 [Foundation] Create NewsPost entity `src/server/domain/q4news/entities/NewsPost.ts` — constructor privado, create/fromPersistence, toJSON/toSummary, publish/unpublish
- [x] T001-003 [Foundation] Create INewsPostRepository interface `src/server/domain/q4news/repositories/INewsPostRepository.ts`
- [x] T001-004 [Foundation] Add NewsStatus constants `src/shared/constants/index.ts` — NewsStatus type, NEWS_STATUSES, NEWS_STATUS_LABELS
- [x] T001-005 [Foundation] Add NewsNotFoundError `src/server/domain/shared/errors/index.ts`
- [x] T001-006 [Foundation] Create shared types `src/shared/types/q4news.ts` — NewsPostDTO, NewsPostSummaryDTO, request/response types + barrel export in index.ts

### Foundation — Permissions

- [x] T001-007 [Foundation] Extend User entity with permissions `src/server/domain/user/entities/User.ts` — add `_permissions: string[]` field + `hasPermission(perm)` method, handle undefined gracefully
- [x] T001-008 [Foundation] Update FirebaseUserRepositoryAdmin `src/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin.ts` — read/write permissions array from Firestore

### Infrastructure — Repository

- [x] T001-009 [Infrastructure] Create FirebaseNewsPostRepositoryAdmin `src/server/infrastructure/firebase/repositories/FirebaseNewsPostRepositoryAdmin.ts` — findById, findAll (com paginação + filtro status), save, update, delete, mapToEntity, mapToFirestore

### Application — Use Cases + Schemas

- [x] T001-010 [Application] Create Zod schemas `src/server/application/q4news/schemas.ts` — createNewsPostSchema, updateNewsPostSchema (todos campos obrigatórios, YouTube URL validada)
- [x] T001-011 [Application] Create CreateNewsPost use case `src/server/application/q4news/CreateNewsPost.ts` — safeParse, generateSlug (ou slug custom), extrair videoId/thumbnail, salvar
- [x] T001-012 [Application] Create ListNewsPosts use case `src/server/application/q4news/ListNewsPosts.ts` — paginação, filtro por status, ordenação por criadoEm desc
- [x] T001-013 [Application] Create GetNewsPostById use case `src/server/application/q4news/GetNewsPostById.ts`
- [x] T001-014 [Application] Create UpdateNewsPost use case `src/server/application/q4news/UpdateNewsPost.ts` — partial update, recalcular videoId/thumbnail se URL mudou, setar publicadoEm ao publicar
- [x] T001-015 [Application] Create DeleteNewsPost use case `src/server/application/q4news/DeleteNewsPost.ts`

### API Routes

- [x] T001-016 [API] Create public routes `src/app/api/q4news/route.ts` (GET list publicados) + `src/app/api/q4news/[newsId]/route.ts` (GET detalhe)
- [x] T001-017 [API] Create admin routes `src/app/api/admin/q4news/route.ts` (GET list all + POST create) + `src/app/api/admin/q4news/[newsId]/route.ts` (PATCH update + DELETE) — com verifyQ4NewsAdmin usando hasPermission('adm-q4-news')

### Frontend — Services + Hooks

- [x] T001-018 [Frontend] Create q4newsService `src/lib/services/q4newsService.ts` — listPublished, getById + extend adminService.ts com CRUD admin
- [x] T001-019 [Frontend] Create query hooks `src/hooks/queries/useQ4News.ts` — q4newsKeys, useQ4NewsList, useQ4NewsById + `src/hooks/queries/useAdminQ4News.ts`
- [x] T001-020 [Frontend] Create mutation hooks `src/hooks/mutations/useAdminQ4NewsMutations.ts` — useCreateNewsPost, useUpdateNewsPost, useDeleteNewsPost

### Frontend — Pages + Components

- [x] T001-021 [UI] Create public pages — `src/app/(main)/q4-news/page.tsx` (listagem em cards com thumbnail, título, resumo, data, autor) + `src/app/(main)/q4-news/[id]/page.tsx` (detalhe com YouTube embed responsivo + conteúdo completo)
- [x] T001-022 [UI] Create admin page + modal — `src/app/minha-conta/admin/q4-news/page.tsx` (tabela com filtro status + busca) + CreateNewsModal com form (slug, título, resumo, conteúdo, YouTube URL com preview thumbnail, status radio) + adicionar "Q4-News" na navbar `Header.tsx` e no menu admin `layout.tsx`

## Dependencies

```
T001-001 ──────────────────────────────────────┐
T001-002, T001-003, T001-004, T001-005, T001-006 → T001-009 → T001-010..015 → T001-016..017
T001-007, T001-008 ────────────────────────────────────────────────────────→ T001-017
T001-016..017 → T001-018 → T001-019, T001-020 → T001-021, T001-022
```

---

## Acceptance Criteria

Ver `acceptance.md` para checklist de verificação.
