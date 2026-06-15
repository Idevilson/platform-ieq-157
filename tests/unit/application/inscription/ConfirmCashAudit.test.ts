import { describe, it, expect, vi } from 'vitest'

vi.mock('@/server/infrastructure/asaas/AsaasService', () => ({
  asaasService: { cancelPayment: vi.fn().mockResolvedValue({}) },
}))

import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { ConfirmInscriptionManually } from '@/server/application/inscription/ConfirmInscriptionManually'
import { InscriptionPaymentMethod } from '@/shared/constants'

function inscription(method: InscriptionPaymentMethod) {
  return Inscription.create('insc-1', {
    eventId: 'geracao-forte',
    categoryId: 'redencao',
    valor: 12000,
    userId: 'user-1',
    preferredPaymentMethod: method,
  })
}

function deps(insc: Inscription, perk: { id: string } | null = { id: 'perk-1' }) {
  const inscriptionRepository = { findById: vi.fn(async () => insc), save: vi.fn(async () => {}) }
  const eventRepository = { findById: vi.fn(async () => ({})) }
  const paymentRepository = { findByInscriptionId: vi.fn(async () => null) }
  const perkRepository = {
    findPrimaryByEventId: vi.fn(async () => perk),
    allocateToInscription: vi.fn(async () => ({ allocated: true, perkId: 'perk-1', alreadyProcessed: false })),
  }
  const uc = new ConfirmInscriptionManually(
    inscriptionRepository as never, eventRepository as never, paymentRepository as never, perkRepository as never,
  )
  return { uc, perkRepository }
}

describe('ConfirmInscriptionManually — Fase 2 (caixa + brinde + auditoria)', () => {
  it('não-admin (requireCash) confirma CASH, aloca brinde e registra quem confirmou', async () => {
    const insc = inscription('CASH')
    const { uc, perkRepository } = deps(insc)
    await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', confirmedBy: 'u9', confirmedByNome: 'Maria', requireCash: true })
    expect(insc.isConfirmed()).toBe(true)
    expect(insc.temBrinde).toBe(true)
    expect(insc.confirmadoPor).toBe('u9')
    expect(insc.confirmadoPorNome).toBe('Maria')
    expect(perkRepository.allocateToInscription).toHaveBeenCalled()
  })

  it('não-admin não pode confirmar inscrição que não é dinheiro', async () => {
    const insc = inscription('PIX')
    const { uc } = deps(insc)
    await expect(
      uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', confirmedBy: 'u9', requireCash: true }),
    ).rejects.toThrow('dinheiro')
  })

  it('admin (sem requireCash) confirma PIX manualmente também', async () => {
    const insc = inscription('PIX')
    const { uc } = deps(insc)
    await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', confirmedBy: 'admin', confirmedByNome: 'Admin' })
    expect(insc.isConfirmed()).toBe(true)
    expect(insc.confirmadoPorNome).toBe('Admin')
  })

  it('sem perk no evento, confirma e marca brinde indisponível', async () => {
    const insc = inscription('CASH')
    const { uc } = deps(insc, null)
    await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', confirmedBy: 'u9', requireCash: true })
    expect(insc.isConfirmed()).toBe(true)
    expect(insc.temBrinde).toBe(false)
  })
})
