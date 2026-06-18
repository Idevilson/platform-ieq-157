import { describe, it, expect } from 'vitest'
import { normalizeCity, compareNormalizedCity, CANONICAL_CITIES } from '@/shared/utils/cityNormalizer'

describe('normalizeCity', () => {
  describe('Redenção', () => {
    it.each([
      'Redenção',
      'REDENÇÃO',
      'REDENCAO',
      'redencao',
      'Redenção PA',
      'Redenção-PA',
      'Redenção-Pa',
      'Redenção Pará',
      'Redenção do Pará',
      'Redenção / Pará',
      'Redenção-Pará',
      'Redenção-pá',
    ])('mapeia "%s" para Redenção', (raw) => {
      expect(normalizeCity(raw).canonical).toBe('Redenção')
      expect(normalizeCity(raw).bucket).toBe('Redenção')
    })
  })

  describe('Parauapebas', () => {
    it.each([
      'Parauapebas',
      'PARAUAPEBAS',
      'Paraupebas',
      'Parauapebas - PA',
      'Parauapebas-PA',
      'Parauapebas/PA',
      'Parauapebas- PA',
      'Parauapebas Pará',
      'Parauapebas-para',
      'Parauapebas região 1010',
    ])('mapeia "%s" para Parauapebas', (raw) => {
      expect(normalizeCity(raw).canonical).toBe('Parauapebas')
    })
  })

  describe('Marabá', () => {
    it.each(['Marabá', 'Maraba', 'Marabá pa'])('mapeia "%s" para Marabá', (raw) => {
      expect(normalizeCity(raw).canonical).toBe('Marabá')
    })
  })

  describe('Conceição do Araguaia', () => {
    it.each([
      'Conceição do Araguaia',
      'CONCEIÇÃO DO ARAGUAIA',
      'Conceição do araguaia',
      'Conceição do Araguaia - PA',
      'Conceição do Araguaia-Pá',
      'Conceição do araguaia para',
      'conceição do Araguaia',
    ])('mapeia "%s" para Conceição do Araguaia', (raw) => {
      expect(normalizeCity(raw).canonical).toBe('Conceição do Araguaia')
    })
  })

  describe('Novo Repartimento', () => {
    it.each([
      'Novo Repartimento',
      'Novo repartimento',
      'Nova Repartimento',
      'Novo Repartimento PA',
    ])('mapeia "%s" para Novo Repartimento', (raw) => {
      expect(normalizeCity(raw).canonical).toBe('Novo Repartimento')
    })
  })

  describe("Pau D'arco", () => {
    it.each(["Pau D'arco", "Pau D' arco", "Pau D'arco Pá"])('mapeia "%s" para Pau D\'arco', (raw) => {
      expect(normalizeCity(raw).canonical).toBe("Pau D'arco")
    })
  })

  describe('Cidades fora da lista canônica', () => {
    it('mantém "Floresta do Araguaia" no bucket Outras com titleCase', () => {
      const result = normalizeCity('floresta do araguaia')
      expect(result.bucket).toBe('Outras')
      expect(result.canonical).toBe('Floresta do Araguaia')
    })

    it('mantém "Anápolis" como Outras', () => {
      const result = normalizeCity('Anápolis')
      expect(result.bucket).toBe('Outras')
      expect(result.canonical).toBe('Anápolis')
    })
  })

  describe('Lixo e nulls', () => {
    it.each([null, undefined, '', '   ', '6035', '16', 'Para'])(
      'trata "%s" como Sem cidade',
      (raw) => {
        const result = normalizeCity(raw)
        expect(result.bucket).toBe('Sem cidade')
        expect(result.canonical).toBe('Sem cidade')
      },
    )
  })
})

describe('compareNormalizedCity', () => {
  it('coloca Redenção primeiro', () => {
    const cities = [normalizeCity('Parauapebas'), normalizeCity('Redenção'), normalizeCity('Marabá')]
    const sorted = [...cities].sort(compareNormalizedCity)
    expect(sorted[0].canonical).toBe('Redenção')
  })

  it('ordena canônicas alfabeticamente depois de Redenção', () => {
    const cities = CANONICAL_CITIES.map((c) => normalizeCity(c))
    const sorted = [...cities].sort(compareNormalizedCity)
    expect(sorted[0].canonical).toBe('Redenção')
    expect(sorted.slice(1).map((c) => c.canonical)).toEqual([
      'Conceição do Araguaia',
      'Marabá',
      'Novo Repartimento',
      'Parauapebas',
      "Pau D'arco",
      'Rio Maria',
      'Santana do Araguaia',
      'Xinguara',
    ])
  })

  it('coloca Outras antes de Sem cidade', () => {
    const cities = [
      normalizeCity(null),
      normalizeCity('Floresta do Araguaia'),
      normalizeCity('Redenção'),
    ]
    const sorted = [...cities].sort(compareNormalizedCity)
    expect(sorted.map((c) => c.bucket)).toEqual(['Redenção', 'Outras', 'Sem cidade'])
  })
})
