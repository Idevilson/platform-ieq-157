# Decisions - Migration 001

**Timestamp:** 2026-05-15T15:47:06.350Z
**Branch:** 005-vinculo-igreja-usuario

## Decisions Made

| #         | Decision                                                                                     | Rationale                                                                                                                                                              |
|-----------|----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| D001-001  | Dispensa do modal de seleção via `sessionStorage[CHURCH_MODAL_DISMISS_KEY]`                  | Não persiste no schema do user; reaparece em sessão nova mantendo lembrete ativo. Baixa fricção e zero migração de dados.                                              |
| D001-002  | Nenhuma notificação ao usuário quando admin remove vínculo                                   | Não há infra de notificação na plataforma. Fluxo reativo (refetch do perfil → invalida cache → badge mostra "Sem vínculo" → modal reabre) cobre a UX sem código extra. |
| D001-003  | Usuário pode se auto-desvincular via "Remover vínculo" em `/minha-conta`                     | Vínculo é declarativo; self-service preserva agência do usuário. Use case `ClearUserChurch` separado de `AdminRemoveUserFromChurch` para auditoria.                    |
| D001-004  | **1 usuário pertence a no máximo 1 igreja por vez** (`churchId: string \| null`)             | Pertencimento eclesiástico singular. Schema mais simples, validações triviais, troca atômica via transação. Sistema continua suportando N igrejas cadastradas.         |
| D001-005  | Feature 005 não acopla com spec 002 (Congresso Geração Forte)                                | Spec 002 em clarify in-progress e evento iminente. Acoplar entre specs gera churn/regressão. Possível convergência futura como follow-up.                              |
| D001-006  | Contador `church.totalMembros` mantido **transacionalmente** via `db.runTransaction()`       | Sem Cloud Functions no projeto. `count()` em runtime escala mal. Transação Admin SDK dá consistência forte. Primitiva: `IChurchRepository.transferUserChurch()`.       |

## Architectural Implications

### Domain
- `User.churchId: string | null` (não array)
- Métodos no User entity: `setChurch(churchId)`, `clearChurch()`, `getChurchId()`
- Sem entidade intermediária de "membership" — relacionamento direto via foreign key

### Application
- 3 use cases para vínculo, todos transacionais:
  - `SetUserChurch(userId, newChurchId)` — cobre vincular E trocar
  - `ClearUserChurch(userId)` — auto-serviço
  - `AdminRemoveUserFromChurch(userId, churchId)` — variante admin (verifica permissão `role: 'admin'`)
- Validação Zod nas requests; erros de domínio (`ChurchNotFoundError`, `ChurchInactiveError`, `UserNotLinkedToChurchError`) mapeados em 404/409

### Infrastructure
- `FirebaseChurchRepositoryAdmin.transferUserChurch()` usa `firestore.runTransaction()`
- Seed `seedSedeRedencao()` idempotente (set com merge)
- Sem Cloud Functions

### API
- `/api/user/church` (singular) — REST resource único do user
  - `GET` retorna `{ churchId, church }` (igreja resolvida ou null)
  - `PUT { churchId }` define/troca (idempotente)
  - `DELETE` remove vínculo
- `/api/admin/churches/[churchId]/members/[userId]` DELETE — admin

### Frontend
- Modal usa radio (não checkbox)
- Badge sem indicador "+N"
- `<UserChurchesSection>` mostra cartão único da igreja atual (ou estado vazio)
- React Query: `invalidateQueries(['user', 'church'])` em todas as mutations + `['auth', 'me']` para forçar refetch do perfil completo

## Open Items for Next Migration (000-002)

- Decidir copy final dos textos do modal (UX writing)
- Definir cor exata do estado "Sem vínculo" no badge (sugestão: `text-amber-400` no tema escuro)
- Validar com stakeholder se "SEDE DE REDENÇÃO" é o nome oficial (caps, acento, hífen?)
- Confirmar se há outras unidades a seedar além da SEDE no momento da implementação
