# Research: Firebase Auth + Asaas Payments

**Feature**: `001-firebase-auth-asaas-payments`
**Date**: 2026-01-15

## Summary

Este documento consolida as decisões técnicas e de design para a integração de autenticação Firebase e pagamentos Asaas na plataforma IEQ 157.

---

## 1. Firebase Authentication

### Decision
Usar Firebase Authentication com suporte a Email/Senha e Google OAuth.

### Rationale
- Firebase Authentication é o padrão para projetos que já usam Firebase
- Integração nativa com Firestore para controle de acesso
- Suporte robusto a OAuth 2.0 (Google)
- SDK client-side e admin para Next.js

### Alternatives Considered
| Alternativa | Rejeitada Porque |
|-------------|------------------|
| Auth0 | Custo adicional, não integra nativamente com Firestore |
| NextAuth.js | Adiciona complexidade desnecessária quando Firebase já está no stack |
| Custom JWT | Reinventar a roda, menos seguro que soluções estabelecidas |

### Implementation Notes
- **Client SDK**: `firebase/auth` para login no browser
- **Admin SDK**: `firebase-admin` para verificação de tokens em API routes
- **Session Persistence**: `browserLocalPersistence` para manter sessão entre visitas
- **Protected Routes**: Middleware Next.js verifica token Firebase

---

## 2. Firebase Firestore (Database)

### Decision
Usar Firebase Firestore como banco de dados NoSQL.

### Rationale
- Já está no ecossistema Firebase com Authentication
- Escalável e serverless
- Suporte a real-time updates (útil para admin dashboard)
- SDK bem documentado para TypeScript

### Alternatives Considered
| Alternativa | Rejeitada Porque |
|-------------|------------------|
| PostgreSQL (Supabase) | Introduz novo serviço, curva de aprendizado |
| MongoDB Atlas | Custo e complexidade adicional |
| Firebase Realtime Database | Firestore é mais moderno e flexível |

### Data Structure
```
collections/
├── users/
│   └── {userId}
├── events/
│   └── {eventId}
│       └── categories/ (subcollection)
├── inscriptions/
│   └── {inscriptionId}
└── payments/
    └── {paymentId}
```

---

## 3. Asaas Payment Integration

### Decision
Integrar com API Asaas para processamento de pagamentos (PIX, Boleto, Cartão).

### Rationale
- Requisito do cliente (igreja já possui conta Asaas)
- API REST bem documentada
- Suporte a ambiente sandbox para testes
- Webhooks para notificações de pagamento

### Implementation Notes

#### Endpoints Principais
- `POST /customers` - Criar cliente
- `POST /payments` - Criar cobrança
- `GET /payments/{id}/pixQrCode` - Obter QR Code PIX
- `GET /payments/{id}` - Consultar status

#### Webhook Events
| Evento | Ação |
|--------|------|
| `PAYMENT_RECEIVED` | Confirmar inscrição |
| `PAYMENT_CONFIRMED` | Confirmar inscrição |
| `PAYMENT_OVERDUE` | Cancelar inscrição |

#### Security
- API Key em variável de ambiente (`ASAAS_API_KEY`)
- Webhook Token para validação (`ASAAS_WEBHOOK_TOKEN`)
- Ambiente: Sandbox (`sandbox.asaas.com`) → Produção (`api.asaas.com`)

---

## 4. Webhook Handling Strategy

### Decision
Implementar fila com retry para processar webhooks que chegam antes do pagamento ser salvo localmente.

### Rationale
- Race condition possível: webhook pode chegar antes do POST /payments retornar
- Retry garante eventual consistency
- Logging permite auditoria

### Implementation
```typescript
// Pseudo-código
async function processWebhook(payload) {
  const payment = await findPaymentByAsaasId(payload.payment.id)

  if (!payment) {
    // Webhook chegou antes - adicionar à fila de retry
    await addToRetryQueue(payload, { maxRetries: 3, delayMs: 2000 })
    return { status: 'queued' }
  }

  await updatePaymentStatus(payment, payload.payment.status)
  return { status: 'processed' }
}
```

---

## 5. Guest Inscriptions (Visitantes sem Cadastro)

### Decision
Permitir inscrições sem cadastro, coletando dados no formulário.

### Rationale
- Clarificação do cliente: visitantes devem poder se inscrever
- Simplifica onboarding para eventos de alcance
- Dados obrigatórios: nome, email, telefone, CPF

### Implementation Notes

#### Data Model
- `Inscription.userId` é opcional
- `Inscription.guestData` contém dados do visitante quando `userId` é null

#### Duplicate Detection
- Para usuários autenticados: verificar por `userId + eventId`
- Para visitantes: verificar por `cpf + eventId`

#### Consultation Flow
- Área "Consultar Inscrição" na página do evento
- Visitante informa CPF
- Sistema retorna inscrições daquele CPF naquele evento

---

## 6. CPF Validation

### Decision
Validar CPF usando algoritmo oficial de verificação.

### Rationale
- Requisito funcional (FR-008)
- Previne erros de digitação
- Necessário para integração Asaas (criação de cliente)

### Implementation
```typescript
// Algoritmo de validação de CPF
function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false // Todos dígitos iguais

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}
```

---

## 7. DDD Architecture Layers

### Decision
Adotar arquitetura DDD com 4 camadas: Domain, Application, Infrastructure, Presentation.

### Rationale
- Separação clara de responsabilidades
- Domínio de pagamentos é complexo (múltiplos estados, integrações externas)
- Facilita testes unitários (domain layer não depende de infraestrutura)
- Permite trocar infraestrutura sem afetar regras de negócio

### Layer Responsibilities

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| Domain | Entidades, Value Objects, Regras de negócio | User, Payment, CPF (VO), validateCPF() |
| Application | Use Cases, Orquestração | CreateInscriptionUseCase, ProcessWebhookUseCase |
| Infrastructure | Implementações concretas | FirebaseUserRepository, AsaasPaymentService |
| Presentation | UI, Controllers, API Routes | AuthContext, PaymentController, route.ts |

---

## 8. State Management

### Decision
Usar React Context para estado de autenticação, sem biblioteca externa de estado.

### Rationale
- Projeto de escala pequena (~500 usuários)
- Context API é suficiente para auth state
- Evita dependência adicional (Redux, Zustand)
- Next.js 15 já otimiza re-renders

---

## 9. Form Handling

### Decision
Usar React Hook Form + Zod para formulários e validação.

### Rationale
- Performance: não re-renderiza em cada keystroke
- Zod integra bem com TypeScript
- Validação declarativa e reutilizável

---

## 10. Environment Variables

### Required Variables
```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Asaas
ASAAS_API_KEY=
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://www.ieqredencaopa157.com
```

---

## Summary Table

| Topic | Decision | Confidence |
|-------|----------|------------|
| Authentication | Firebase Auth (Email + Google) | High |
| Database | Firebase Firestore | High |
| Payments | Asaas API (PIX, Boleto, Cartão) | High |
| Architecture | DDD (4 layers) | High |
| State Management | React Context | High |
| Form Handling | React Hook Form + Zod | High |
| Testing | Vitest + Playwright | High |
| Guest Inscriptions | Supported via CPF consultation | High |
| Webhook Strategy | Queue with retry (max 3) | High |
