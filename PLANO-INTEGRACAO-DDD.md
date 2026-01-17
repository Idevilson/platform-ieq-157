# Plano de Integração: Firebase Auth + Asaas Payments (DDD)

## Resumo
Integrar autenticação Firebase e pagamentos Asaas na plataforma IEQ 157, seguindo os princípios de **Domain-Driven Design (DDD)** para garantir escalabilidade, manutenibilidade e separação clara de responsabilidades.

**Requisitos definidos pelo usuário:**
- Autenticação: Email/Senha + Google
- Ambiente Asaas: Sandbox (testes)
- Pagamentos: PIX, Boleto, Cartão (configurável por evento)
- Painel admin para gerenciar eventos

---

## Arquitetura DDD - Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  (Next.js App Router - Pages, Components, API Routes)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│  (Use Cases, DTOs, Application Services)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                               │
│  (Entities, Value Objects, Domain Services, Repository Ports)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                          │
│  (Firebase, Asaas API, Repository Implementations)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Pastas (DDD)

```
src/
├── domain/                          # 🔷 CAMADA DE DOMÍNIO
│   ├── user/
│   │   ├── entities/
│   │   │   └── User.ts              # Entidade User
│   │   ├── value-objects/
│   │   │   ├── Email.ts             # Value Object Email
│   │   │   ├── CPF.ts               # Value Object CPF
│   │   │   └── Phone.ts             # Value Object Telefone
│   │   ├── repositories/
│   │   │   └── IUserRepository.ts   # Interface (Port)
│   │   └── services/
│   │       └── UserDomainService.ts # Regras de negócio do usuário
│   │
│   ├── event/
│   │   ├── entities/
│   │   │   ├── Event.ts             # Entidade Evento
│   │   │   └── EventCategory.ts     # Entidade Categoria
│   │   ├── value-objects/
│   │   │   ├── EventStatus.ts       # Value Object Status
│   │   │   └── PaymentMethods.ts    # Value Object Métodos
│   │   ├── repositories/
│   │   │   └── IEventRepository.ts  # Interface (Port)
│   │   └── services/
│   │       └── EventDomainService.ts
│   │
│   ├── inscription/
│   │   ├── entities/
│   │   │   └── Inscription.ts       # Entidade Inscrição
│   │   ├── value-objects/
│   │   │   └── InscriptionStatus.ts # Value Object Status
│   │   ├── repositories/
│   │   │   └── IInscriptionRepository.ts
│   │   └── services/
│   │       └── InscriptionDomainService.ts
│   │
│   ├── payment/
│   │   ├── entities/
│   │   │   └── Payment.ts           # Entidade Pagamento
│   │   ├── value-objects/
│   │   │   ├── PaymentStatus.ts     # Value Object Status
│   │   │   ├── PaymentMethod.ts     # PIX, Boleto, Cartão
│   │   │   └── Money.ts             # Value Object Dinheiro
│   │   ├── repositories/
│   │   │   └── IPaymentRepository.ts
│   │   └── services/
│   │       └── PaymentDomainService.ts
│   │
│   └── shared/
│       ├── Entity.ts                # Base class para entidades
│       ├── ValueObject.ts           # Base class para VOs
│       ├── UniqueId.ts              # Gerador de IDs únicos
│       └── errors/
│           ├── DomainError.ts       # Erro base de domínio
│           ├── InvalidCPFError.ts
│           ├── InvalidEmailError.ts
│           └── InsufficientDataError.ts
│
├── application/                     # 🔶 CAMADA DE APLICAÇÃO
│   ├── user/
│   │   ├── use-cases/
│   │   │   ├── CreateUserUseCase.ts
│   │   │   ├── AuthenticateUserUseCase.ts
│   │   │   ├── GetUserProfileUseCase.ts
│   │   │   └── UpdateUserProfileUseCase.ts
│   │   └── dtos/
│   │       ├── CreateUserDTO.ts
│   │       ├── UserResponseDTO.ts
│   │       └── UpdateUserDTO.ts
│   │
│   ├── event/
│   │   ├── use-cases/
│   │   │   ├── CreateEventUseCase.ts
│   │   │   ├── UpdateEventUseCase.ts
│   │   │   ├── ListEventsUseCase.ts
│   │   │   └── GetEventByIdUseCase.ts
│   │   └── dtos/
│   │       ├── CreateEventDTO.ts
│   │       ├── EventResponseDTO.ts
│   │       └── UpdateEventDTO.ts
│   │
│   ├── inscription/
│   │   ├── use-cases/
│   │   │   ├── CreateInscriptionUseCase.ts
│   │   │   ├── ConfirmInscriptionUseCase.ts
│   │   │   ├── CancelInscriptionUseCase.ts
│   │   │   ├── ListUserInscriptionsUseCase.ts
│   │   │   └── ListEventInscriptionsUseCase.ts
│   │   └── dtos/
│   │       ├── CreateInscriptionDTO.ts
│   │       └── InscriptionResponseDTO.ts
│   │
│   ├── payment/
│   │   ├── use-cases/
│   │   │   ├── CreatePaymentUseCase.ts
│   │   │   ├── ProcessPaymentWebhookUseCase.ts
│   │   │   ├── GetPaymentStatusUseCase.ts
│   │   │   └── ListUserPaymentsUseCase.ts
│   │   └── dtos/
│   │       ├── CreatePaymentDTO.ts
│   │       ├── PaymentResponseDTO.ts
│   │       └── WebhookPayloadDTO.ts
│   │
│   └── shared/
│       ├── UseCase.ts               # Interface base para use cases
│       └── ApplicationError.ts      # Erros de aplicação
│
├── infrastructure/                  # 🔷 CAMADA DE INFRAESTRUTURA
│   ├── firebase/
│   │   ├── config/
│   │   │   ├── client.ts            # Firebase Client SDK
│   │   │   └── admin.ts             # Firebase Admin SDK
│   │   ├── repositories/
│   │   │   ├── FirebaseUserRepository.ts
│   │   │   ├── FirebaseEventRepository.ts
│   │   │   ├── FirebaseInscriptionRepository.ts
│   │   │   └── FirebasePaymentRepository.ts
│   │   ├── mappers/
│   │   │   ├── UserMapper.ts        # Entity <-> Firestore
│   │   │   ├── EventMapper.ts
│   │   │   ├── InscriptionMapper.ts
│   │   │   └── PaymentMapper.ts
│   │   └── services/
│   │       └── FirebaseAuthService.ts
│   │
│   ├── asaas/
│   │   ├── config/
│   │   │   └── client.ts            # Config Asaas API
│   │   ├── services/
│   │   │   ├── AsaasCustomerService.ts
│   │   │   └── AsaasPaymentService.ts
│   │   └── mappers/
│   │       └── AsaasPaymentMapper.ts
│   │
│   └── shared/
│       └── HttpClient.ts            # Wrapper para fetch
│
├── presentation/                    # 🔶 CAMADA DE APRESENTAÇÃO
│   ├── contexts/
│   │   └── AuthContext.tsx          # Provider de autenticação
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useInscription.ts
│   │   └── usePayment.ts
│   │
│   ├── components/
│   │   ├── ui/                      # Componentes genéricos
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── auth/                    # Componentes de autenticação
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── GoogleButton.tsx
│   │   │
│   │   ├── payment/                 # Componentes de pagamento
│   │   │   ├── PixPayment.tsx
│   │   │   ├── BoletoPayment.tsx
│   │   │   ├── CardPayment.tsx
│   │   │   └── PaymentStatusBadge.tsx
│   │   │
│   │   ├── inscription/             # Componentes de inscrição
│   │   │   ├── InscriptionModal.tsx
│   │   │   ├── InscriptionCard.tsx
│   │   │   └── CategorySelector.tsx
│   │   │
│   │   └── admin/                   # Componentes admin
│   │       ├── EventForm.tsx
│   │       ├── DataTable.tsx
│   │       └── StatsCard.tsx
│   │
│   └── controllers/                 # Controladores para API routes
│       ├── UserController.ts
│       ├── EventController.ts
│       ├── InscriptionController.ts
│       └── PaymentController.ts
│
├── app/                             # 🔷 NEXT.JS APP ROUTER
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── cadastro/page.tsx
│   │   └── recuperar-senha/page.tsx
│   │
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Home
│   │   ├── eventos/
│   │   ├── startup/
│   │   ├── avisos/
│   │   ├── calendario/
│   │   └── sobre/
│   │
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── minha-conta/
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── inscricoes/page.tsx
│   │   │   ├── pagamentos/page.tsx
│   │   │   └── perfil/page.tsx
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx             # Dashboard Admin
│   │       ├── eventos/
│   │       ├── inscricoes/page.tsx
│   │       └── pagamentos/page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── register/route.ts
│       ├── users/
│       │   └── [id]/route.ts
│       ├── events/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── inscriptions/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── payments/
│           ├── create/route.ts
│           ├── [id]/status/route.ts
│           └── webhook/route.ts
│
├── config/
│   ├── constants.ts                 # Constantes da aplicação
│   └── env.ts                       # Validação de env vars
│
├── styles/                          # CSS existentes
│
└── middleware.ts                    # Next.js middleware
```

