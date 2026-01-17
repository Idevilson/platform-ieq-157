# Tasks: Firebase Auth + Asaas Payments

**Feature**: `001-firebase-auth-asaas-payments`
**Generated**: 2026-01-15
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Dependency Graph

```
Phase 1 (Setup)
    └─► Phase 2 (Foundational/Domain)
            └─► Phase 3 (US1: Auth) ─────────┐
                    │                        │
                    ▼                        ▼
            Phase 4 (US2: Inscrição) ◄─ Phase 5 (US3: Pagamento)
                    │                        │
                    └────────┬───────────────┘
                             ▼
                    Phase 6 (US4: Acompanhamento)
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
    Phase 7 (US5: Admin Eventos)     Phase 8 (US6: Admin Inscrições)
                             │
                             ▼
                    Phase 9 (Polish & Tests)
```

---

## Phase 1: Setup & Configuration

> **Dependencies**: None
> **Blocker for**: All other phases

- [x] [T001] [P1] Instalar dependências: firebase, firebase-admin, zod, react-hook-form, uuid `package.json`
- [x] [T002] [P1] Instalar devDependencies: vitest, @testing-library/react, playwright `package.json`
- [x] [T003] [P1] Criar arquivo de configuração Firebase Client `src/infrastructure/firebase/config/client.ts`
- [x] [T004] [P1] Criar arquivo de configuração Firebase Admin `src/infrastructure/firebase/config/admin.ts`
- [x] [T005] [P1] Criar arquivo de configuração Asaas `src/infrastructure/asaas/config/index.ts`
- [x] [T006] [P1] Criar template de variáveis de ambiente `.env.example`
- [x] [T007] [P1] Configurar Vitest `vitest.config.ts`
- [x] [T008] [P1] Configurar Playwright `playwright.config.ts`

---

## Phase 2: Foundational / Domain Layer

> **Dependencies**: Phase 1
> **Blocker for**: Phases 3-9

### 2.1 Value Objects

- [x] [T009] [P1] Criar Value Object Email com validação `src/domain/shared/value-objects/Email.ts`
- [x] [T010] [P1] Criar Value Object CPF com validação (algoritmo oficial) `src/domain/shared/value-objects/CPF.ts`
- [x] [T011] [P1] Criar Value Object Phone com validação `src/domain/shared/value-objects/Phone.ts`
- [x] [T012] [P1] Criar Value Object Money (valores em centavos) `src/domain/shared/value-objects/Money.ts`

### 2.2 Domain Entities

- [x] [T013] [P1] Criar Entity User `src/domain/user/entities/User.ts`
- [x] [T014] [P1] Criar Entity Event `src/domain/event/entities/Event.ts`
- [x] [T015] [P1] Criar Entity EventCategory `src/domain/event/entities/EventCategory.ts`
- [x] [T016] [P1] Criar Entity Inscription `src/domain/inscription/entities/Inscription.ts`
- [x] [T017] [P1] Criar Entity Payment `src/domain/payment/entities/Payment.ts`
- [x] [T018] [P1] Criar Value Object GuestData `src/domain/inscription/value-objects/GuestData.ts`

### 2.3 Repository Interfaces

- [x] [T019] [P1] Criar interface IUserRepository `src/domain/user/repositories/IUserRepository.ts`
- [x] [T020] [P1] Criar interface IEventRepository `src/domain/event/repositories/IEventRepository.ts`
- [x] [T021] [P1] Criar interface IInscriptionRepository `src/domain/inscription/repositories/IInscriptionRepository.ts`
- [x] [T022] [P1] Criar interface IPaymentRepository `src/domain/payment/repositories/IPaymentRepository.ts`

### 2.4 Domain Types & Enums

- [x] [T023] [P1] Criar types compartilhados (EventStatus, PaymentStatus, etc.) `src/domain/shared/types/index.ts`
- [x] [T024] [P1] Criar domain errors personalizados `src/domain/shared/errors/index.ts`

### 2.5 Unit Tests - Domain

- [x] [T025] [P1] Testes unitários para Value Objects `tests/unit/domain/value-objects/`
- [x] [T026] [P1] Testes unitários para Entities `tests/unit/domain/entities/`

---

## Phase 3: US1 - Cadastro e Login (P1)

> **Dependencies**: Phase 2
> **Blocker for**: Phases 4, 5, 6
> **User Story**: [US1] Cadastro e Login de Membro

### 3.1 Infrastructure - Firebase Auth

