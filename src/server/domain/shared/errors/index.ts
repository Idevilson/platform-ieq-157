
export class DomainError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
  }
}

// User errors
export class UserNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`Usuário não encontrado: ${identifier}`, 'USER_NOT_FOUND')
    this.name = 'UserNotFoundError'
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`Usuário já cadastrado com este email: ${email}`, 'USER_ALREADY_EXISTS')
    this.name = 'UserAlreadyExistsError'
  }
}

export class CPFAlreadyInUseError extends DomainError {
  constructor() {
    super('CPF já cadastrado por outro usuário', 'CPF_ALREADY_IN_USE')
    this.name = 'CPFAlreadyInUseError'
  }
}

export class IncompleteProfileError extends DomainError {
  constructor() {
    super('Perfil incompleto. CPF é obrigatório para inscrições', 'INCOMPLETE_PROFILE')
    this.name = 'IncompleteProfileError'
  }
}

// Event errors
export class EventNotFoundError extends DomainError {
  constructor(eventId: string) {
    super(`Evento não encontrado: ${eventId}`, 'EVENT_NOT_FOUND')
    this.name = 'EventNotFoundError'
  }
}

export class EventNotOpenError extends DomainError {
  constructor() {
    super('Inscrições não estão abertas para este evento', 'EVENT_NOT_OPEN')
    this.name = 'EventNotOpenError'
  }
}

export class CategoryNotFoundError extends DomainError {
  constructor(categoryId: string) {
    super(`Categoria não encontrada: ${categoryId}`, 'CATEGORY_NOT_FOUND')
    this.name = 'CategoryNotFoundError'
  }
}

// Inscription errors
export class InscriptionNotFoundError extends DomainError {
  constructor(inscriptionId: string) {
    super(`Inscrição não encontrada: ${inscriptionId}`, 'INSCRIPTION_NOT_FOUND')
    this.name = 'InscriptionNotFoundError'
  }
}

export class DuplicateInscriptionError extends DomainError {
  constructor() {
    super('Você já possui uma inscrição neste evento', 'DUPLICATE_INSCRIPTION')
    this.name = 'DuplicateInscriptionError'
  }
}

export class InscriptionAlreadyConfirmedError extends DomainError {
  constructor() {
    super('Esta inscrição já foi confirmada e não pode ser cancelada', 'INSCRIPTION_ALREADY_CONFIRMED')
    this.name = 'InscriptionAlreadyConfirmedError'
  }
}

// Payment errors
export class PaymentNotFoundError extends DomainError {
  constructor(paymentId: string) {
    super(`Pagamento não encontrado: ${paymentId}`, 'PAYMENT_NOT_FOUND')
    this.name = 'PaymentNotFoundError'
  }
}

export class PaymentMethodNotAllowedError extends DomainError {
  constructor(method: string) {
    super(`Método de pagamento não permitido para este evento: ${method}`, 'PAYMENT_METHOD_NOT_ALLOWED')
    this.name = 'PaymentMethodNotAllowedError'
  }
}

export class PaymentAlreadyExistsError extends DomainError {
  constructor() {
    super('Já existe um pagamento pendente para esta inscrição', 'PAYMENT_ALREADY_EXISTS')
    this.name = 'PaymentAlreadyExistsError'
  }
}

export class InvalidWebhookError extends DomainError {
  constructor() {
    super('Webhook inválido ou não autorizado', 'INVALID_WEBHOOK')
    this.name = 'InvalidWebhookError'
  }
}

// Authorization errors
export class UnauthorizedError extends DomainError {
  constructor(message = 'Não autorizado') {
    super(message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Acesso negado') {
    super(message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

// Validation errors
export class ValidationError extends DomainError {
  readonly details?: Record<string, string>

  constructor(message: string, details?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    this.details = details
  }
}
