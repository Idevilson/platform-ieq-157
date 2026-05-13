import { describe, it, expect } from 'vitest'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'

const responsavel = {
  nome: 'João Silva',
  cpf: '52998224725',
  email: 'joao@email.com',
  telefone: '11999998888',
  dataNascimento: new Date('1990-01-01'),
  sexo: 'masculino' as const,
  cidade: 'São Paulo',
}

const participantes = [
  { nome: 'Maria', sexo: 'feminino' as const },
  { nome: 'Pedro', sexo: 'masculino' as const },
]

describe('BatchInscription Entity', () => {
  describe('create', () => {
    it('should create a batch with valid data', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'São Paulo',
        participantes,
      })

      expect(batch.id).toBe('batch-1')
      expect(batch.status).toBe('pendente')
      expect(batch.totalParticipantes).toBe(2)
      expect(batch.valorTotalCents).toBe(30000)
    })

    it('should reject fewer than 2 participants', () => {
      expect(() =>
        BatchInscription.create('batch-1', {
          eventId: 'event-1',
          categoryId: 'cat-1',
          valorTotalCents: 15000,
          responsavel,
          cidade: 'SP',
          participantes: [{ nome: 'Maria', sexo: 'feminino' }],
        }),
      ).toThrow('pelo menos 2 participantes')
    })

    it('should reject more than 50 participants', () => {
      const manyParticipants = Array.from({ length: 51 }, (_, i) => ({
        nome: `Participante ${i + 1}`,
        sexo: 'masculino' as const,
      }))

      expect(() =>
        BatchInscription.create('batch-1', {
          eventId: 'event-1',
          categoryId: 'cat-1',
          valorTotalCents: 0,
          responsavel,
          cidade: 'SP',
          participantes: manyParticipants,
        }),
      ).toThrow('mais de 50 participantes')
    })
  })

  describe('confirm', () => {
    it('should confirm a pending batch', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'SP',
        participantes,
      })

      batch.confirm('asaas-pay-123')
      expect(batch.status).toBe('confirmado')
      expect(batch.paymentId).toBe('asaas-pay-123')
    })

    it('should not confirm an already confirmed batch', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'SP',
        participantes,
      })
      batch.confirm('pay-1')
      expect(() => batch.confirm('pay-2')).toThrow()
    })
  })

  describe('confirmCash', () => {
    it('should confirm with cash using MANUAL- prefix paymentId', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'SP',
        participantes,
      })

      batch.confirmCash('admin-user-id')
      expect(batch.status).toBe('confirmado')
      expect(batch.paymentId).toMatch(/^MANUAL-admin-user-id-/)
    })
  })

  describe('cancel', () => {
    it('should cancel a pending batch', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'SP',
        participantes,
      })
      batch.cancel()
      expect(batch.status).toBe('cancelado')
    })

    it('should not cancel a confirmed batch', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'SP',
        participantes,
      })
      batch.confirm('pay-1')
      expect(() => batch.cancel()).toThrow()
    })
  })

  describe('setPixPaymentData', () => {
    it('should store PIX payment data', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'SP',
        participantes,
      })
      const dueDate = new Date('2026-06-01')
      batch.setPixPaymentData('asaas-id', 'pix-codigo', 'base64-qr', dueDate)

      const json = batch.toJSON()
      expect(json.paymentId).toBe('asaas-id')
      expect(json.pixCopiaECola).toBe('pix-codigo')
      expect(json.pixQrCode).toBe('base64-qr')
      expect(json.paymentStatus).toBe('PENDING')
    })
  })

  describe('brinde allocation', () => {
    it('should allocate brinde to a participant', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'SP',
        participantes,
      })

      batch.allocateParticipantBrinde(0, 'perk-abc')
      expect(batch.participantes[0].temBrinde).toBe(true)
      expect(batch.participantes[0].perkId).toBe('perk-abc')
      expect(batch.participantes[1].temBrinde).toBe(false)
    })

    it('should throw for invalid participant index', () => {
      const batch = BatchInscription.create('batch-1', {
        eventId: 'event-1',
        categoryId: 'cat-1',
        valorTotalCents: 30000,
        responsavel,
        cidade: 'SP',
        participantes,
      })
      expect(() => batch.allocateParticipantBrinde(5, 'perk-x')).toThrow()
    })
  })
})