- [ ] [T027] [P1] [US1] Implementar FirebaseAuthService `src/infrastructure/firebase/services/FirebaseAuthService.ts`
- [ ] [T028] [P1] [US1] Implementar FirebaseUserRepository `src/infrastructure/firebase/repositories/FirebaseUserRepository.ts`

### 3.2 Application Layer - Auth Use Cases

- [ ] [T029] [P1] [US1] Criar use case RegisterUser `src/application/user/RegisterUser.ts`
- [ ] [T030] [P1] [US1] Criar use case LoginWithEmail `src/application/user/LoginWithEmail.ts`
- [ ] [T031] [P1] [US1] Criar use case LoginWithGoogle `src/application/user/LoginWithGoogle.ts`
- [ ] [T032] [P1] [US1] Criar use case UpdateProfile `src/application/user/UpdateProfile.ts`
- [ ] [T033] [P1] [US1] Criar use case GetUserProfile `src/application/user/GetUserProfile.ts`
- [ ] [T034] [P1] [US1] Criar use case ResetPassword `src/application/user/ResetPassword.ts`

### 3.3 Presentation - Auth Context

- [ ] [T035] [P1] [US1] Criar AuthContext com Firebase `src/presentation/contexts/AuthContext.tsx`
- [ ] [T036] [P1] [US1] Criar hook useAuth `src/presentation/hooks/useAuth.ts`
- [ ] [T037] [P1] [US1] Criar hook useRequireAuth (proteção de rotas) `src/presentation/hooks/useRequireAuth.ts`
- [ ] [T038] [P1] [US1] Criar hook useRequireAdmin `src/presentation/hooks/useRequireAdmin.ts`

### 3.4 Presentation - Auth Components

- [ ] [T039] [P1] [US1] Criar componente LoginForm `src/presentation/components/auth/LoginForm.tsx`
- [ ] [T040] [P1] [US1] Criar componente RegisterForm `src/presentation/components/auth/RegisterForm.tsx`
- [ ] [T041] [P1] [US1] Criar componente GoogleLoginButton `src/presentation/components/auth/GoogleLoginButton.tsx`
- [ ] [T042] [P1] [US1] Criar componente ResetPasswordForm `src/presentation/components/auth/ResetPasswordForm.tsx`
- [ ] [T043] [P1] [US1] Criar componente ProfileForm `src/presentation/components/auth/ProfileForm.tsx`

### 3.5 Pages - Auth

- [ ] [T044] [P1] [US1] Criar página de Login `src/app/(auth)/login/page.tsx`
- [ ] [T045] [P1] [US1] Criar página de Cadastro `src/app/(auth)/cadastro/page.tsx`
- [ ] [T046] [P1] [US1] Criar página de Recuperação de Senha `src/app/(auth)/recuperar-senha/page.tsx`
- [ ] [T047] [P1] [US1] Criar página de Perfil `src/app/(protected)/minha-conta/perfil/page.tsx`
- [ ] [T048] [P1] [US1] Criar layout para grupo (auth) `src/app/(auth)/layout.tsx`
- [ ] [T049] [P1] [US1] Criar layout para grupo (protected) `src/app/(protected)/layout.tsx`

### 3.6 API Routes - Auth/Users

- [ ] [T050] [P1] [US1] Criar API route POST /api/auth/register `src/app/api/auth/register/route.ts`
- [ ] [T051] [P1] [US1] Criar API route GET/PUT /api/users/me `src/app/api/users/me/route.ts`
- [ ] [T052] [P1] [US1] Criar middleware de autenticação `src/app/api/_middleware/auth.ts`

### 3.7 Tests - US1

- [ ] [T053] [P1] [US1] Testes de integração para auth use cases `tests/integration/auth/`
- [ ] [T054] [P1] [US1] Teste E2E: fluxo de cadastro `tests/e2e/auth.spec.ts`

---

## Phase 4: US2 - Inscrição em Evento (P1)

> **Dependencies**: Phase 3
> **Blocker for**: Phase 5, 6
> **User Story**: [US2] Inscrição em Evento

### 4.1 Infrastructure - Events & Inscriptions

- [ ] [T055] [P1] [US2] Implementar FirebaseEventRepository `src/infrastructure/firebase/repositories/FirebaseEventRepository.ts`
- [ ] [T056] [P1] [US2] Implementar FirebaseInscriptionRepository `src/infrastructure/firebase/repositories/FirebaseInscriptionRepository.ts`