---

## Camada de Domínio (Core Business)

### Entidades

#### User Entity
```typescript
// src/domain/user/entities/User.ts
import { Entity } from '@/domain/shared/Entity'
import { Email } from '../value-objects/Email'
import { CPF } from '../value-objects/CPF'
import { Phone } from '../value-objects/Phone'

export type UserRole = 'user' | 'admin'

interface UserProps {
  email: Email
  nome: string
  telefone?: Phone
  cpf?: CPF
  asaasCustomerId?: string
  role: UserRole
  criadoEm: Date
  atualizadoEm: Date
}

export class User extends Entity<UserProps> {
  get email(): Email { return this.props.email }
  get nome(): string { return this.props.nome }
  get telefone(): Phone | undefined { return this.props.telefone }
  get cpf(): CPF | undefined { return this.props.cpf }
  get asaasCustomerId(): string | undefined { return this.props.asaasCustomerId }
  get role(): UserRole { return this.props.role }
  get isAdmin(): boolean { return this.props.role === 'admin' }

  public canMakePayment(): boolean {
    return !!this.props.cpf && this.props.cpf.isValid()
  }

  public updateProfile(data: Partial<Pick<UserProps, 'nome' | 'telefone' | 'cpf'>>): void {
    if (data.nome) this.props.nome = data.nome
    if (data.telefone) this.props.telefone = data.telefone
    if (data.cpf) this.props.cpf = data.cpf
    this.props.atualizadoEm = new Date()
  }

  public setAsaasCustomerId(customerId: string): void {
    this.props.asaasCustomerId = customerId
    this.props.atualizadoEm = new Date()
  }

  public static create(props: UserProps, id?: string): User {
    return new User(props, id)
  }
}
```

