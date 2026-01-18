# Data Model: Firebase Auth + Asaas Payments

**Feature**: `001-firebase-auth-asaas-payments`
**Date**: 2026-01-15

## Overview

Este documento define o modelo de dados para a integração de autenticação e pagamentos na plataforma IEQ 157. O banco de dados é Firebase Firestore (NoSQL).

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│    User     │       │    Event    │       │  EventCategory   │
├─────────────┤       ├─────────────┤       ├──────────────────┤
│ id (PK)     │       │ id (PK)     │◄──────│ id (PK)          │
│ email       │       │ titulo      │       │ eventId (FK)     │
│ nome        │       │ descricao   │       │ nome             │
│ telefone    │       │ dataInicio  │       │ valor            │
│ cpf         │       │ dataFim     │       └──────────────────┘
│ role        │       │ local       │
│ asaasId     │       │ status      │
└──────┬──────┘       │ paymentMethods│
       │              └───────┬───────┘
       │                      │
       │    ┌─────────────────┴─────────────────┐
       │    │                                   │
       ▼    ▼                                   │
┌──────────────────┐                            │
│   Inscription    │                            │
├──────────────────┤                            │
│ id (PK)          │                            │
│ eventId (FK)     │◄───────────────────────────┘
│ userId (FK)?     │
│ categoryId (FK)  │
│ guestData?       │
│ valor            │
│ status           │
└────────┬─────────┘
         │
         │
         ▼
┌──────────────────┐
│     Payment      │
├──────────────────┤
│ id (PK)          │
│ inscriptionId(FK)│
│ asaasPaymentId   │
│ userId (FK)?     │
│ valor            │
│ status           │
│ metodoPagamento  │
│ pixData?         │
│ boletoUrl?       │
└──────────────────┘
```

---

## Collections

### 1. Users

**Collection**: `users`
**Document ID**: Firebase Auth UID

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Firebase Auth UID |
| `email` | string | Yes | Email do usuário (unique) |
| `nome` | string | Yes | Nome completo |
| `telefone` | string | No | Telefone com DDD |
| `cpf` | string | No | CPF (apenas dígitos, 11 chars) |
| `role` | string | Yes | `"user"` ou `"admin"` |
| `asaasCustomerId` | string | No | ID do cliente no Asaas |
| `criadoEm` | timestamp | Yes | Data de criação |
| `atualizadoEm` | timestamp | Yes | Data de atualização |

**Validation Rules**:
- `email`: formato válido de email
- `cpf`: 11 dígitos, passa algoritmo de validação
- `telefone`: 10-11 dígitos
- `role`: enum `["user", "admin"]`

**Indexes**:
- `email` (unique)
- `cpf` (unique, where cpf != null)

---

### 2. Events

**Collection**: `events`
**Document ID**: Auto-generated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | ID do documento |
| `titulo` | string | Yes | Título do evento |
| `subtitulo` | string | No | Subtítulo |
| `descricao` | string | Yes | Descrição curta |
| `descricaoCompleta` | string | No | Descrição detalhada (markdown) |
| `dataInicio` | timestamp | Yes | Data/hora de início |
| `dataFim` | timestamp | No | Data/hora de fim |
| `local` | string | Yes | Nome do local |
| `endereco` | string | Yes | Endereço completo |
| `googleMapsUrl` | string | No | Link do Google Maps |
| `whatsappContato` | string | No | Número WhatsApp para contato |
| `status` | string | Yes | Status do evento |
| `metodosPagamento` | array | Yes | Métodos aceitos |
| `imagemUrl` | string | No | URL da imagem do evento |
| `criadoEm` | timestamp | Yes | Data de criação |
| `atualizadoEm` | timestamp | Yes | Data de atualização |

**Status Values** (enum):
- `"rascunho"` - Evento em preparação, não visível
- `"aberto"` - Inscrições abertas
- `"fechado"` - Inscrições encerradas, evento ainda não ocorreu
- `"encerrado"` - Evento já ocorreu
- `"cancelado"` - Evento cancelado

**Payment Methods** (enum array):
- `"PIX"`
- `"BOLETO"`
- `"CREDIT_CARD"`

**Indexes**:
- `status` (for filtering)
- `dataInicio` (for sorting)

---

### 3. Event Categories (Subcollection)

**Collection**: `events/{eventId}/categories`
**Document ID**: Auto-generated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | ID da categoria |
| `nome` | string | Yes | Nome da categoria (ex: "Casal", "Individual") |
| `valor` | number | Yes | Valor em centavos (ex: 15000 = R$150,00) |
| `descricao` | string | No | Descrição da categoria |
| `ordem` | number | No | Ordem de exibição |

**Validation Rules**:
- `valor`: >= 0 (0 para eventos gratuitos)
- `nome`: não vazio

---

### 4. Inscriptions

**Collection**: `inscriptions`
**Document ID**: Auto-generated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | ID da inscrição |
| `eventId` | string | Yes | ID do evento |
| `userId` | string | No | ID do usuário (null para visitantes) |
| `categoryId` | string | Yes | ID da categoria |
| `guestData` | object | No | Dados do visitante (quando userId é null) |
| `valor` | number | Yes | Valor em centavos (snapshot do momento) |
| `status` | string | Yes | Status da inscrição |
| `paymentId` | string | No | ID do pagamento confirmado |
| `criadoEm` | timestamp | Yes | Data de criação |
| `atualizadoEm` | timestamp | Yes | Data de atualização |

**GuestData Object**:
```typescript
{
  nome: string       // Nome completo
  email: string      // Email
  telefone: string   // Telefone
  cpf: string        // CPF (apenas dígitos)
}
```

**Status Values** (enum):
- `"pendente"` - Aguardando pagamento
- `"confirmado"` - Pagamento confirmado
- `"cancelado"` - Cancelado pelo usuário ou sistema

**State Transitions**:
```
pendente ──────► confirmado (pagamento recebido)
    │
    └──────────► cancelado (usuário cancela OU pagamento expira)