### 4.2 Application Layer - Event Use Cases

- [ ] [T057] [P1] [US2] Criar use case ListEvents `src/application/event/ListEvents.ts`
- [ ] [T058] [P1] [US2] Criar use case GetEventById `src/application/event/GetEventById.ts`
- [ ] [T059] [P1] [US2] Criar use case GetEventCategories `src/application/event/GetEventCategories.ts`

### 4.3 Application Layer - Inscription Use Cases

- [ ] [T060] [P1] [US2] Criar use case CreateInscription (autenticado) `src/application/inscription/CreateInscription.ts`
- [ ] [T061] [P1] [US2] Criar use case CreateGuestInscription (visitante) `src/application/inscription/CreateGuestInscription.ts`
- [ ] [T062] [P1] [US2] Criar use case CancelInscription `src/application/inscription/CancelInscription.ts`
- [ ] [T063] [P1] [US2] Criar use case GetInscriptionById `src/application/inscription/GetInscriptionById.ts`
- [ ] [T064] [P1] [US2] Criar use case LookupInscriptionByCPF `src/application/inscription/LookupInscriptionByCPF.ts`

### 4.4 Presentation - Inscription Components

- [ ] [T065] [P1] [US2] Criar componente EventCard `src/presentation/components/event/EventCard.tsx`
- [ ] [T066] [P1] [US2] Criar componente CategorySelector `src/presentation/components/inscription/CategorySelector.tsx`
- [ ] [T067] [P1] [US2] Criar componente InscriptionForm (autenticado) `src/presentation/components/inscription/InscriptionForm.tsx`
- [ ] [T068] [P1] [US2] Criar componente GuestInscriptionForm (visitante) `src/presentation/components/inscription/GuestInscriptionForm.tsx`
- [ ] [T069] [P1] [US2] Criar componente InscriptionLookup (consulta por CPF) `src/presentation/components/inscription/InscriptionLookup.tsx`
- [ ] [T070] [P1] [US2] Criar componente InscriptionStatus `src/presentation/components/inscription/InscriptionStatus.tsx`

### 4.5 Pages - Events & Inscriptions

- [ ] [T071] [P1] [US2] Atualizar página de listagem de eventos `src/app/(main)/eventos/page.tsx`
- [ ] [T072] [P1] [US2] Atualizar página de detalhe do evento `src/app/(main)/eventos/[id]/page.tsx`
- [ ] [T073] [P1] [US2] Adicionar seção de inscrição na página do evento
- [ ] [T074] [P1] [US2] Adicionar seção de consulta por CPF na página do evento

### 4.6 API Routes - Events & Inscriptions

- [ ] [T075] [P1] [US2] Criar API route GET /api/events `src/app/api/events/route.ts`
- [ ] [T076] [P1] [US2] Criar API route GET /api/events/[eventId] `src/app/api/events/[eventId]/route.ts`
- [ ] [T077] [P1] [US2] Criar API route GET /api/events/[eventId]/categories `src/app/api/events/[eventId]/categories/route.ts`
- [ ] [T078] [P1] [US2] Criar API route POST /api/inscriptions `src/app/api/inscriptions/route.ts`
- [ ] [T079] [P1] [US2] Criar API route POST /api/inscriptions/lookup `src/app/api/inscriptions/lookup/route.ts`
- [ ] [T080] [P1] [US2] Criar API route GET/DELETE /api/inscriptions/[inscriptionId] `src/app/api/inscriptions/[inscriptionId]/route.ts`

### 4.7 Tests - US2

- [ ] [T081] [P1] [US2] Testes de integração para inscription use cases `tests/integration/inscription/`
- [ ] [T082] [P1] [US2] Teste E2E: fluxo de inscrição autenticado `tests/e2e/inscription.spec.ts`
- [ ] [T083] [P1] [US2] Teste E2E: fluxo de inscrição visitante `tests/e2e/inscription-guest.spec.ts`

---

## Phase 5: US3 - Pagamento de Inscrição (P1)

> **Dependencies**: Phase 4
> **Blocker for**: Phase 6
> **User Story**: [US3] Pagamento de Inscrição

### 5.1 Infrastructure - Asaas

- [ ] [T084] [P1] [US3] Implementar AsaasService (client HTTP) `src/infrastructure/asaas/services/AsaasService.ts`
- [ ] [T085] [P1] [US3] Implementar AsaasCustomerService `src/infrastructure/asaas/services/AsaasCustomerService.ts`
- [ ] [T086] [P1] [US3] Implementar AsaasPaymentService `src/infrastructure/asaas/services/AsaasPaymentService.ts`
- [ ] [T087] [P1] [US3] Implementar FirebasePaymentRepository `src/infrastructure/firebase/repositories/FirebasePaymentRepository.ts`

