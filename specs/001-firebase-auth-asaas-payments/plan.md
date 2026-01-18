# Implementation Plan: Firebase Auth + Asaas Payments

**Branch**: `001-firebase-auth-asaas-payments` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-firebase-auth-asaas-payments/spec.md`

## Summary

Integrar autenticação Firebase (email/senha + Google OAuth) e pagamentos Asaas (PIX, Boleto, Cartão) na plataforma IEQ 157. O sistema suportará inscrições tanto para usuários autenticados quanto para visitantes sem cadastro. A arquitetura seguirá princípios de Domain-Driven Design (DDD) com clara separação de camadas.

## Technical Context

**Language/Version**: TypeScript 5.9 / Node.js 20+
**Primary Dependencies**: Next.js 15, React 19, Firebase SDK, Firebase Admin SDK, Asaas API
**Storage**: Firebase Firestore (NoSQL)
**Testing**: Vitest (unit/integration), Playwright (e2e)
**Target Platform**: Web (Server-Side Rendering via Next.js)
**Project Type**: Web application (fullstack Next.js)
**Performance Goals**: 50 inscrições simultâneas, resposta < 2s para operações comuns
**Constraints**: Webhook processing < 30s, PIX confirmation reflection < 2min
**Scale/Scope**: ~500 usuários ativos, ~10 eventos/ano, ~50 inscrições/evento

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

O projeto não possui constitution.md customizado (template padrão). Aplicando princípios gerais:

| Princípio | Status | Notas |
|-----------|--------|-------|
| Simplicidade | ✅ Pass | Arquitetura DDD justificada pela complexidade do domínio (pagamentos) |
| Testabilidade | ✅ Pass | Camadas separadas permitem testes unitários e de integração |
| Segurança | ✅ Pass | Autenticação Firebase, validação de webhooks Asaas |

## Project Structure

### Documentation (this feature)

```text
specs/001-firebase-auth-asaas-payments/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── auth.yaml        # Auth API contracts
│   ├── events.yaml      # Events API contracts
│   ├── inscriptions.yaml # Inscriptions API contracts
│   └── payments.yaml    # Payments API contracts
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   └── recuperar-senha/page.tsx
│   ├── (main)/                   # Public routes
│   │   ├── page.tsx              # Home (existing)
│   │   ├── eventos/              # Events (existing, to enhance)
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── ...                   # Other existing pages
│   ├── (protected)/              # Protected routes
│   │   ├── minha-conta/
│   │   │   ├── page.tsx          # User dashboard
│   │   │   ├── inscricoes/page.tsx
│   │   │   └── perfil/page.tsx
│   │   └── admin/
│   │       ├── page.tsx          # Admin dashboard
│   │       ├── eventos/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       └── inscricoes/page.tsx
│   └── api/                      # API routes
│       ├── auth/
│       ├── users/
│       ├── events/
│       ├── inscriptions/
│       └── payments/
│           └── webhook/route.ts
│
├── domain/                       # Domain Layer (DDD)
│   ├── user/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── repositories/
│   ├── event/
│   ├── inscription/
│   ├── payment/
│   └── shared/
│
├── application/                  # Application Layer (Use Cases)
│   ├── user/
│   ├── event/
│   ├── inscription/
│   └── payment/
│
├── infrastructure/               # Infrastructure Layer
│   ├── firebase/
│   │   ├── config/
│   │   ├── repositories/
│   │   └── services/
│   └── asaas/
│       ├── config/
│       └── services/
│
├── presentation/                 # Presentation Layer
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   ├── components/
│   │   ├── auth/
│   │   ├── payment/
│   │   └── inscription/
│   └── controllers/
│
├── components/                   # Existing shared components
├── data/                         # Existing data files
├── images/                       # Existing images
├── services/                     # Existing services
└── styles/                       # Existing styles

tests/
├── unit/
│   ├── domain/
│   └── application/
├── integration/
│   ├── api/
│   └── infrastructure/
└── e2e/
    ├── auth.spec.ts
    ├── inscription.spec.ts
    └── payment.spec.ts
```

**Structure Decision**: Web application com arquitetura DDD. O Next.js 15 App Router será usado para routing e API routes. A estrutura DDD (domain, application, infrastructure, presentation) será adicionada ao diretório `src/` existente, preservando os componentes e páginas já criados.

## Complexity Tracking

> **No violations detected** - A arquitetura DDD é justificada pela complexidade do domínio de pagamentos e pela necessidade de separação clara entre regras de negócio e infraestrutura externa (Firebase, Asaas).

## Dependencies to Add

```json
{
  "dependencies": {
    "firebase": "^11.x",
    "firebase-admin": "^13.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",
    "uuid": "^11.x"
  },
  "devDependencies": {
    "vitest": "^3.x",
    "@testing-library/react": "^16.x",
    "playwright": "^1.x"
  }
}
```
