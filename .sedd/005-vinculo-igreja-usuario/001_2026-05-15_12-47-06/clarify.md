# Clarification Session - Migration 001

**Timestamp:** 2026-05-15T15:47:06.350Z
**Branch:** 005-vinculo-igreja-usuario
**Feature:** vinculo-igreja-usuario

## Expected Outcome

> Esta migração resolve as 6 Open Questions deixadas pela spec inicial, travando o modelo de dados (cardinalidade do vínculo), o comportamento do modal pós-login, escopo de auto-serviço do usuário, política de notificação em remoções pelo admin, acoplamento (ou não) com outras specs, e estratégia de atualização do contador de membros. As decisões abaixo são pré-requisito para geração de tasks de implementação.

---

## Questions & Answers

### Q1: Como o modal de seleção de igreja deve lembrar a dispensa ("Agora não")?

**Opções consideradas:**
- (a) `sessionStorage` — reaparece toda sessão nova
- (b) Campo persistente `dismissedChurchModalAt` no `users` — silencia por N dias

**Answer:** **(a) sessionStorage**

**Rationale:** Como a feature é nova e o vínculo é importante para a comunidade, vale ter recall ativo a cada sessão. Evita criar um novo campo no schema só para esse controle. Chave: `CHURCH_MODAL_DISMISS_KEY = 'church_modal_dismissed_session'`.

---

### Q2: Quando o admin remove o vínculo de um usuário, como o usuário descobre?

**Opções consideradas:**
- (a) Silenciosamente — sem qualquer notificação
- (b) Toast/notificação in-app no próximo login
- (c) Email

**Answer:** **(a) silenciosamente, com UX reativa**

**Rationale:** Não há infra de notificação (in-app/email) na plataforma e não vale criar agora. O fluxo natural cobre: na próxima vez que o usuário acessar o site, o perfil é refetchado via `/api/auth/me` / `sync-profile`, o React Query invalida o cache, o `<ChurchBadge>` reativamente passa a exibir "Sem vínculo", e o `<ChurchSelectorModal>` reabre porque `churchId === null` e o `sessionStorage` da sessão antiga já se foi. **É comportamento desejado, não bug** — documentado como Risk #3 na spec.

---

### Q3: O usuário comum pode se desvincular sozinho de uma igreja?

**Opções consideradas:**
- (a) Sim, via botão "Remover vínculo" em `/minha-conta`
- (b) Não, apenas admin pode remover

**Answer:** **(a) auto-serviço habilitado**

**Rationale:** O vínculo é declarativo do usuário, então faz sentido ser ele quem decide. Admin remove apenas em correção/abuso. Use case dedicado: `ClearUserChurch` (auto-serviço) é distinto de `AdminRemoveUserFromChurch` (admin) — separação ajuda em auditoria futura.

---

### Q4: Cardinalidade do vínculo — 1 usuário pode pertencer a quantas igrejas?

**Opções consideradas:**
- (a) `churchIds: string[]` — múltiplos vínculos simultâneos
- (b) `churchId: string | null` — um único vínculo por vez

**Answer:** **(b) 1 usuário = 1 igreja por vez**

**Rationale:** Pertencimento eclesiástico no contexto IEQ 157 é singular — você é membro de uma sede, mesmo que visite outras. O sistema continua suportando N igrejas cadastradas (para quando houver expansão de unidades); só restringe o usuário a uma escolha por vez. Mudança principal vs. proposta inicial: o schema do user vira `churchId: string | null` (não array), o modal vira radio button (não checkbox), e trocar de igreja é uma **operação atômica** (substituição transacional, não union/delete).

**Impacto:** atualizou spec.md (Goals, US-001/002/003/006, Schema, Mockups, Risks), interfaces.ts (`UserChurchView`, `SetUserChurchRequest`, `ChurchBadgeProps.church` singular, `ChurchSelectorModalProps.mode`).

---

### Q5: A categoria "Outras Localidades" do Congresso Geração Forte (spec 002) deve ser derivada de `churchId`?

**Opções consideradas:**
- (a) Independente — categoria do evento ignora `churchId`
- (b) Derivar: se user tem SEDE de Redenção, categoria = "Redenção"; senão "Outras"

**Answer:** **(a) totalmente independente**

**Rationale:** Spec 002 (Congresso) está em clarify in-progress e o evento já vai acontecer em breve. Acoplar specs cria churn entre elas e risco de regressão no congresso. A feature 005 não modifica nada relacionado ao congresso. Pode virar follow-up depois de ambas estabilizarem, mas não agora.

---

### Q6: Como o campo `totalMembros` (contador denormalizado em `churches`) é mantido?

**Opções consideradas:**
- (a) Transacional dentro dos use cases (Firestore transaction)
- (b) Cloud Function `onWrite` em `users.churchId` (eventual consistency)
- (c) Recalcular sob demanda via `count()` ao abrir a tela admin

**Answer:** **(a) transacional**

**Rationale:** Não há Cloud Functions configuradas no projeto e adicionar Functions apenas para isso é overkill. Recalcular `count()` em runtime fica caro à medida que a base cresce. `db.runTransaction()` do Admin SDK é trivial e dá consistência forte imediata. O método `IChurchRepository.transferUserChurch({ userId, oldChurchId, newChurchId })` é a primitiva: decrementa o contador da antiga (se houver) e incrementa o da nova (se houver), atomicamente com o update do `user.churchId`. Casos cobertos:

| Operação | oldChurchId | newChurchId | Efeito no contador |
|----------|-------------|-------------|---------------------|
| Vincular pela primeira vez | `null` | `X` | `X.totalMembros++` |
| Trocar de igreja | `X` | `Y` | `X.totalMembros--`, `Y.totalMembros++` |
| Usuário se desvincula | `X` | `null` | `X.totalMembros--` |
| Admin remove vínculo | `X` | `null` | `X.totalMembros--` |
| No-op (já está vinculado) | `X` | `X` | nada |

---

## Summary of Impact on Spec

A spec.md foi atualizada após a definição da Q4 (cardinalidade singular). Mudanças aplicadas:

- **Goals/Non-Goals:** removido vocabulário "múltiplas igrejas"; explicitado "1 user = 1 church por vez"
- **US-001:** seleção via radio (não checkbox)
- **US-002:** "Minha igreja" (singular), botões "Trocar igreja" e "Remover vínculo"
- **US-003:** badge sem indicador `+N`; nova variante de erro para igreja inativa permanece exibindo nome
- **US-006:** transação garante decremento do contador
- **Architecture:** use cases renomeados (`SetUserChurch`, `ClearUserChurch` em vez de `LinkUserToChurch`/`UnlinkUserFromChurch`)
- **API Routes:** `/api/user/church` (singular), método PUT para set/change
- **Schema Firestore:** `churchId: string | null` no doc do user
- **Risks:** novo item sobre concorrência em trocas A→B
