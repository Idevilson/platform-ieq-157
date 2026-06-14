import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do gateway Asaas (singleton) — usado por RequestInscriptionUpgrade/Cancel.
vi.mock('@/server/infrastructure/asaas/AsaasService', () => ({
  asaasService: {
    findOrCreateCustomer: vi.fn().mockResolvedValue({ id: 'cust-1' }),
    createPayment: vi.fn().mockResolvedValue({ id: 'asaas-adj-1', invoiceUrl: 'https://checkout' }),
    getPixQrCode: vi.fn().mockResolvedValue({ encodedImage: 'qr-base64', payload: 'pix-copia-e-cola' }),
    cancelPayment: vi.fn().mockResolvedValue({}),
  },
}))

import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { EventCategory } from '@/server/domain/event/entities/EventCategory'
import { Payment } from '@/server/domain/payment/entities/Payment'
import { AsaasFeeCalculator } from '@/server/infrastructure/asaas/AsaasFeeCalculator'
import { computeUpgradePreview } from '@/server/application/inscription/computeUpgradePreview'
import { RequestInscriptionUpgrade } from '@/server/application/inscription/RequestInscriptionUpgrade'
import { ConfirmUpgradeCashPayment } from '@/server/application/inscription/ConfirmUpgradeCashPayment'
import { CancelInscriptionUpgrade } from '@/server/application/inscription/CancelInscriptionUpgrade'
import { ProcessAsaasWebhook } from '@/server/application/payment/ProcessAsaasWebhook'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'

const EARLY_BIRD = new Date('2026-06-07T23:59:59-03:00')
const fee = new AsaasFeeCalculator()

function outrasLocalidades() {
  return EventCategory.create('outras-localidades', {
    nome: 'Outras Localidades',
    valor: 25000,
    earlyBirdValor: 20000,
    earlyBirdDeadline: EARLY_BIRD,
  })
}

function confirmedInscription(criadoEm: Date, valorCents: number, categoryId = 'redencao') {
  return Inscription.fromPersistence({
    id: 'insc-1',
    eventId: 'geracao-forte',
    categoryId,
    userId: 'user-1',
    valor: valorCents,
    status: 'confirmado',
    preferredPaymentMethod: 'PIX',
    criadoEm,
    atualizadoEm: criadoEm,
  })
}

