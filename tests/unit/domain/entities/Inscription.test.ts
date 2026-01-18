
import { describe, it, expect } from 'vitest'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'

describe('Inscription Entity', () => {
  const validUserInscription = {
    eventId: 'event-123',
    categoryId: 'cat-123',
    valor: 15000,
    userId: 'user-123',
  }

  const validGuestInscription = {
    eventId: 'event-123',
    categoryId: 'cat-123',
    valor: 15000,
    guestData: {
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '11999998888',
      cpf: '52998224725',
    },
  }

  describe('create', () => {
    it('should create an inscription for authenticated user', () => {
      const inscription = Inscription.create('insc-123', validUserInscription)
      expect(inscription.id).toBe('insc-123')
      expect(inscription.userId).toBe('user-123')
      expect(inscription.status).toBe('pendente')
      expect(inscription.isGuest()).toBe(false)
    })

    it('should create an inscription for guest', () => {
      const inscription = Inscription.create('insc-123', validGuestInscription)
      expect(inscription.id).toBe('insc-123')
      expect(inscription.userId).toBeUndefined()
      expect(inscription.guestData).toBeDefined()
      expect(inscription.isGuest()).toBe(true)
    })

    it('should throw error when neither userId nor guestData provided', () => {
      expect(() =>
        Inscription.create('insc-123', {
          eventId: 'event-123',
          categoryId: 'cat-123',
          valor: 15000,
        })
      ).toThrow('Inscrição deve ter userId ou guestData')
    })

    it('should throw error when both userId and guestData provided', () => {
      expect(() =>
        Inscription.create('insc-123', {
          ...validUserInscription,
          guestData: validGuestInscription.guestData,
        })
      ).toThrow('Inscrição não pode ter userId e guestData ao mesmo tempo')
    })
  })

  describe('status transitions', () => {
    it('should confirm a pending inscription', () => {
      const inscription = Inscription.create('insc-123', validUserInscription)
      inscription.confirm('payment-123')
      expect(inscription.status).toBe('confirmado')
      expect(inscription.paymentId).toBe('payment-123')
    })

    it('should throw error when confirming non-pending inscription', () => {
      const inscription = Inscription.create('insc-123', validUserInscription)
      inscription.confirm('payment-123')
      expect(() => inscription.confirm('payment-456')).toThrow(
        'Apenas inscrições pendentes podem ser confirmadas'
      )
    })

    it('should cancel a pending inscription', () => {
      const inscription = Inscription.create('insc-123', validUserInscription)
      inscription.cancel()
      expect(inscription.status).toBe('cancelado')
    })

    it('should throw error when cancelling confirmed inscription', () => {
      const inscription = Inscription.create('insc-123', validUserInscription)
      inscription.confirm('payment-123')
      expect(() => inscription.cancel()).toThrow(
        'Inscrição confirmada não pode ser cancelada'
      )
    })
  })

  describe('business logic', () => {
    it('should return correct status flags', () => {
      const inscription = Inscription.create('insc-123', validUserInscription)
      expect(inscription.isPending()).toBe(true)
      expect(inscription.isConfirmed()).toBe(false)
      expect(inscription.canCancel()).toBe(true)
    })

    it('should get CPF from guest data', () => {
      const inscription = Inscription.create('insc-123', validGuestInscription)
      expect(inscription.getCPF()).toBe('52998224725')
    })

    it('should return undefined CPF for user inscription', () => {
      const inscription = Inscription.create('insc-123', validUserInscription)
      expect(inscription.getCPF()).toBeUndefined()
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON', () => {
      const inscription = Inscription.create('insc-123', validUserInscription)
      const json = inscription.toJSON()
      expect(json.id).toBe('insc-123')
      expect(json.status).toBe('pendente')
      // Use toContain to handle different whitespace chars in locale formatting
      expect(json.valorFormatado).toContain('R$')
      expect(json.valorFormatado).toContain('150,00')
    })
  })
})