#### Event Entity
```typescript
// src/domain/event/entities/Event.ts
import { Entity } from '@/domain/shared/Entity'
import { EventStatus } from '../value-objects/EventStatus'
import { PaymentMethods } from '../value-objects/PaymentMethods'
import { EventCategory } from './EventCategory'

interface EventProps {
  titulo: string
  subtitulo?: string
  descricao: string
  descricaoCompleta?: string
  dataInicio: Date
  dataFim?: Date
  local: string
  endereco: string
  status: EventStatus
  categorias: EventCategory[]
  metodosPagamento: PaymentMethods
  googleMapsUrl?: string
  whatsappContato?: string
  criadoEm: Date
  atualizadoEm: Date
}

export class Event extends Entity<EventProps> {
  get titulo(): string { return this.props.titulo }
  get status(): EventStatus { return this.props.status }
  get categorias(): EventCategory[] { return this.props.categorias }
  get metodosPagamento(): PaymentMethods { return this.props.metodosPagamento }

  public isOpen(): boolean {
    return this.props.status.isOpen()
  }

  public canRegister(): boolean {
    return this.isOpen() && this.props.categorias.length > 0
  }

  public getCategoryById(categoryId: string): EventCategory | undefined {
    return this.props.categorias.find(c => c.id === categoryId)
  }

  public addCategory(category: EventCategory): void {
    this.props.categorias.push(category)
    this.props.atualizadoEm = new Date()
  }

  public removeCategory(categoryId: string): void {
    this.props.categorias = this.props.categorias.filter(c => c.id !== categoryId)
    this.props.atualizadoEm = new Date()
  }

  public updateStatus(status: EventStatus): void {
    this.props.status = status
    this.props.atualizadoEm = new Date()
  }

  public static create(props: EventProps, id?: string): Event {
    return new Event(props, id)
  }
}
```

#### Inscription Entity
```typescript
// src/domain/inscription/entities/Inscription.ts
import { Entity } from '@/domain/shared/Entity'
import { InscriptionStatus } from '../value-objects/InscriptionStatus'
import { Money } from '@/domain/payment/value-objects/Money'

interface InscriptionProps {
  eventoId: string
  userId: string
  categoriaId: string
  valor: Money
  status: InscriptionStatus
  paymentId?: string
  criadoEm: Date
  atualizadoEm: Date
}

export class Inscription extends Entity<InscriptionProps> {
  get eventoId(): string { return this.props.eventoId }
  get userId(): string { return this.props.userId }
  get categoriaId(): string { return this.props.categoriaId }
  get valor(): Money { return this.props.valor }
  get status(): InscriptionStatus { return this.props.status }
  get paymentId(): string | undefined { return this.props.paymentId }

  public isPending(): boolean {
    return this.props.status.isPending()
  }

  public isConfirmed(): boolean {
    return this.props.status.isConfirmed()
  }

  public confirm(paymentId: string): void {
    this.props.status = InscriptionStatus.confirmed()
    this.props.paymentId = paymentId
    this.props.atualizadoEm = new Date()
  }

  public cancel(): void {
    if (this.isConfirmed()) {
      throw new Error('Não é possível cancelar uma inscrição confirmada')
    }
    this.props.status = InscriptionStatus.cancelled()
    this.props.atualizadoEm = new Date()
  }

  public static create(props: InscriptionProps, id?: string): Inscription {
    return new Inscription(props, id)
  }
}
```

#### Payment Entity
```typescript
// src/domain/payment/entities/Payment.ts
import { Entity } from '@/domain/shared/Entity'
import { PaymentStatus } from '../value-objects/PaymentStatus'
import { PaymentMethod } from '../value-objects/PaymentMethod'
import { Money } from '../value-objects/Money'

interface PaymentProps {
  asaasPaymentId: string
  inscriptionId: string
  userId: string
  valor: Money
  status: PaymentStatus
  metodoPagamento: PaymentMethod
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
  dataPagamento?: Date
  criadoEm: Date
  atualizadoEm: Date
}

export class Payment extends Entity<PaymentProps> {
  get asaasPaymentId(): string { return this.props.asaasPaymentId }
  get inscriptionId(): string { return this.props.inscriptionId }
  get userId(): string { return this.props.userId }
  get valor(): Money { return this.props.valor }
  get status(): PaymentStatus { return this.props.status }
  get metodoPagamento(): PaymentMethod { return this.props.metodoPagamento }
  get pixQrCode(): string | undefined { return this.props.pixQrCode }
  get pixCopiaECola(): string | undefined { return this.props.pixCopiaECola }
  get boletoUrl(): string | undefined { return this.props.boletoUrl }

  public isPending(): boolean {
    return this.props.status.isPending()
  }

  public isConfirmed(): boolean {
    return this.props.status.isConfirmed()
  }

  public markAsReceived(): void {
    this.props.status = PaymentStatus.received()
    this.props.dataPagamento = new Date()
    this.props.atualizadoEm = new Date()
  }

  public markAsOverdue(): void {
    this.props.status = PaymentStatus.overdue()
    this.props.atualizadoEm = new Date()
  }

  public updateStatus(status: PaymentStatus): void {
    this.props.status = status
    if (status.isConfirmed()) {
      this.props.dataPagamento = new Date()
    }
    this.props.atualizadoEm = new Date()
  }

  public static create(props: PaymentProps, id?: string): Payment {
    return new Payment(props, id)
  }
}
```

### Value Objects