### 5.2 Application Layer - Payment Use Cases

- [ ] [T088] [P1] [US3] Criar use case CreatePayment `src/application/payment/CreatePayment.ts`
- [ ] [T089] [P1] [US3] Criar use case GetPaymentById `src/application/payment/GetPaymentById.ts`
- [ ] [T090] [P1] [US3] Criar use case GetPaymentStatus `src/application/payment/GetPaymentStatus.ts`
- [ ] [T091] [P1] [US3] Criar use case ProcessWebhook `src/application/payment/ProcessWebhook.ts`
- [ ] [T092] [P1] [US3] Criar use case CreateOrGetAsaasCustomer `src/application/payment/CreateOrGetAsaasCustomer.ts`

### 5.3 Webhook Handler

- [ ] [T093] [P1] [US3] Implementar webhook handler com retry queue `src/application/payment/WebhookHandler.ts`
- [ ] [T094] [P1] [US3] Implementar validação de token do webhook `src/infrastructure/asaas/services/WebhookValidator.ts`
- [ ] [T095] [P1] [US3] Implementar atualização automática de inscrição após pagamento

### 5.4 Presentation - Payment Components

- [ ] [T096] [P1] [US3] Criar componente PaymentMethodSelector `src/presentation/components/payment/PaymentMethodSelector.tsx`
- [ ] [T097] [P1] [US3] Criar componente PixPayment (QR Code + copia-e-cola) `src/presentation/components/payment/PixPayment.tsx`
- [ ] [T098] [P1] [US3] Criar componente BoletoPayment `src/presentation/components/payment/BoletoPayment.tsx`
- [ ] [T099] [P1] [US3] Criar componente CreditCardForm `src/presentation/components/payment/CreditCardForm.tsx`
- [ ] [T100] [P1] [US3] Criar componente PaymentStatus `src/presentation/components/payment/PaymentStatus.tsx`

### 5.5 Pages - Payment

- [ ] [T101] [P1] [US3] Criar página de pagamento `src/app/(main)/pagamento/[inscriptionId]/page.tsx`
- [ ] [T102] [P1] [US3] Criar página de confirmação de pagamento `src/app/(main)/pagamento/[inscriptionId]/confirmacao/page.tsx`

### 5.6 API Routes - Payments

- [ ] [T103] [P1] [US3] Criar API route POST /api/payments `src/app/api/payments/route.ts`
- [ ] [T104] [P1] [US3] Criar API route GET /api/payments/[paymentId] `src/app/api/payments/[paymentId]/route.ts`
- [ ] [T105] [P1] [US3] Criar API route GET /api/payments/[paymentId]/status `src/app/api/payments/[paymentId]/status/route.ts`
- [ ] [T106] [P1] [US3] Criar API route POST /api/payments/webhook `src/app/api/payments/webhook/route.ts`

### 5.7 Tests - US3

- [ ] [T107] [P1] [US3] Testes de integração para payment use cases `tests/integration/payment/`
- [ ] [T108] [P1] [US3] Testes de integração para webhook handler `tests/integration/payment/webhook.test.ts`
- [ ] [T109] [P1] [US3] Teste E2E: fluxo de pagamento PIX `tests/e2e/payment-pix.spec.ts`

---

## Phase 6: US4 - Acompanhamento de Inscrições (P2)

> **Dependencies**: Phase 5
> **Blocker for**: None (parallelizable with Phase 7, 8)
> **User Story**: [US4] Acompanhamento de Inscrições e Pagamentos

### 6.1 Application Layer - List Use Cases

- [ ] [T110] [P2] [US4] Criar use case ListMyInscriptions `src/application/inscription/ListMyInscriptions.ts`
- [ ] [T111] [P2] [US4] Criar use case ListMyPayments `src/application/payment/ListMyPayments.ts`

### 6.2 Presentation - Dashboard Components

- [ ] [T112] [P2] [US4] Criar componente InscriptionList `src/presentation/components/inscription/InscriptionList.tsx`
- [ ] [T113] [P2] [US4] Criar componente PaymentList `src/presentation/components/payment/PaymentList.tsx`
- [ ] [T114] [P2] [US4] Criar componente UserDashboard `src/presentation/components/user/UserDashboard.tsx`

