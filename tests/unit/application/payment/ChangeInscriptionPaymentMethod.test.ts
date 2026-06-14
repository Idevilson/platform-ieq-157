import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/infrastructure/asaas/AsaasService', () => ({
  asaasService: { cancelPayment: vi.fn().mockResolvedValue({}) },
}))

import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { Payment } from '@/server/domain/payment/entities/Payment'
import { ChangeInscriptionPaymentMethod } from '@/server/application/payment/ChangeInscriptionPaymentMethod'
import { asaasService } from '@/server/infrastructure/asaas/AsaasService'
import { InscriptionPaymentMethod } from '@/shared/constants'

function inscription(method: InscriptionPaymentMethod, status: 'pendente' | 'confirmado') {
  return Inscription.fromPersistence({
    id: 'insc-1',
    eventId: 'geracao-forte',
    categoryId: 'redencao',
    userId: 'user-1',
    valor: 12000,
    status,
    preferredPaymentMethod: method,
    criadoEm: new Date('2026-05-01'),
    atualizadoEm: new Date('2026-05-01'),
  })
}

function makeUseCase(insc: Inscription, existing: Payment | null) {
  const inscriptionRepository = { findById: vi.fn(async () => insc), update: vi.fn(async () => {}) }
  const paymentRepository = {
    findByInscriptionId: vi.fn(async () => existing),
    delete: vi.fn(async () => {}),
  }
  const createPayment = { execute: vi.fn(async () => ({ payment: { id: 'pay-new', metodoPagamento: 'PIX' } })) }
  const uc = new ChangeInscriptionPaymentMethod(
    paymentRepository as never, inscriptionRepository as never, createPayment as never,
  )
  return { uc, inscriptionRepository, paymentRepository, createPayment }
}

beforeEach(() => vi.clearAllMocks())

describe('ChangeInscriptionPaymentMethod', () => {
  it('dinheiro → PIX: troca o método e gera a cobrança', async () => {
    const insc = inscription('CASH', 'pendente')
    const { uc, createPayment } = makeUseCase(insc, null)

    const out = await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', metodo: 'PIX' })

    expect(insc.preferredPaymentMethod).toBe('PIX')
    expect(createPayment.execute).toHaveBeenCalledWith({ eventId: 'geracao-forte', inscriptionId: 'insc-1', metodo: 'PIX' })
    expect(out.payment?.id).toBe('pay-new')
  })

  it('PIX → dinheiro: cancela a cobrança existente e não gera nova', async () => {
    const insc = inscription('PIX', 'pendente')
    const existing = Payment.create('pay-old', {
      inscriptionId: 'insc-1', asaasPaymentId: 'asaas-old', valor: 12199,
      metodoPagamento: 'PIX', dataVencimento: new Date('2026-06-01'),
    })
    const { uc, createPayment, paymentRepository } = makeUseCase(insc, existing)

    const out = await uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', metodo: 'CASH' })

    expect(asaasService.cancelPayment).toHaveBeenCalledWith('asaas-old')
    expect(paymentRepository.delete).toHaveBeenCalled()
    expect(createPayment.execute).not.toHaveBeenCalled()
    expect(insc.preferredPaymentMethod).toBe('CASH')
    expect(out.payment).toBeNull()
  })

  it('rejeita inscrição não pendente', async () => {
    const { uc } = makeUseCase(inscription('CASH', 'confirmado'), null)
    await expect(uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', metodo: 'PIX' }))
      .rejects.toThrow('pendentes')
  })

  it('rejeita quando o método é o mesmo', async () => {
    const { uc } = makeUseCase(inscription('CASH', 'pendente'), null)
    await expect(uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', metodo: 'CASH' }))
      .rejects.toThrow('já é o selecionado')
  })

  it('rejeita troca quando o pagamento existente já está confirmado', async () => {
    const insc = inscription('PIX', 'pendente')
    const existing = Payment.create('pay-old', {
      inscriptionId: 'insc-1', asaasPaymentId: 'asaas-old', valor: 12199,
      metodoPagamento: 'PIX', dataVencimento: new Date('2026-06-01'),
    })
    existing.markAsConfirmed(new Date())
    const { uc } = makeUseCase(insc, existing)
    await expect(uc.execute({ eventId: 'geracao-forte', inscriptionId: 'insc-1', metodo: 'CASH' }))
      .rejects.toThrow('já confirmado')
  })
})