```typescript
// src/domain/user/value-objects/CPF.ts
import { ValueObject } from '@/domain/shared/ValueObject'
import { InvalidCPFError } from '@/domain/shared/errors/InvalidCPFError'

interface CPFProps {
  value: string
}

export class CPF extends ValueObject<CPFProps> {
  private constructor(props: CPFProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  get formatted(): string {
    const digits = this.props.value.replace(/\D/g, '')
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  public isValid(): boolean {
    return CPF.validate(this.props.value)
  }

  public static validate(cpf: string): boolean {
    const digits = cpf.replace(/\D/g, '')
    if (digits.length !== 11) return false
    if (/^(\d)\1+$/.test(digits)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(digits[9])) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(digits[10])) return false

    return true
  }

  public static create(value: string): CPF {
    if (!CPF.validate(value)) {
      throw new InvalidCPFError(value)
    }
    return new CPF({ value: value.replace(/\D/g, '') })
  }
}
```

```typescript
// src/domain/payment/value-objects/Money.ts
import { ValueObject } from '@/domain/shared/ValueObject'

interface MoneyProps {
  amount: number
  currency: string
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props)
  }

  get amount(): number { return this.props.amount }
  get currency(): string { return this.props.currency }

  get formatted(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: this.props.currency
    }).format(this.props.amount)
  }

  public add(other: Money): Money {
    if (this.props.currency !== other.currency) {
      throw new Error('Não é possível somar moedas diferentes')
    }
    return Money.create(this.props.amount + other.amount, this.props.currency)
  }

  public static create(amount: number, currency: string = 'BRL'): Money {
    if (amount < 0) {
      throw new Error('Valor não pode ser negativo')
    }
    return new Money({ amount, currency })
  }

  public static fromCents(cents: number, currency: string = 'BRL'): Money {
    return Money.create(cents / 100, currency)
  }
}
```

```typescript
// src/domain/payment/value-objects/PaymentStatus.ts
import { ValueObject } from '@/domain/shared/ValueObject'

type PaymentStatusType = 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED'

interface PaymentStatusProps {
  value: PaymentStatusType
}

export class PaymentStatus extends ValueObject<PaymentStatusProps> {
  private constructor(props: PaymentStatusProps) {
    super(props)
  }

  get value(): PaymentStatusType { return this.props.value }

  public isPending(): boolean { return this.props.value === 'PENDING' }
  public isReceived(): boolean { return this.props.value === 'RECEIVED' }
  public isConfirmed(): boolean { return this.props.value === 'CONFIRMED' || this.props.value === 'RECEIVED' }
  public isOverdue(): boolean { return this.props.value === 'OVERDUE' }

  public static pending(): PaymentStatus { return new PaymentStatus({ value: 'PENDING' }) }
  public static received(): PaymentStatus { return new PaymentStatus({ value: 'RECEIVED' }) }
  public static confirmed(): PaymentStatus { return new PaymentStatus({ value: 'CONFIRMED' }) }
  public static overdue(): PaymentStatus { return new PaymentStatus({ value: 'OVERDUE' }) }

  public static fromString(value: string): PaymentStatus {
    const validValues: PaymentStatusType[] = ['PENDING', 'RECEIVED', 'CONFIRMED', 'OVERDUE', 'REFUNDED', 'CANCELLED']
    if (!validValues.includes(value as PaymentStatusType)) {
      throw new Error(`Status de pagamento inválido: ${value}`)
    }
    return new PaymentStatus({ value: value as PaymentStatusType })
  }
}
```

### Repository Interfaces (Ports)

```typescript
// src/domain/user/repositories/IUserRepository.ts
import { User } from '../entities/User'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<void>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
}
```

```typescript
// src/domain/inscription/repositories/IInscriptionRepository.ts
import { Inscription } from '../entities/Inscription'

export interface IInscriptionRepository {
  findById(id: string): Promise<Inscription | null>
  findByUserId(userId: string): Promise<Inscription[]>
  findByEventId(eventId: string): Promise<Inscription[]>
  findByUserAndEvent(userId: string, eventId: string): Promise<Inscription | null>
  save(inscription: Inscription): Promise<void>
  update(inscription: Inscription): Promise<void>
}
```

```typescript
// src/domain/payment/repositories/IPaymentRepository.ts
import { Payment } from '../entities/Payment'

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>
  findByAsaasId(asaasPaymentId: string): Promise<Payment | null>
  findByInscriptionId(inscriptionId: string): Promise<Payment | null>
  findByUserId(userId: string): Promise<Payment[]>
  save(payment: Payment): Promise<void>
  update(payment: Payment): Promise<void>
}
```

---

## Camada de Aplicação (Use Cases)

### CreateInscriptionUseCase