### 6.3 Pages - User Dashboard

- [ ] [T115] [P2] [US4] Criar página Minha Conta (dashboard) `src/app/(protected)/minha-conta/page.tsx`
- [ ] [T116] [P2] [US4] Criar página Minhas Inscrições `src/app/(protected)/minha-conta/inscricoes/page.tsx`
- [ ] [T117] [P2] [US4] Criar página Meus Pagamentos `src/app/(protected)/minha-conta/pagamentos/page.tsx`

### 6.4 API Routes - User Lists

- [ ] [T118] [P2] [US4] Criar API route GET /api/inscriptions/me `src/app/api/inscriptions/me/route.ts`
- [ ] [T119] [P2] [US4] Criar API route GET /api/payments/me `src/app/api/payments/me/route.ts`

### 6.5 Tests - US4

- [ ] [T120] [P2] [US4] Testes de integração para list use cases `tests/integration/user-dashboard/`
- [ ] [T121] [P2] [US4] Teste E2E: visualização de inscrições `tests/e2e/user-dashboard.spec.ts`

---

## Phase 7: US5 - Gestão de Eventos pelo Admin (P2)

> **Dependencies**: Phase 3 (auth), Phase 4 (events base)
> **Blocker for**: Phase 8
> **User Story**: [US5] Gestão de Eventos pelo Admin

### 7.1 Application Layer - Admin Event Use Cases

- [ ] [T122] [P2] [US5] Criar use case CreateEvent `src/application/event/CreateEvent.ts`
- [ ] [T123] [P2] [US5] Criar use case UpdateEvent `src/application/event/UpdateEvent.ts`
- [ ] [T124] [P2] [US5] Criar use case AddEventCategory `src/application/event/AddEventCategory.ts`
- [ ] [T125] [P2] [US5] Criar use case GetEventStats `src/application/event/GetEventStats.ts`

### 7.2 Presentation - Admin Components

- [ ] [T126] [P2] [US5] Criar componente EventForm `src/presentation/components/admin/EventForm.tsx`
- [ ] [T127] [P2] [US5] Criar componente CategoryForm `src/presentation/components/admin/CategoryForm.tsx`
- [ ] [T128] [P2] [US5] Criar componente EventStats `src/presentation/components/admin/EventStats.tsx`
- [ ] [T129] [P2] [US5] Criar componente AdminEventList `src/presentation/components/admin/AdminEventList.tsx`

### 7.3 Pages - Admin Events

- [ ] [T130] [P2] [US5] Criar página Admin Dashboard `src/app/(protected)/admin/page.tsx`
- [ ] [T131] [P2] [US5] Criar página Admin Eventos (lista) `src/app/(protected)/admin/eventos/page.tsx`
- [ ] [T132] [P2] [US5] Criar página Admin Evento (detalhe/edição) `src/app/(protected)/admin/eventos/[id]/page.tsx`
- [ ] [T133] [P2] [US5] Criar página Admin Novo Evento `src/app/(protected)/admin/eventos/novo/page.tsx`

### 7.4 API Routes - Admin Events

- [ ] [T134] [P2] [US5] Criar API route POST /api/events (admin) `src/app/api/events/route.ts` (adicionar POST)
- [ ] [T135] [P2] [US5] Criar API route PUT /api/events/[eventId] `src/app/api/events/[eventId]/route.ts` (adicionar PUT)
- [ ] [T136] [P2] [US5] Criar API route POST /api/events/[eventId]/categories `src/app/api/events/[eventId]/categories/route.ts` (adicionar POST)
- [ ] [T137] [P2] [US5] Criar API route GET /api/events/[eventId]/stats `src/app/api/events/[eventId]/stats/route.ts`

### 7.5 Tests - US5

- [ ] [T138] [P2] [US5] Testes de integração para admin event use cases `tests/integration/admin/events/`
- [ ] [T139] [P2] [US5] Teste E2E: criação de evento admin `tests/e2e/admin-events.spec.ts`

---

## Phase 8: US6 - Gestão de Inscrições pelo Admin (P3)

> **Dependencies**: Phase 7
> **Blocker for**: None
> **User Story**: [US6] Gestão de Inscrições pelo Admin

### 8.1 Application Layer - Admin Inscription Use Cases

- [ ] [T140] [P3] [US6] Criar use case ListEventInscriptions `src/application/inscription/ListEventInscriptions.ts`
- [ ] [T141] [P3] [US6] Criar use case ExportInscriptions (opcional) `src/application/inscription/ExportInscriptions.ts`

