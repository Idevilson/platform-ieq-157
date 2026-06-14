import { describe, it, expect } from 'vitest'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { PendingUpgrade } from '@/server/domain/inscription/value-objects/PendingUpgrade'
import { Payment } from '@/server/domain/payment/entities/Payment'

function confirmedInscription() {
  const insc = Inscription.create('insc-1', {
    eventId: 'geracao-forte',
    categoryId: 'redencao',
    valor: 12000,
    userId: 'user-1',
  })
  insc.confirm('pay-original')
  return insc
}

function upgradeTo(categoryId: string, targetValorCents: number, diferencaBaseCents: number) {
  return PendingUpgrade.create({
    targetCategoryId: categoryId,
    targetValorCents,
    diferencaBaseCents,
    adjustmentPaymentId: 'pay-adjust',
    metodo: 'PIX',
    criadoEm: new Date('2026-06-14T12:00:00Z'),
  })
}

describe('PendingUpgrade VO', () => {
  it('exige diferencaBaseCents > 0', () => {
    expect(() => upgradeTo('outras-localidades', 20000, 0)).toThrow('diferencaBaseCents')
    expect(() => upgradeTo('outras-localidades', 20000, -1)).toThrow('diferencaBaseCents')
  })

  it('exige targetCategoryId e adjustmentPaymentId', () => {
    expect(() => upgradeTo('', 20000, 8000)).toThrow('targetCategoryId')
  })

  it('serializa criadoEm como ISO', () => {
    const u = upgradeTo('outras-localidades', 20000, 8000)
    expect(u.toJSON().criadoEm).toBe('2026-06-14T12:00:00.000Z')
  })
})

describe('Inscription — upgrade de categoria', () => {
  it('requestUpgrade exige inscrição confirmada', () => {
    const pendente = Inscription.create('insc-2', {
      eventId: 'geracao-forte',
      categoryId: 'redencao',
      valor: 12000,
      userId: 'user-2',
    })
    expect(() => pendente.requestUpgrade(upgradeTo('outras-localidades', 20000, 8000))).toThrow(
      'confirmadas',
    )
  })

  it('requestUpgrade rejeita categoria igual à atual', () => {
    const insc = confirmedInscription()
    expect(() => insc.requestUpgrade(upgradeTo('redencao', 15000, 3000))).toThrow('diferente')
  })

  it('requestUpgrade marca pendingUpgrade sem trocar a categoria', () => {
    const insc = confirmedInscription()
    insc.requestUpgrade(upgradeTo('outras-localidades', 20000, 8000))
    expect(insc.hasPendingUpgrade()).toBe(true)
    expect(insc.categoryId).toBe('redencao')
    expect(insc.valorCents).toBe(12000)
  })

  it('applyUpgrade troca categoria/valor e limpa o pendente', () => {
    const insc = confirmedInscription()
    insc.requestUpgrade(upgradeTo('outras-localidades', 20000, 8000))
    insc.applyUpgrade()
    expect(insc.categoryId).toBe('outras-localidades')
    expect(insc.valorCents).toBe(20000)
    expect(insc.hasPendingUpgrade()).toBe(false)
  })

  it('applyUpgrade sem pendente lança erro', () => {
    const insc = confirmedInscription()
    expect(() => insc.applyUpgrade()).toThrow('upgrade pendente')
  })

  it('cancelUpgrade limpa o pendente sem trocar a categoria', () => {
    const insc = confirmedInscription()
    insc.requestUpgrade(upgradeTo('outras-localidades', 20000, 8000))
    insc.cancelUpgrade()
    expect(insc.hasPendingUpgrade()).toBe(false)
    expect(insc.categoryId).toBe('redencao')
    expect(insc.valorCents).toBe(12000)
  })

  it('toJSON expõe pendingUpgrade', () => {
    const insc = confirmedInscription()
    insc.requestUpgrade(upgradeTo('outras-localidades', 20000, 8000))
    const json = insc.toJSON()
    expect(json.pendingUpgrade?.targetCategoryId).toBe('outras-localidades')
    expect(json.pendingUpgrade?.diferencaBaseCents).toBe(8000)
  })
})

describe('Payment.tipo', () => {
  const base = {
    inscriptionId: 'insc-1',
    asaasPaymentId: 'asaas-1',
    valor: 8199,
    metodoPagamento: 'PIX' as const,
    dataVencimento: new Date('2026-06-17T00:00:00Z'),
  }

  it('default é INSCRICAO', () => {
    const p = Payment.create('p1', base)
    expect(p.tipo).toBe('INSCRICAO')
    expect(p.toJSON().tipo).toBe('INSCRICAO')
  })

  it('aceita AJUSTE explícito', () => {
    const p = Payment.create('p2', { ...base, tipo: 'AJUSTE' })
    expect(p.tipo).toBe('AJUSTE')
    expect(p.toJSON().tipo).toBe('AJUSTE')
  })

  it('fromPersistence sem tipo assume INSCRICAO (legado)', () => {
    const p = Payment.fromPersistence({
      ...base,
      id: 'p3',
      status: 'CONFIRMED',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    })
    expect(p.tipo).toBe('INSCRICAO')
  })
})