```

**Indexes**:
- `eventId` (for listing by event)
- `userId` (for listing by user)
- `eventId + status` (composite, for admin filtering)
- `eventId + guestData.cpf` (for guest lookup)

**Validation Rules**:
- Se `userId` é null, `guestData` é obrigatório
- Se `userId` existe, `guestData` deve ser null
- Não pode existir duas inscrições com mesmo `userId + eventId` (quando userId existe)
- Não pode existir duas inscrições com mesmo `guestData.cpf + eventId` (quando guestData existe)

---

### 5. Payments

**Collection**: `payments`
**Document ID**: Auto-generated

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | ID do pagamento |
| `inscriptionId` | string | Yes | ID da inscrição |
| `userId` | string | No | ID do usuário (denormalizado) |
| `asaasPaymentId` | string | Yes | ID do pagamento no Asaas |
| `valor` | number | Yes | Valor em centavos |
| `status` | string | Yes | Status do pagamento |
| `metodoPagamento` | string | Yes | Método utilizado |
| `pixQrCode` | string | No | QR Code PIX (base64) |
| `pixCopiaECola` | string | No | Código PIX copia-e-cola |
| `boletoUrl` | string | No | URL do boleto |
| `dataVencimento` | timestamp | Yes | Data de vencimento |
| `dataPagamento` | timestamp | No | Data efetiva do pagamento |
| `criadoEm` | timestamp | Yes | Data de criação |
| `atualizadoEm` | timestamp | Yes | Data de atualização |

**Status Values** (enum):
- `"PENDING"` - Aguardando pagamento
- `"RECEIVED"` - Pagamento recebido (PIX/Boleto)
- `"CONFIRMED"` - Pagamento confirmado
- `"OVERDUE"` - Vencido
- `"REFUNDED"` - Reembolsado
- `"CANCELLED"` - Cancelado

**Payment Method Values** (enum):
- `"PIX"`
- `"BOLETO"`
- `"CREDIT_CARD"`

**State Transitions**:
```
PENDING ──────► RECEIVED ──────► CONFIRMED
    │              │
    │              └──────────► REFUNDED
    │
    ├──────────► OVERDUE ──────► CANCELLED
    │
    └──────────► CANCELLED
```

**Indexes**:
- `asaasPaymentId` (unique, for webhook lookup)
- `inscriptionId` (for finding payment by inscription)
- `userId` (for listing user payments)
- `status` (for filtering)

---

## Firestore Security Rules (Overview)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if isAdmin();
    }

    // Events (public read)
    match /events/{eventId} {
      allow read: if true;
      allow write: if isAdmin();

      // Categories (public read)
      match /categories/{categoryId} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }

    // Inscriptions
    match /inscriptions/{inscriptionId} {
      allow read: if request.auth != null &&
                    resource.data.userId == request.auth.uid;
      allow create: if request.auth != null || true; // Guest allowed
      allow update, delete: if isAdmin();
      allow read: if isAdmin();
    }

    // Payments
    match /payments/{paymentId} {
      allow read: if request.auth != null &&
                    resource.data.userId == request.auth.uid;
      allow read: if isAdmin();
      // Write only via server (Admin SDK)
    }

    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## TypeScript Interfaces

```typescript
// Domain types (for reference)

interface User {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  role: 'user' | 'admin'
  asaasCustomerId?: string
  criadoEm: Date
  atualizadoEm: Date
}

interface Event {
  id: string
  titulo: string
  subtitulo?: string
  descricao: string
  descricaoCompleta?: string
  dataInicio: Date
  dataFim?: Date
  local: string
  endereco: string
  googleMapsUrl?: string
  whatsappContato?: string
  status: EventStatus
  metodosPagamento: PaymentMethod[]
  imagemUrl?: string
  criadoEm: Date
  atualizadoEm: Date
}

type EventStatus = 'rascunho' | 'aberto' | 'fechado' | 'encerrado' | 'cancelado'

interface EventCategory {
  id: string
  nome: string
  valor: number // in cents
  descricao?: string
  ordem?: number
}

interface GuestData {
  nome: string
  email: string
  telefone: string
  cpf: string
}

interface Inscription {
  id: string
  eventId: string
  userId?: string
  categoryId: string
  guestData?: GuestData
  valor: number // in cents
  status: InscriptionStatus
  paymentId?: string
  criadoEm: Date
  atualizadoEm: Date
}

type InscriptionStatus = 'pendente' | 'confirmado' | 'cancelado'

interface Payment {
  id: string
  inscriptionId: string
  userId?: string
  asaasPaymentId: string
  valor: number // in cents
  status: PaymentStatus
  metodoPagamento: PaymentMethod
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
  dataVencimento: Date
  dataPagamento?: Date
  criadoEm: Date
  atualizadoEm: Date
}

type PaymentStatus = 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED'
type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD'
```

---

## Migration Notes

### From Current State
O projeto atual não possui sistema de autenticação nem banco de dados estruturado. A migração consiste em:

1. Configurar Firebase (Auth + Firestore)
2. Criar collections vazias
3. Popular `events` com dados existentes de `src/data/eventos.ts`
4. Criar primeiro usuário admin manualmente

### Seed Data
```typescript
// Exemplo de evento inicial
const seedEvent = {
  titulo: "Encontro com Deus",
  descricao: "Evento de transformação espiritual",
  status: "aberto",
  metodosPagamento: ["PIX", "BOLETO"],
  // ... outros campos
}
```
