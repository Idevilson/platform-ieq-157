import { Timestamp } from 'firebase-admin/firestore'
import { getAdminFirestore } from '../admin'
import { EventPerk } from '@/server/domain/event/entities/EventPerk'
import {
  IEventPerkRepository,
  AllocationResult,
} from '@/server/domain/event/repositories/IEventPerkRepository'

interface PerkDocument {
  id: string
  eventId: string
  nome: string
  descricao: string
  limiteEstoque: number
  quantidadeAlocada: number
  categoriaId?: string | null
  criadoEm: Timestamp
  atualizadoEm: Timestamp
}

export class FirebaseEventPerkRepositoryAdmin implements IEventPerkRepository {
  private get db() {
    return getAdminFirestore()
  }

  private perksRef(eventId: string) {
    return this.db.collection('events').doc(eventId).collection('perks')
  }

  private inscriptionRef(eventId: string, inscriptionId: string) {
    return this.db
      .collection('events')
      .doc(eventId)
      .collection('inscriptions')
      .doc(inscriptionId)
  }

  private allocationsRef(eventId: string, perkId: string) {
    return this.perksRef(eventId).doc(perkId).collection('allocations')
  }

  async save(perk: EventPerk): Promise<void> {
    const json = perk.toJSON()
    await this.perksRef(perk.eventId).doc(perk.id).set({
      id: json.id,
      eventId: json.eventId,
      nome: json.nome,
      descricao: json.descricao,
      limiteEstoque: json.limiteEstoque,
      quantidadeAlocada: json.quantidadeAlocada,
      categoriaId: json.categoriaId ?? null,
      criadoEm: Timestamp.fromDate(json.criadoEm as Date),
      atualizadoEm: Timestamp.fromDate(json.atualizadoEm as Date),
    })
  }

  async findById(eventId: string, perkId: string): Promise<EventPerk | null> {
    const snap = await this.perksRef(eventId).doc(perkId).get()
    if (!snap.exists) return null
    return this.mapToEntity(snap)
  }

  async findByEventId(eventId: string): Promise<EventPerk[]> {
    const snap = await this.perksRef(eventId).orderBy('criadoEm', 'asc').get()
    return snap.docs.map((doc) => this.mapToEntity(doc))
  }

  async findPrimaryByEventId(eventId: string): Promise<EventPerk | null> {
    const snap = await this.perksRef(eventId).orderBy('criadoEm', 'asc').limit(1).get()
    if (snap.empty) return null
    return this.mapToEntity(snap.docs[0])
  }

  async delete(eventId: string, perkId: string): Promise<void> {
    await this.perksRef(eventId).doc(perkId).delete()
  }

  async allocateToInscription(
    eventId: string,
    perkId: string,
    inscriptionId: string,
  ): Promise<AllocationResult> {
    const perkDocRef = this.perksRef(eventId).doc(perkId)
    const inscriptionDocRef = this.inscriptionRef(eventId, inscriptionId)

    return this.db.runTransaction(async (tx) => {
      const [perkSnap, inscriptionSnap] = await Promise.all([
        tx.get(perkDocRef),
        tx.get(inscriptionDocRef),
      ])

      if (!perkSnap.exists) {
        throw new Error(`Perk ${perkId} não encontrado`)
      }
      if (!inscriptionSnap.exists) {
        throw new Error(`Inscription ${inscriptionId} não encontrada`)
      }

      const inscriptionData = inscriptionSnap.data()!
      if (inscriptionData.temBrinde === true || inscriptionData.temBrinde === false) {
        return {
          allocated: inscriptionData.temBrinde === true,
          perkId: inscriptionData.perkId ?? null,
          alreadyProcessed: true,
        }
      }

      const perkData = perkSnap.data() as PerkDocument
      const now = Timestamp.now()

      if (perkData.quantidadeAlocada >= perkData.limiteEstoque) {
        tx.update(inscriptionDocRef, {
          temBrinde: false,
          atualizadoEm: now,
        })
        return { allocated: false, perkId: null, alreadyProcessed: false }
      }

      const allocationDocRef = this.allocationsRef(eventId, perkId).doc(inscriptionId)
      const inscriptionFields = inscriptionSnap.data()!

      let nome = inscriptionFields.guestData?.nome ?? null
      let cpf = inscriptionFields.guestData?.cpf ?? null
      let email = inscriptionFields.guestData?.email ?? null

      if (!nome && inscriptionFields.userId) {
        const userDocRef = this.db.collection('users').doc(inscriptionFields.userId)
        const userSnap = await tx.get(userDocRef)
        if (userSnap.exists) {
          const userData = userSnap.data()!
          nome = userData.nome ?? null
          cpf = userData.cpf ?? null
          email = userData.email ?? null
        }
      }

      tx.update(perkDocRef, {
        quantidadeAlocada: perkData.quantidadeAlocada + 1,
        atualizadoEm: now,
      })
      tx.update(inscriptionDocRef, {
        temBrinde: true,
        perkId,
        brindeAlocadoEm: now,
        atualizadoEm: now,
      })
      tx.set(allocationDocRef, {
        inscriptionId,
        eventId,
        perkId,
        userId: inscriptionFields.userId ?? null,
        nome,
        cpf,
        email,
        alocadoEm: now,
      })

      return { allocated: true, perkId, alreadyProcessed: false }
    })
  }

  private mapToEntity(snap: FirebaseFirestore.DocumentSnapshot): EventPerk {
    const data = snap.data() as PerkDocument
    return EventPerk.fromPersistence({
      id: snap.id,
      eventId: data.eventId,
      nome: data.nome,
      descricao: data.descricao,
      limiteEstoque: data.limiteEstoque,
      quantidadeAlocada: data.quantidadeAlocada,
      categoriaId: data.categoriaId ?? null,
      criadoEm: data.criadoEm.toDate(),
      atualizadoEm: data.atualizadoEm.toDate(),
    })
  }
}

export const firebaseEventPerkRepository = new FirebaseEventPerkRepositoryAdmin()