### 8.2 Presentation - Admin Inscription Components

- [ ] [T142] [P3] [US6] Criar componente AdminInscriptionList `src/presentation/components/admin/AdminInscriptionList.tsx`
- [ ] [T143] [P3] [US6] Criar componente InscriptionFilters `src/presentation/components/admin/InscriptionFilters.tsx`
- [ ] [T144] [P3] [US6] Criar componente AdminInscriptionDetail `src/presentation/components/admin/AdminInscriptionDetail.tsx`

### 8.3 Pages - Admin Inscriptions

- [ ] [T145] [P3] [US6] Criar página Admin Inscrições `src/app/(protected)/admin/inscricoes/page.tsx`
- [ ] [T146] [P3] [US6] Criar página Admin Inscrições por Evento `src/app/(protected)/admin/eventos/[id]/inscricoes/page.tsx`

### 8.4 API Routes - Admin Inscriptions

- [ ] [T147] [P3] [US6] Criar API route GET /api/events/[eventId]/inscriptions `src/app/api/events/[eventId]/inscriptions/route.ts`

### 8.5 Tests - US6

- [ ] [T148] [P3] [US6] Testes de integração para admin inscription use cases `tests/integration/admin/inscriptions/`
- [ ] [T149] [P3] [US6] Teste E2E: listagem de inscrições admin `tests/e2e/admin-inscriptions.spec.ts`

---

## Phase 9: Polish & Integration Tests

> **Dependencies**: All previous phases
> **Blocker for**: Release

### 9.1 Firestore Rules & Indexes

- [ ] [T150] [P1] Implementar Firestore Security Rules `firestore.rules`
- [ ] [T151] [P1] Criar arquivo de indexes do Firestore `firestore.indexes.json`

### 9.2 Error Handling & Edge Cases

- [ ] [T152] [P1] Implementar tratamento de erro global na UI `src/presentation/components/ErrorBoundary.tsx`
- [ ] [T153] [P1] Implementar feedback de loading states `src/presentation/components/LoadingSpinner.tsx`
- [ ] [T154] [P1] Implementar toast notifications para feedback `src/presentation/components/Toast.tsx`

### 9.3 Responsive Design & UX

- [ ] [T155] [P2] Revisar responsividade das páginas de auth
- [ ] [T156] [P2] Revisar responsividade das páginas de inscrição
- [ ] [T157] [P2] Revisar responsividade do painel admin

### 9.4 Documentation

- [ ] [T158] [P3] Atualizar CLAUDE.md com contexto do novo sistema
- [ ] [T159] [P3] Criar seed script para dados de teste `scripts/seed.ts`

### 9.5 Final E2E Tests

- [ ] [T160] [P1] Teste E2E completo: cadastro → inscrição → pagamento → confirmação
- [ ] [T161] [P1] Teste E2E completo: visitante → inscrição → pagamento → consulta por CPF
- [ ] [T162] [P2] Teste E2E: fluxo admin completo

---

## Summary

| Phase | Tasks | Priority | Story |
|-------|-------|----------|-------|
| Phase 1: Setup | 8 | P1 | - |
| Phase 2: Domain | 18 | P1 | - |
| Phase 3: Auth | 28 | P1 | US1 |
| Phase 4: Inscrição | 29 | P1 | US2 |
| Phase 5: Pagamento | 26 | P1 | US3 |
| Phase 6: Acompanhamento | 12 | P2 | US4 |
| Phase 7: Admin Eventos | 18 | P2 | US5 |
| Phase 8: Admin Inscrições | 10 | P3 | US6 |
| Phase 9: Polish | 13 | Mixed | - |
| **Total** | **162** | | |

### Priority Distribution

- **P1 (Must Have)**: 109 tasks
- **P2 (Should Have)**: 43 tasks
- **P3 (Nice to Have)**: 10 tasks

### Estimated Phases Order

1. Setup (Phase 1) - Configuração inicial
2. Domain (Phase 2) - Fundação do sistema
3. Auth (Phase 3) - Autenticação funcional
4. Inscrição (Phase 4) - Inscrições funcionais
5. Pagamento (Phase 5) - Pagamentos funcionais
6. Acompanhamento (Phase 6) + Admin Eventos (Phase 7) - Paralelo
7. Admin Inscrições (Phase 8)
8. Polish (Phase 9) - Refinamentos finais