```typescript
// src/application/inscription/use-cases/CreateInscriptionUseCase.ts
import { IUserRepository } from '@/domain/user/repositories/IUserRepository'
import { IEventRepository } from '@/domain/event/repositories/IEventRepository'
import { IInscriptionRepository } from '@/domain/inscription/repositories/IInscriptionRepository'
import { Inscription } from '@/domain/inscription/entities/Inscription'
import { InscriptionStatus } from '@/domain/inscription/value-objects/InscriptionStatus'
import { Money } from '@/domain/payment/value-objects/Money'
import { CreateInscriptionDTO } from '../dtos/CreateInscriptionDTO'
import { InscriptionResponseDTO } from '../dtos/InscriptionResponseDTO'
import { ApplicationError } from '@/application/shared/ApplicationError'

export class CreateInscriptionUseCase {
  constructor(
    private userRepository: IUserRepository,
    private eventRepository: IEventRepository,
    private inscriptionRepository: IInscriptionRepository
  ) {}

  async execute(dto: CreateInscriptionDTO): Promise<InscriptionResponseDTO> {
    // 1. Buscar usuário
    const user = await this.userRepository.findById(dto.userId)
    if (!user) {
      throw new ApplicationError('Usuário não encontrado', 'USER_NOT_FOUND')
    }

    // 2. Verificar se usuário pode fazer pagamento (tem CPF)
    if (!user.canMakePayment()) {
      throw new ApplicationError(
        'Complete seu perfil com o CPF para fazer inscrições',
        'CPF_REQUIRED'
      )
    }

    // 3. Buscar evento
    const event = await this.eventRepository.findById(dto.eventoId)
    if (!event) {
      throw new ApplicationError('Evento não encontrado', 'EVENT_NOT_FOUND')
    }

    // 4. Verificar se evento está aberto para inscrições
    if (!event.canRegister()) {
      throw new ApplicationError('Evento não está aberto para inscrições', 'EVENT_CLOSED')
    }

    // 5. Buscar categoria
    const category = event.getCategoryById(dto.categoriaId)
    if (!category) {
      throw new ApplicationError('Categoria não encontrada', 'CATEGORY_NOT_FOUND')
    }

    // 6. Verificar se usuário já está inscrito
    const existingInscription = await this.inscriptionRepository.findByUserAndEvent(
      dto.userId,
      dto.eventoId
    )
    if (existingInscription && !existingInscription.status.isCancelled()) {
      throw new ApplicationError('Usuário já está inscrito neste evento', 'ALREADY_REGISTERED')
    }

    // 7. Criar inscrição
    const inscription = Inscription.create({
      eventoId: dto.eventoId,
      userId: dto.userId,
      categoriaId: dto.categoriaId,
      valor: Money.create(category.valor),
      status: InscriptionStatus.pending(),
      criadoEm: new Date(),
      atualizadoEm: new Date()
    })

    // 8. Salvar inscrição
    await this.inscriptionRepository.save(inscription)

    // 9. Retornar DTO
    return {
      id: inscription.id,
      eventoId: inscription.eventoId,
      evento: event.titulo,
      categoriaId: inscription.categoriaId,
      categoria: category.nome,
      valor: inscription.valor.formatted,
      valorNumerico: inscription.valor.amount,
      status: inscription.status.value,
      criadoEm: inscription.props.criadoEm.toISOString()
    }
  }
}
```

### CreatePaymentUseCase

```typescript
// src/application/payment/use-cases/CreatePaymentUseCase.ts
import { IUserRepository } from '@/domain/user/repositories/IUserRepository'
import { IInscriptionRepository } from '@/domain/inscription/repositories/IInscriptionRepository'
import { IPaymentRepository } from '@/domain/payment/repositories/IPaymentRepository'
import { IAsaasPaymentService } from '@/infrastructure/asaas/services/IAsaasPaymentService'
import { Payment } from '@/domain/payment/entities/Payment'
import { PaymentStatus } from '@/domain/payment/value-objects/PaymentStatus'
import { PaymentMethod } from '@/domain/payment/value-objects/PaymentMethod'
import { CreatePaymentDTO } from '../dtos/CreatePaymentDTO'
import { PaymentResponseDTO } from '../dtos/PaymentResponseDTO'
import { ApplicationError } from '@/application/shared/ApplicationError'

export class CreatePaymentUseCase {
  constructor(
    private userRepository: IUserRepository,
    private inscriptionRepository: IInscriptionRepository,
    private paymentRepository: IPaymentRepository,
    private asaasPaymentService: IAsaasPaymentService
  ) {}

  async execute(dto: CreatePaymentDTO): Promise<PaymentResponseDTO> {
    // 1. Buscar inscrição
    const inscription = await this.inscriptionRepository.findById(dto.inscriptionId)
    if (!inscription) {
      throw new ApplicationError('Inscrição não encontrada', 'INSCRIPTION_NOT_FOUND')
    }

    // 2. Verificar se já existe pagamento para esta inscrição
    const existingPayment = await this.paymentRepository.findByInscriptionId(dto.inscriptionId)
    if (existingPayment && existingPayment.isPending()) {
      // Retornar pagamento existente
      return this.toResponseDTO(existingPayment)
    }

    // 3. Buscar usuário
    const user = await this.userRepository.findById(inscription.userId)
    if (!user) {
      throw new ApplicationError('Usuário não encontrado', 'USER_NOT_FOUND')
    }

    // 4. Criar/buscar cliente no Asaas
    let customerId = user.asaasCustomerId
    if (!customerId) {
      const customer = await this.asaasPaymentService.createCustomer({
        name: user.nome,
        email: user.email.value,
        cpfCnpj: user.cpf!.value,
        phone: user.telefone?.value
      })
      customerId = customer.id
      user.setAsaasCustomerId(customerId)
      await this.userRepository.update(user)
    }

    // 5. Criar cobrança no Asaas
    const metodoPagamento = PaymentMethod.fromString(dto.metodoPagamento)
    const asaasPayment = await this.asaasPaymentService.createPayment({
      customer: customerId,
      billingType: metodoPagamento.toAsaasType(),
      value: inscription.valor.amount,
      dueDate: this.calculateDueDate(),
      description: `Inscrição - ${dto.eventoNome}`,
      externalReference: inscription.id
    })

    // 6. Obter dados específicos do método de pagamento
    let pixData = null
    if (metodoPagamento.isPix()) {
      pixData = await this.asaasPaymentService.getPixQrCode(asaasPayment.id)
    }

    // 7. Criar entidade de pagamento
    const payment = Payment.create({
      asaasPaymentId: asaasPayment.id,
      inscriptionId: inscription.id,
      userId: user.id,
      valor: inscription.valor,
      status: PaymentStatus.pending(),
      metodoPagamento,
      pixQrCode: pixData?.encodedImage,
      pixCopiaECola: pixData?.payload,
      boletoUrl: asaasPayment.bankSlipUrl,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    })

    // 8. Salvar pagamento
    await this.paymentRepository.save(payment)

    return this.toResponseDTO(payment)
  }

  private calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 3) // Vencimento em 3 dias
    return date.toISOString().split('T')[0]
  }

  private toResponseDTO(payment: Payment): PaymentResponseDTO {
    return {
      id: payment.id,
      asaasPaymentId: payment.asaasPaymentId,
      valor: payment.valor.formatted,
      status: payment.status.value,
      metodoPagamento: payment.metodoPagamento.value,
      pixQrCode: payment.pixQrCode,
      pixCopiaECola: payment.pixCopiaECola,
      boletoUrl: payment.boletoUrl
    }
  }
}
```

