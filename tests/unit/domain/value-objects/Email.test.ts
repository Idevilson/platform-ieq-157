
import { describe, it, expect } from 'vitest'
import { Email } from '@/server/domain/shared/value-objects/Email'

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com')
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should normalize email to lowercase', () => {
      const email = Email.create('TEST@EXAMPLE.COM')
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should trim whitespace', () => {
      const email = Email.create('  test@example.com  ')
      expect(email.getValue()).toBe('test@example.com')
    })

    it('should throw error for invalid email', () => {
      expect(() => Email.create('invalid')).toThrow('Email inválido')
      expect(() => Email.create('invalid@')).toThrow('Email inválido')
      expect(() => Email.create('@example.com')).toThrow('Email inválido')
    })

    it('should throw error for empty email', () => {
      expect(() => Email.create('')).toThrow('Email é obrigatório')
    })
  })

  describe('isValid', () => {
    it('should validate correct emails', () => {
      expect(Email.isValid('test@example.com')).toBe(true)
      expect(Email.isValid('user.name@domain.org')).toBe(true)
      expect(Email.isValid('user+tag@example.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(Email.isValid('invalid')).toBe(false)
      expect(Email.isValid('@example.com')).toBe(false)
      expect(Email.isValid('test@')).toBe(false)
    })
  })

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('test@example.com')
      const email2 = Email.create('TEST@EXAMPLE.COM')
      expect(email1.equals(email2)).toBe(true)
    })

    it('should return false for different emails', () => {
      const email1 = Email.create('test@example.com')
      const email2 = Email.create('other@example.com')
      expect(email1.equals(email2)).toBe(false)
    })
  })
})
