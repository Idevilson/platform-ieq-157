
import { describe, it, expect } from 'vitest'
import { CPF } from '@/server/domain/shared/value-objects/CPF'

// Valid CPFs for testing (generated with proper check digits)
const VALID_CPF_1 = '52998224725' // 529.982.247-25
const VALID_CPF_2 = '71428793860' // 714.287.938-60

describe('CPF Value Object', () => {
  describe('create', () => {
    it('should create a valid CPF', () => {
      const cpf = CPF.create('529.982.247-25')
      expect(cpf.getValue()).toBe('52998224725')
    })

    it('should accept CPF without formatting', () => {
      const cpf = CPF.create(VALID_CPF_1)
      expect(cpf.getValue()).toBe(VALID_CPF_1)
    })

    it('should throw error for invalid CPF', () => {
      expect(() => CPF.create('12345678901')).toThrow('CPF inválido')
    })

    it('should throw error for CPF with all same digits', () => {
      expect(() => CPF.create('11111111111')).toThrow('CPF inválido')
      expect(() => CPF.create('00000000000')).toThrow('CPF inválido')
    })

    it('should throw error for empty CPF', () => {
      expect(() => CPF.create('')).toThrow('CPF é obrigatório')
    })

    it('should throw error for CPF with wrong length', () => {
      expect(() => CPF.create('123456789')).toThrow('CPF inválido')
    })
  })

  describe('isValid', () => {
    it('should validate correct CPFs', () => {
      expect(CPF.isValid(VALID_CPF_1)).toBe(true)
      expect(CPF.isValid(VALID_CPF_2)).toBe(true)
    })

    it('should reject invalid CPFs', () => {
      expect(CPF.isValid('12345678901')).toBe(false)
      expect(CPF.isValid('11111111111')).toBe(false)
      expect(CPF.isValid('123')).toBe(false)
    })
  })

  describe('getFormatted', () => {
    it('should format CPF correctly', () => {
      const cpf = CPF.create(VALID_CPF_1)
      expect(cpf.getFormatted()).toBe('529.982.247-25')
    })
  })

  describe('equals', () => {
    it('should return true for equal CPFs', () => {
      const cpf1 = CPF.create(VALID_CPF_1)
      const cpf2 = CPF.create('529.982.247-25')
      expect(cpf1.equals(cpf2)).toBe(true)
    })

    it('should return false for different CPFs', () => {
      const cpf1 = CPF.create(VALID_CPF_1)
      const cpf2 = CPF.create(VALID_CPF_2)
      expect(cpf1.equals(cpf2)).toBe(false)
    })
  })
})