### ProcessPaymentWebhookUseCase

```typescript
// src/application/payment/use-cases/ProcessPaymentWebhookUseCase.ts
import { IPaymentRepository } from '@/domain/payment/repositories/IPaymentRepository'
import { IInscriptionRepository } from '@/domain/inscription/repositories/IInscriptionRepository'
import { PaymentStatus } from '@/domain/payment/value-objects/PaymentStatus'
import { WebhookPayloadDTO } from '../dtos/WebhookPayloadDTO'
import { ApplicationError } from '@/application/shared/ApplicationError'

export class ProcessPaymentWebhookUseCase {
  constructor(
    private paymentRepository: IPaymentRepository,
    private inscriptionRepository: IInscriptionRepository
  ) {}

  async execute(dto: WebhookPayloadDTO): Promise<void> {
    // 1. Buscar pagamento pelo ID do Asaas
    const payment = await this.paymentRepository.findByAsaasId(dto.payment.id)
    if (!payment) {
      throw new ApplicationError('Pagamento não encontrado', 'PAYMENT_NOT_FOUND')
    }

    // 2. Atualizar status do pagamento
    const newStatus = PaymentStatus.fromString(dto.payment.status)
    payment.updateStatus(newStatus)
    await this.paymentRepository.update(payment)

    // 3. Se pagamento confirmado, confirmar inscrição
    if (payment.isConfirmed()) {
      const inscription = await this.inscriptionRepository.findById(payment.inscriptionId)
      if (inscription) {
        inscription.confirm(payment.id)
        await this.inscriptionRepository.update(inscription)
      }
    }
  }
}
```

### DTOs

```typescript
// src/application/inscription/dtos/CreateInscriptionDTO.ts
export interface CreateInscriptionDTO {
  userId: string
  eventoId: string
  categoriaId: string
}

// src/application/inscription/dtos/InscriptionResponseDTO.ts
export interface InscriptionResponseDTO {
  id: string
  eventoId: string
  evento: string
  categoriaId: string
  categoria: string
  valor: string
  valorNumerico: number
  status: string
  paymentId?: string
  criadoEm: string
}

// src/application/payment/dtos/CreatePaymentDTO.ts
export interface CreatePaymentDTO {
  inscriptionId: string
  metodoPagamento: 'PIX' | 'BOLETO' | 'CREDIT_CARD'
  eventoNome: string
}

// src/application/payment/dtos/PaymentResponseDTO.ts
export interface PaymentResponseDTO {
  id: string
  asaasPaymentId: string
  valor: string
  status: string
  metodoPagamento: string
  pixQrCode?: string
  pixCopiaECola?: string
  boletoUrl?: string
}

// src/application/payment/dtos/WebhookPayloadDTO.ts
export interface WebhookPayloadDTO {
  event: string
  payment: {
    id: string
    status: string
    value: number
    externalReference?: string
  }
}
```

---

## Camada de Infraestrutura

### Firebase Repository Implementation

```typescript
// src/infrastructure/firebase/repositories/FirebaseUserRepository.ts
import { adminDb } from '../config/admin'
import { IUserRepository } from '@/domain/user/repositories/IUserRepository'
import { User } from '@/domain/user/entities/User'
import { UserMapper } from '../mappers/UserMapper'

export class FirebaseUserRepository implements IUserRepository {
  private collection = adminDb.collection('users')

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null
    return UserMapper.toDomain(doc.id, doc.data()!)
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('email', '==', email)
      .limit(1)
      .get()

    if (snapshot.empty) return null
    const doc = snapshot.docs[0]
    return UserMapper.toDomain(doc.id, doc.data())
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user)
    await this.collection.doc(user.id).set(data)
  }

  async update(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user)
    await this.collection.doc(user.id).update(data)
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete()
  }
}
```

### User Mapper

```typescript
// src/infrastructure/firebase/mappers/UserMapper.ts
import { User, UserRole } from '@/domain/user/entities/User'
import { Email } from '@/domain/user/value-objects/Email'
import { CPF } from '@/domain/user/value-objects/CPF'
import { Phone } from '@/domain/user/value-objects/Phone'

interface UserDocument {
  email: string
  nome: string
  telefone?: string
  cpf?: string
  asaasCustomerId?: string
  role: string
  criadoEm: FirebaseFirestore.Timestamp
  atualizadoEm: FirebaseFirestore.Timestamp
}

export class UserMapper {
  static toDomain(id: string, data: UserDocument): User {
    return User.create(
      {
        email: Email.create(data.email),
        nome: data.nome,
        telefone: data.telefone ? Phone.create(data.telefone) : undefined,
        cpf: data.cpf ? CPF.create(data.cpf) : undefined,
        asaasCustomerId: data.asaasCustomerId,
        role: data.role as UserRole,
        criadoEm: data.criadoEm.toDate(),
        atualizadoEm: data.atualizadoEm.toDate()
      },
      id
    )
  }

  static toPersistence(user: User): UserDocument {
    return {
      email: user.email.value,
      nome: user.nome,
      telefone: user.telefone?.value,
      cpf: user.cpf?.value,
      asaasCustomerId: user.asaasCustomerId,
      role: user.role,
      criadoEm: user.props.criadoEm as any,
      atualizadoEm: user.props.atualizadoEm as any
    }
  }
}
```

