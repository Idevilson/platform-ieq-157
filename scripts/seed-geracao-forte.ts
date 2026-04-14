import { Event } from '@/server/domain/event/entities/Event'
import { EventCategory } from '@/server/domain/event/entities/EventCategory'
import { EventPerk } from '@/server/domain/event/entities/EventPerk'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'

const EVENT_ID = 'geracao-forte'
const PERK_ID = 'pulseira-geracao-forte'
const CATEGORY_REDENCAO_ID = 'redencao'
const CATEGORY_OUTRAS_ID = 'outras-localidades'

const EARLY_BIRD_DEADLINE = new Date('2026-05-31T23:59:59-03:00')
const DATA_INICIO = new Date('2026-07-03T19:00:00-03:00')
const DATA_FIM = new Date('2026-07-05T22:00:00-03:00')

async function main() {
  const eventRepository = new FirebaseEventRepositoryAdmin()
  const perkRepository = new FirebaseEventPerkRepositoryAdmin()

  const existing = await eventRepository.findById(EVENT_ID)

  if (existing) {
    console.log(`[seed] Evento ${EVENT_ID} já existe — atualizando categorias e perk`)
  } else {
    console.log(`[seed] Criando evento ${EVENT_ID}`)
    const event = Event.create(EVENT_ID, {
      titulo: 'Congresso Setorizado da Geração Forte',
      subtitulo: 'Follow Me — Marcos 8:34',
      descricao:
        'Se alguém quer vir após mim, negue-se a si mesmo, tome a sua cruz e siga-me. — Marcos 8:34',
      dataInicio: DATA_INICIO,
      dataFim: DATA_FIM,
      local: 'A definir',
      endereco: 'A definir',
      status: 'aberto',
      metodosPagamento: ['PIX', 'CREDIT_CARD'],
    })
    await eventRepository.save(event)
  }

  const redencao = EventCategory.create(CATEGORY_REDENCAO_ID, {
    nome: 'Redenção',
    descricao: 'Para inscritos que residem em Redenção',
    valor: 15000,
    earlyBirdValor: 12000,
    earlyBirdDeadline: EARLY_BIRD_DEADLINE,
    beneficiosInclusos: [],
    ordem: 1,
  })

  const outras = EventCategory.create(CATEGORY_OUTRAS_ID, {
    nome: 'Outras Localidades',
    descricao: 'Para inscritos de fora de Redenção (inclui refeições)',
    valor: 25000,
    earlyBirdValor: 20000,
    earlyBirdDeadline: EARLY_BIRD_DEADLINE,
    beneficiosInclusos: ['Almoço', 'Janta'],
    ordem: 2,
  })

  await eventRepository.saveCategory(EVENT_ID, redencao)
  await eventRepository.saveCategory(EVENT_ID, outras)
  console.log(`[seed] Categorias salvas (Redenção, Outras Localidades)`)

  const existingPerk = await perkRepository.findById(EVENT_ID, PERK_ID)
  if (existingPerk) {
    console.log(`[seed] Perk ${PERK_ID} já existe — preservando quantidadeAlocada`)
  } else {
    const perk = EventPerk.create(PERK_ID, {
      eventId: EVENT_ID,
      nome: 'Pulseira Geração Forte',
      descricao: 'Pulseira colorida exclusiva para os primeiros 500 pagantes confirmados',
      limiteEstoque: 500,
    })
    await perkRepository.save(perk)
    console.log(`[seed] Perk ${PERK_ID} criado com limiteEstoque=500`)
  }

  console.log('[seed] ✓ Seed concluído')
}

main().catch((error) => {
  console.error('[seed] Erro:', error)
  process.exit(1)
})
