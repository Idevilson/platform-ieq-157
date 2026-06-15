import { describe, it, expect, vi } from 'vitest'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { BatchInscription } from '@/server/domain/inscription/entities/BatchInscription'
import { DeliverFullKit } from '@/server/application/inscription/DeliverFullKit'
import { ConfigureEventKit } from '@/server/application/event/ConfigureEventKit'

const kitItems = [
  { id: 'led', nome: 'Pulseira LED', condicionalAoBrinde: true },
  { id: 'garrafa', nome: 'Garrafa' },
]

function confirmedInscription(temBrinde: boolean) {
  const insc = Inscription.create('insc-1', { eventId: 'geracao-forte', categoryId: 'redencao', valor: 12000, userId: 'u1' })
  insc.confirm('pay-1')
  if (temBrinde) insc.markBrindeAllocated('perk-1', new Date())
  else insc.markBrindeUnavailable()
  return insc
}

function inscriptionDeps(insc: Inscription, auditLogRepository?: { append: ReturnType<typeof vi.fn> }) {
  const eventRepository = { findById: vi.fn(async () => ({ kitItems })) }
  const inscriptionRepository = { findById: vi.fn(async () => insc), update: vi.fn(async () => {}) }
  const batchRepository = { findById: vi.fn(async () => null) }
  return new DeliverFullKit(eventRepository as never, inscriptionRepository as never, batchRepository as never, auditLogRepository as never)
}

function confirmedBatch(brindes: number, total: number) {
  const participantes = Array.from({ length: total }, (_, i) => ({ nome: `Part ${i + 1}`, sexo: 'masculino' as const }))
  const batch = BatchInscription.create('b1', {
    eventId: 'geracao-forte', categoryId: 'redencao', valorTotalCents: 12000 * total, cidade: 'Cidade',
    responsavel: { nome: 'Responsável', cpf: '00000000000', email: 'r@x.com', telefone: '11999999999', dataNascimento: new Date('1990-01-01'), sexo: 'masculino', cidade: 'Cidade' },
    participantes,
  })
  batch.confirm('pay-batch')
  for (let i = 0; i < brindes; i++) batch.allocateParticipantBrinde(i, 'perk-1')
  return batch
}

function batchDeps(batch: BatchInscription) {
  const eventRepository = { findById: vi.fn(async () => ({ kitItems })) }
  const inscriptionRepository = { findById: vi.fn(async () => null) }
  const batchRepository = { findById: vi.fn(async () => batch), update: vi.fn(async () => {}) }
  return new DeliverFullKit(eventRepository as never, inscriptionRepository as never, batchRepository as never)
}

describe('DeliverFullKit', () => {
  it('entrega o kit completo (com LED) para quem tem brinde, com auditoria', async () => {
    const audit = { append: vi.fn(async () => {}) }
    const insc = confirmedInscription(true)
    const uc = inscriptionDeps(insc, audit)
    const out = await uc.execute({ eventId: 'geracao-forte', target: { kind: 'inscription', inscriptionId: 'insc-1' }, actorUserId: 'u9', actorNome: 'Maria' })
    expect(out.comLed).toBe(true)
    expect(out.kitDeliveries.find((d) => d.itemId === 'led')?.entregue).toBe(true)
    expect(out.kitDeliveries.find((d) => d.itemId === 'garrafa')?.entregue).toBe(true)
    expect(audit.append).toHaveBeenCalledTimes(1)
  })

  it('entrega sem LED quando não tem brinde', async () => {
    const insc = confirmedInscription(false)
    const uc = inscriptionDeps(insc)
    const out = await uc.execute({ eventId: 'geracao-forte', target: { kind: 'inscription', inscriptionId: 'insc-1' }, actorUserId: 'u9' })
    expect(out.comLed).toBe(false)
    expect(out.kitDeliveries.find((d) => d.itemId === 'garrafa')?.entregue).toBe(true)
    expect(out.kitDeliveries.find((d) => d.itemId === 'led')).toBeUndefined()
  })

  it('é idempotente: segunda chamada não erra nem duplica', async () => {
    const insc = confirmedInscription(true)
    const uc = inscriptionDeps(insc)
    await uc.execute({ eventId: 'geracao-forte', target: { kind: 'inscription', inscriptionId: 'insc-1' }, actorUserId: 'u9' })
    const out = await uc.execute({ eventId: 'geracao-forte', target: { kind: 'inscription', inscriptionId: 'insc-1' }, actorUserId: 'u9' })
    expect(out.kitDeliveries.filter((d) => d.entregue).length).toBe(2)
  })

  it('lote: LED só é entregue quando há contemplados', async () => {
    const semBrinde = batchDeps(confirmedBatch(0, 3))
    const out1 = await semBrinde.execute({ eventId: 'geracao-forte', target: { kind: 'batch', batchId: 'b1' }, actorUserId: 'u9' })
    expect(out1.comLed).toBe(false)
    expect(out1.kitDeliveries.find((d) => d.itemId === 'led')).toBeUndefined()

    const comBrinde = batchDeps(confirmedBatch(2, 3))
    const out2 = await comBrinde.execute({ eventId: 'geracao-forte', target: { kind: 'batch', batchId: 'b1' }, actorUserId: 'u9' })
    expect(out2.comLed).toBe(true)
    expect(out2.kitDeliveries.find((d) => d.itemId === 'led')?.entregue).toBe(true)
  })
})

describe('ConfigureEventKit', () => {
  it('gera ids a partir do nome e filtra vazios', async () => {
    let stored: { id: string; nome: string }[] = []
    const event = { get kitItems() { return stored }, setKitItems: (items: { id: string; nome: string }[]) => { stored = items } }
    const eventRepository = { findById: vi.fn(async () => event), update: vi.fn(async () => {}) }
    const uc = new ConfigureEventKit(eventRepository as never)
    const out = await uc.execute({
      eventId: 'geracao-forte',
      items: [{ id: '', nome: 'Pulseira Holográfica' }, { id: '', nome: '  ' }, { id: '', nome: 'Garrafa' }] as never,
    })
    expect(out.kitItems.map((i) => i.id)).toEqual(['pulseira-holografica', 'garrafa'])
  })
})