### Asaas Service Implementation

```typescript
// src/infrastructure/asaas/services/AsaasPaymentService.ts
import { ASAAS_API_URL, asaasHeaders } from '../config/client'
import { IAsaasPaymentService, CreateCustomerInput, CreatePaymentInput, PixQrCodeOutput } from './IAsaasPaymentService'

export class AsaasPaymentService implements IAsaasPaymentService {
  async createCustomer(input: CreateCustomerInput): Promise<{ id: string }> {
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: asaasHeaders,
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Erro ao criar cliente no Asaas: ${error.message || 'Erro desconhecido'}`)
    }

    return response.json()
  }

  async createPayment(input: CreatePaymentInput): Promise<{ id: string; bankSlipUrl?: string }> {
    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: asaasHeaders,
      body: JSON.stringify(input)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Erro ao criar pagamento no Asaas: ${error.message || 'Erro desconhecido'}`)
    }

    return response.json()
  }

  async getPixQrCode(paymentId: string): Promise<PixQrCodeOutput> {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, {
      headers: asaasHeaders
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Erro ao obter QR Code PIX: ${error.message || 'Erro desconhecido'}`)
    }

    return response.json()
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      headers: asaasHeaders
    })

    if (!response.ok) {
      throw new Error('Erro ao obter status do pagamento')
    }

    const data = await response.json()
    return data.status
  }
}
```

---

## Camada de Apresentação

### Controllers

```typescript
// src/presentation/controllers/PaymentController.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/infrastructure/firebase/config/admin'
import { FirebaseUserRepository } from '@/infrastructure/firebase/repositories/FirebaseUserRepository'
import { FirebaseInscriptionRepository } from '@/infrastructure/firebase/repositories/FirebaseInscriptionRepository'
import { FirebasePaymentRepository } from '@/infrastructure/firebase/repositories/FirebasePaymentRepository'
import { AsaasPaymentService } from '@/infrastructure/asaas/services/AsaasPaymentService'
import { CreatePaymentUseCase } from '@/application/payment/use-cases/CreatePaymentUseCase'
import { ProcessPaymentWebhookUseCase } from '@/application/payment/use-cases/ProcessPaymentWebhookUseCase'
import { ApplicationError } from '@/application/shared/ApplicationError'

export class PaymentController {
  private createPaymentUseCase: CreatePaymentUseCase
  private processWebhookUseCase: ProcessPaymentWebhookUseCase

  constructor() {
    const userRepository = new FirebaseUserRepository()
    const inscriptionRepository = new FirebaseInscriptionRepository()
    const paymentRepository = new FirebasePaymentRepository()
    const asaasService = new AsaasPaymentService()

    this.createPaymentUseCase = new CreatePaymentUseCase(
      userRepository,
      inscriptionRepository,
      paymentRepository,
      asaasService
    )

    this.processWebhookUseCase = new ProcessPaymentWebhookUseCase(
      paymentRepository,
      inscriptionRepository
    )
  }

  async createPayment(request: NextRequest): Promise<NextResponse> {
    try {
      // Verificar autenticação
      const token = request.headers.get('Authorization')?.replace('Bearer ', '')
      if (!token) {
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
      }

      await adminAuth.verifyIdToken(token)

      const body = await request.json()
      const result = await this.createPaymentUseCase.execute(body)

      return NextResponse.json(result)
    } catch (error) {
      if (error instanceof ApplicationError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        )
      }
      console.error('Erro ao criar pagamento:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }
  }

  async processWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      // Verificar token do webhook
      const webhookToken = request.headers.get('asaas-access-token')
      if (webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      await this.processWebhookUseCase.execute(body)

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      return NextResponse.json(
        { error: 'Erro ao processar webhook' },
        { status: 500 }
      )
    }
  }
}
```

### API Routes

```typescript
// src/app/api/payments/create/route.ts
import { NextRequest } from 'next/server'
import { PaymentController } from '@/presentation/controllers/PaymentController'

const controller = new PaymentController()

export async function POST(request: NextRequest) {
  return controller.createPayment(request)
}

// src/app/api/payments/webhook/route.ts
import { NextRequest } from 'next/server'
import { PaymentController } from '@/presentation/controllers/PaymentController'

const controller = new PaymentController()

export async function POST(request: NextRequest) {
  return controller.processWebhook(request)
}
```

---

## Dependency Injection Container (Opcional)

```typescript
// src/config/container.ts
import { FirebaseUserRepository } from '@/infrastructure/firebase/repositories/FirebaseUserRepository'
import { FirebaseEventRepository } from '@/infrastructure/firebase/repositories/FirebaseEventRepository'
import { FirebaseInscriptionRepository } from '@/infrastructure/firebase/repositories/FirebaseInscriptionRepository'
import { FirebasePaymentRepository } from '@/infrastructure/firebase/repositories/FirebasePaymentRepository'
import { AsaasPaymentService } from '@/infrastructure/asaas/services/AsaasPaymentService'
import { CreateUserUseCase } from '@/application/user/use-cases/CreateUserUseCase'
import { CreateInscriptionUseCase } from '@/application/inscription/use-cases/CreateInscriptionUseCase'
import { CreatePaymentUseCase } from '@/application/payment/use-cases/CreatePaymentUseCase'
import { ProcessPaymentWebhookUseCase } from '@/application/payment/use-cases/ProcessPaymentWebhookUseCase'