// Repositórios em memória (apenas os métodos usados).
function makeRepos(inscription: Inscription) {
  const payments = new Map<string, Payment>()
  const paymentRepository = {
    save: vi.fn(async (p: Payment) => { payments.set(p.id, p) }),
    update: vi.fn(async (p: Payment) => { payments.set(p.id, p) }),
    delete: vi.fn(async (id: string) => { payments.delete(id) }),
    findById: vi.fn(async (id: string) => payments.get(id) ?? null),
    findByAsaasPaymentId: vi.fn(async (asaasId: string) =>
      [...payments.values()].find(p => p.asaasPaymentId === asaasId) ?? null),
  }
  const inscriptionRepository = {
    findById: vi.fn(async () => inscription),
    update: vi.fn(async () => {}),
  }
  const eventRepository = {
    findCategoryById: vi.fn(async () => outrasLocalidades()),
  }
  const userRepository = {
    findById: vi.fn(async () => ({
      toJSON: () => ({ nome: 'Maria', email: 'm@x.com', cpf: '52998224725', telefone: '11999998888' }),
    })),
  }
  return { payments, paymentRepository, inscriptionRepository, eventRepository, userRepository }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('computeUpgradePreview', () => {
  it('respeita o early bird pela DATA da inscrição (antecipado) e taxa só sobre a diferença', () => {
    const insc = confirmedInscription(new Date('2026-06-01T10:00:00-03:00'), 12000)
    const preview = computeUpgradePreview(insc, outrasLocalidades(), 'PIX', fee)
    expect(preview.targetValorCents).toBe(20000) // early bird ativo na data dela
    expect(preview.diferencaBaseCents).toBe(8000)
    expect(preview.taxaCents).toBe(199) // PIX R$1,99 por cima
    expect(preview.totalCents).toBe(8199)
    expect(preview.isDowngrade).toBe(false)
  })

  it('usa preço cheio quando a inscrição é posterior à deadline', () => {
    const insc = confirmedInscription(new Date('2026-06-10T10:00:00-03:00'), 15000)
    const preview = computeUpgradePreview(insc, outrasLocalidades(), 'PIX', fee)
    expect(preview.targetValorCents).toBe(25000)
    expect(preview.diferencaBaseCents).toBe(10000)
  })

  it('marca downgrade quando a nova categoria sai mais barata', () => {
    const insc = confirmedInscription(new Date('2026-06-01T10:00:00-03:00'), 30000)
    const preview = computeUpgradePreview(insc, outrasLocalidades(), 'PIX', fee)
    expect(preview.isDowngrade).toBe(true)
    expect(preview.totalCents).toBe(0)
  })
})

describe('RequestInscriptionUpgrade', () => {
  it('upgrade PIX cria Payment AJUSTE e marca pendingUpgrade sem trocar a categoria', async () => {
    const insc = confirmedInscription(new Date('2026-06-01T10:00:00-03:00'), 12000)
    const r = makeRepos(insc)
    const uc = new RequestInscriptionUpgrade(
      r.paymentRepository as never, r.inscriptionRepository as never,
      r.eventRepository as never, r.userRepository as never, fee,
    )

    const out = await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', newCategoryId: 'outras-localidades', metodo: 'PIX' })

    expect(asaasService.createPayment).toHaveBeenCalledTimes(1)
    const charged = (asaasService.createPayment as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(charged.externalReference).toBe('geracao-forte:adjustment:insc-1')
    expect(charged.billingType).toBe('PIX')
    expect(out.payment?.tipo).toBe('AJUSTE')
    expect(out.payment?.valor).toBe(8199)
    expect(insc.hasPendingUpgrade()).toBe(true)
    expect(insc.categoryId).toBe('redencao') // não troca ainda
    expect(insc.valorCents).toBe(12000)
  })

  it('downgrade troca categoria direto e NÃO cria cobrança', async () => {
    const insc = confirmedInscription(new Date('2026-06-01T10:00:00-03:00'), 30000)
    const r = makeRepos(insc)
    const uc = new RequestInscriptionUpgrade(
      r.paymentRepository as never, r.inscriptionRepository as never,
      r.eventRepository as never, r.userRepository as never, fee,
    )

    const out = await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', newCategoryId: 'outras-localidades', metodo: 'PIX' })

    expect(asaasService.createPayment).not.toHaveBeenCalled()
    expect(out.payment).toBeUndefined()
    expect(insc.categoryId).toBe('outras-localidades')
    expect(insc.hasPendingUpgrade()).toBe(false)
  })

  it('rejeita inscrição não confirmada', async () => {
    const insc = Inscription.fromPersistence({
      id: 'insc-1', eventId: 'geracao-forte', categoryId: 'redencao', userId: 'user-1',
      valor: 12000, status: 'pendente', preferredPaymentMethod: 'PIX',
      criadoEm: new Date('2026-06-01'), atualizadoEm: new Date('2026-06-01'),
    })
    const r = makeRepos(insc)
    const uc = new RequestInscriptionUpgrade(
      r.paymentRepository as never, r.inscriptionRepository as never,
      r.eventRepository as never, r.userRepository as never, fee,
    )
    await expect(uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', newCategoryId: 'outras-localidades', metodo: 'PIX' }))
      .rejects.toThrow('confirmadas')
  })
})

describe('ProcessAsaasWebhook — branch de ajuste', () => {
  function makeWebhook(inscription: Inscription, payments: Map<string, Payment>) {
    const paymentRepository = {
      findByAsaasPaymentId: vi.fn(async (asaasId: string) =>
        [...payments.values()].find(p => p.asaasPaymentId === asaasId) ?? null),
      update: vi.fn(async () => {}),
    }
    const inscriptionRepository = {
      findById: vi.fn(async () => inscription),
      update: vi.fn(async () => {}),
    }
    const perkRepository = { findPrimaryByEventId: vi.fn() }
    const webhook = new ProcessAsaasWebhook(
      paymentRepository as never, inscriptionRepository as never, perkRepository as never,
    )
    return { webhook, perkRepository, inscriptionRepository }
  }

  async function buildPendingUpgrade() {
    const insc = confirmedInscription(new Date('2026-06-01T10:00:00-03:00'), 12000)
    const r = makeRepos(insc)
    const uc = new RequestInscriptionUpgrade(
      r.paymentRepository as never, r.inscriptionRepository as never,
      r.eventRepository as never, r.userRepository as never, fee,
    )
    await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', newCategoryId: 'outras-localidades', metodo: 'PIX' })
    return { insc, payments: r.payments }
  }

  it('confirma o AJUSTE, aplica o upgrade e NÃO realoca brinde', async () => {
    const { insc, payments } = await buildPendingUpgrade()
    const { webhook, perkRepository } = makeWebhook(insc, payments)

    const res = await webhook.execute({
      event: 'PAYMENT_RECEIVED',
      payment: { id: 'asaas-adj-1', externalReference: 'geracao-forte:adjustment:insc-1' } as never,
    })

    expect(res.success).toBe(true)
    expect(insc.categoryId).toBe('outras-localidades')
    expect(insc.valorCents).toBe(20000)
    expect(insc.hasPendingUpgrade()).toBe(false)
    expect(perkRepository.findPrimaryByEventId).not.toHaveBeenCalled()
  })

  it('é idempotente: segunda confirmação não falha nem reverte', async () => {
    const { insc, payments } = await buildPendingUpgrade()
    const { webhook } = makeWebhook(insc, payments)
    const input = {
      event: 'PAYMENT_RECEIVED' as const,
      payment: { id: 'asaas-adj-1', externalReference: 'geracao-forte:adjustment:insc-1' } as never,
    }
    await webhook.execute(input)
    const res2 = await webhook.execute(input)
    expect(res2.success).toBe(true)
    expect(res2.message).toContain('idempotent')
    expect(insc.categoryId).toBe('outras-localidades')
  })
})

describe('ConfirmUpgradeCashPayment / CancelInscriptionUpgrade', () => {
  async function buildCashPending() {
    const insc = confirmedInscription(new Date('2026-06-01T10:00:00-03:00'), 12000)
    const r = makeRepos(insc)
    const uc = new RequestInscriptionUpgrade(
      r.paymentRepository as never, r.inscriptionRepository as never,
      r.eventRepository as never, r.userRepository as never, fee,
    )
    await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', newCategoryId: 'outras-localidades', metodo: 'CASH' })
    return { insc, r }
  }

  it('dinheiro: não chama Asaas e aplica upgrade ao confirmar', async () => {
    const { insc, r } = await buildCashPending()
    expect(asaasService.createPayment).not.toHaveBeenCalled()
    expect(insc.hasPendingUpgrade()).toBe(true)

    const uc = new ConfirmUpgradeCashPayment(r.paymentRepository as never, r.inscriptionRepository as never)
    const out = await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', confirmedBy: 'admin-9' })

    expect(out.newCategoryId).toBe('outras-localidades')
    expect(insc.categoryId).toBe('outras-localidades')
    expect(insc.hasPendingUpgrade()).toBe(false)
  })

  it('cancelar upgrade limpa o pendente e não troca categoria', async () => {
    const insc = confirmedInscription(new Date('2026-06-01T10:00:00-03:00'), 12000)
    const r = makeRepos(insc)
    const req = new RequestInscriptionUpgrade(
      r.paymentRepository as never, r.inscriptionRepository as never,
      r.eventRepository as never, r.userRepository as never, fee,
    )
    await req.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', newCategoryId: 'outras-localidades', metodo: 'PIX' })

    const cancel = new CancelInscriptionUpgrade(r.paymentRepository as never, r.inscriptionRepository as never)
    const out = await cancel.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1' })

    expect(out.success).toBe(true)
    expect(asaasService.cancelPayment).toHaveBeenCalledWith('asaas-adj-1')
    expect(insc.hasPendingUpgrade()).toBe(false)
    expect(insc.categoryId).toBe('redencao')
  })
})
