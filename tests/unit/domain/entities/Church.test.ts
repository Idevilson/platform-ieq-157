import { describe, it, expect } from 'vitest'
import { Church } from '@/server/domain/church/entities/Church'

describe('Church Entity', () => {
  describe('create', () => {
    it('cria igreja com defaults corretos', () => {
      const church = Church.create({
        nome: 'SEDE DE REDENÇÃO',
        slug: 'sede-redencao',
        cidade: 'Redenção',
        estado: 'PA',
      })

      expect(church.id).toBe('sede-redencao')
      expect(church.slug).toBe('sede-redencao')
      expect(church.nome).toBe('SEDE DE REDENÇÃO')
      expect(church.ativo).toBe(true)
      expect(church.totalMembros).toBe(0)
      expect(church.criadoEm).toBeInstanceOf(Date)
    })

    it('respeita ativo: false explícito', () => {
      const church = Church.create({ nome: 'X', slug: 'x', ativo: false })
      expect(church.ativo).toBe(false)
    })
  })

  describe('update / deactivate / activate', () => {
    it('atualiza nome e cidade preservando slug', () => {
      const church = Church.create({ nome: 'Antigo', slug: 'antigo' })
      const slugBefore = church.slug

      church.update({ nome: 'Novo', cidade: 'Belém' })

      expect(church.nome).toBe('Novo')
      expect(church.cidade).toBe('Belém')
      expect(church.slug).toBe(slugBefore)
    })

    it('deactivate seta ativo=false e atualiza atualizadoEm', () => {
      const church = Church.create({ nome: 'X', slug: 'x' })
      const before = church.atualizadoEm.getTime()

      // Small delay to ensure timestamp changes
      const now = Date.now()
      while (Date.now() === now) { /* spin */ }

      church.deactivate()
      expect(church.ativo).toBe(false)
      expect(church.atualizadoEm.getTime()).toBeGreaterThanOrEqual(before)
    })

    it('hasMembers retorna true só com totalMembros > 0', () => {
      const church = Church.fromPersistence({
        id: 'x',
        nome: 'X',
        slug: 'x',
        ativo: true,
        totalMembros: 5,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      })
      expect(church.hasMembers()).toBe(true)

      const empty = Church.create({ nome: 'Y', slug: 'y' })
      expect(empty.hasMembers()).toBe(false)
    })
  })

  describe('toJSON / toSummary', () => {
    it('toSummary inclui campos públicos essenciais', () => {
      const church = Church.create({
        nome: 'SEDE',
        slug: 'sede',
        cidade: 'Redenção',
        estado: 'PA',
      })

      const summary = church.toSummary()
      expect(summary).toMatchObject({
        id: 'sede',
        nome: 'SEDE',
        slug: 'sede',
        cidade: 'Redenção',
        estado: 'PA',
        ativo: true,
      })
      expect(summary).not.toHaveProperty('totalMembros')
    })

    it('toJSON inclui totalMembros e timestamps', () => {
      const church = Church.create({ nome: 'X', slug: 'x' })
      const json = church.toJSON()
      expect(json.totalMembros).toBe(0)
      expect(json.criadoEm).toBeInstanceOf(Date)
      expect(json.atualizadoEm).toBeInstanceOf(Date)
    })
  })
})
