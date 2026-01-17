
import { describe, it, expect } from 'vitest'
import { Money } from '@/server/domain/shared/value-objects/Money'

describe('Money Value Object', () => {
  describe('fromCents', () => {
    it('should create Money from cents', () => {
      const money = Money.fromCents(15000)
      expect(money.getCents()).toBe(15000)
      expect(money.getReais()).toBe(150)
    })

    it('should throw error for non-integer cents', () => {
      expect(() => Money.fromCents(100.5)).toThrow('Valor deve ser um número inteiro em centavos')
    })

    it('should throw error for negative cents', () => {
      expect(() => Money.fromCents(-100)).toThrow('Valor não pode ser negativo')
    })
  })

  describe('fromReais', () => {
    it('should create Money from reais', () => {
      const money = Money.fromReais(150.00)
      expect(money.getCents()).toBe(15000)
    })

    it('should handle decimal precision', () => {
      const money = Money.fromReais(150.99)
      expect(money.getCents()).toBe(15099)
    })

    it('should throw error for negative reais', () => {
      expect(() => Money.fromReais(-100)).toThrow('Valor não pode ser negativo')
    })
  })

  describe('getFormatted', () => {
    it('should format as Brazilian currency', () => {
      const money = Money.fromCents(15000)
      // Use toContain to handle different whitespace chars (regular vs non-breaking)
      expect(money.getFormatted()).toContain('R$')
      expect(money.getFormatted()).toContain('150,00')
    })

    it('should format zero', () => {
      const money = Money.zero()
      expect(money.getFormatted()).toContain('R$')
      expect(money.getFormatted()).toContain('0,00')
    })
  })

  describe('arithmetic operations', () => {
    it('should add two Money objects', () => {
      const m1 = Money.fromCents(10000)
      const m2 = Money.fromCents(5000)
      const result = m1.add(m2)
      expect(result.getCents()).toBe(15000)
    })

    it('should subtract two Money objects', () => {
      const m1 = Money.fromCents(15000)
      const m2 = Money.fromCents(5000)
      const result = m1.subtract(m2)
      expect(result.getCents()).toBe(10000)
    })

    it('should throw error for negative subtraction result', () => {
      const m1 = Money.fromCents(5000)
      const m2 = Money.fromCents(10000)
      expect(() => m1.subtract(m2)).toThrow('Resultado não pode ser negativo')
    })

    it('should multiply Money by factor', () => {
      const money = Money.fromCents(10000)
      const result = money.multiply(2)
      expect(result.getCents()).toBe(20000)
    })
  })

  describe('comparisons', () => {
    it('should check if Money is zero', () => {
      expect(Money.zero().isZero()).toBe(true)
      expect(Money.fromCents(100).isZero()).toBe(false)
    })

    it('should compare Money values', () => {
      const m1 = Money.fromCents(15000)
      const m2 = Money.fromCents(10000)
      expect(m1.isGreaterThan(m2)).toBe(true)
      expect(m2.isLessThan(m1)).toBe(true)
    })

    it('should check equality', () => {
      const m1 = Money.fromCents(15000)
      const m2 = Money.fromCents(15000)
      const m3 = Money.fromCents(10000)
      expect(m1.equals(m2)).toBe(true)
      expect(m1.equals(m3)).toBe(false)
    })
  })
})