class Container {
  // Repositories (Singletons)
  private _userRepository?: FirebaseUserRepository
  private _eventRepository?: FirebaseEventRepository
  private _inscriptionRepository?: FirebaseInscriptionRepository
  private _paymentRepository?: FirebasePaymentRepository
  private _asaasPaymentService?: AsaasPaymentService

  get userRepository(): FirebaseUserRepository {
    if (!this._userRepository) {
      this._userRepository = new FirebaseUserRepository()
    }
    return this._userRepository
  }

  get eventRepository(): FirebaseEventRepository {
    if (!this._eventRepository) {
      this._eventRepository = new FirebaseEventRepository()
    }
    return this._eventRepository
  }

  get inscriptionRepository(): FirebaseInscriptionRepository {
    if (!this._inscriptionRepository) {
      this._inscriptionRepository = new FirebaseInscriptionRepository()
    }
    return this._inscriptionRepository
  }

  get paymentRepository(): FirebasePaymentRepository {
    if (!this._paymentRepository) {
      this._paymentRepository = new FirebasePaymentRepository()
    }
    return this._paymentRepository
  }

  get asaasPaymentService(): AsaasPaymentService {
    if (!this._asaasPaymentService) {
      this._asaasPaymentService = new AsaasPaymentService()
    }
    return this._asaasPaymentService
  }

  // Use Cases (Factory methods)
  createInscriptionUseCase(): CreateInscriptionUseCase {
    return new CreateInscriptionUseCase(
      this.userRepository,
      this.eventRepository,
      this.inscriptionRepository
    )
  }

  createPaymentUseCase(): CreatePaymentUseCase {
    return new CreatePaymentUseCase(
      this.userRepository,
      this.inscriptionRepository,
      this.paymentRepository,
      this.asaasPaymentService
    )
  }

  processPaymentWebhookUseCase(): ProcessPaymentWebhookUseCase {
    return new ProcessPaymentWebhookUseCase(
      this.paymentRepository,
      this.inscriptionRepository
    )
  }
}

export const container = new Container()
```

---

## Variáveis de Ambiente

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

# Asaas Sandbox
ASAAS_API_KEY=
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://www.ieqredencaopa157.com
```

---

## Fases de Implementação

### FASE 1: Estrutura DDD Base
- [ ] Criar estrutura de pastas DDD
- [ ] Implementar classes base (Entity, ValueObject)
- [ ] Criar erros de domínio
- [ ] Configurar Firebase (Client + Admin)

### FASE 2: Domínio de Usuário
- [ ] Implementar entidade User
- [ ] Implementar Value Objects (Email, CPF, Phone)
- [ ] Implementar IUserRepository
- [ ] Implementar FirebaseUserRepository
- [ ] Implementar Use Cases de usuário
- [ ] Criar páginas de auth (login, cadastro)

### FASE 3: Domínio de Evento
- [ ] Implementar entidade Event
- [ ] Implementar Value Objects (EventStatus, PaymentMethods)
- [ ] Implementar IEventRepository
- [ ] Implementar FirebaseEventRepository
- [ ] Implementar Use Cases de evento

### FASE 4: Domínio de Inscrição
- [ ] Implementar entidade Inscription
- [ ] Implementar Value Objects (InscriptionStatus)
- [ ] Implementar IInscriptionRepository
- [ ] Implementar FirebaseInscriptionRepository
- [ ] Implementar CreateInscriptionUseCase

### FASE 5: Domínio de Pagamento + Asaas
- [ ] Implementar entidade Payment
- [ ] Implementar Value Objects (PaymentStatus, PaymentMethod, Money)
- [ ] Implementar IPaymentRepository
- [ ] Implementar FirebasePaymentRepository
- [ ] Implementar AsaasPaymentService
- [ ] Implementar CreatePaymentUseCase
- [ ] Implementar ProcessPaymentWebhookUseCase

### FASE 6: Apresentação
- [ ] Criar Controllers
- [ ] Criar API Routes
- [ ] Criar componentes de UI
- [ ] Criar páginas protegidas (minha-conta)
- [ ] Criar páginas admin

---

## Dependências

```bash
npm install firebase firebase-admin
npm install zod                    # Validação
npm install react-hook-form        # Formulários
npm install sonner                 # Toasts
npm install lucide-react           # Ícones
npm install uuid                   # Geração de IDs
```

---

## Diretrizes de Código

- **SEM comentários desnecessários**: O código deve ser autoexplicativo
- **SEM console.log** para debug: Usar apenas para erros críticos em produção
- **SEM código comentado**: Remover código não utilizado
- **Nomes descritivos**: Variáveis e funções devem ter nomes claros que dispensam comentários

---

## Benefícios da Arquitetura DDD

1. **Separação de Responsabilidades**: Cada camada tem uma responsabilidade clara
2. **Testabilidade**: Use Cases podem ser testados isoladamente com mocks
3. **Manutenibilidade**: Regras de negócio concentradas no domínio
4. **Flexibilidade**: Troca de infraestrutura sem afetar o domínio
5. **Escalabilidade**: Novos recursos podem ser adicionados sem refatoração massiva
6. **Código Limpo**: Value Objects garantem dados sempre válidos
7. **Documentação Viva**: O código expressa o domínio do negócio
