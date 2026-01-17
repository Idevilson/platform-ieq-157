import { getAdminFirestore } from '../admin'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository, ListInscriptionsParams } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { InscriptionStatus, PaginatedResult } from '@/server/domain/shared/types'
import { Timestamp } from 'firebase-admin/firestore'

const INSCRIPTIONS_COLLECTION = 'inscriptions'

export class FirebaseInscriptionRepositoryAdmin implements IInscriptionRepository {
  private get db() {
    return getAdminFirestore()
  }

  private get inscriptionsRef() {
    return this.db.collection(INSCRIPTIONS_COLLECTION)
  }

  async findById(id: string): Promise<Inscription | null> {
    const docSnap = await this.inscriptionsRef.doc(id).get()

    if (!docSnap.exists) {
      return null
    }

    return this.mapToEntity(docSnap)
  }

  async findByEventId(eventId: string, params?: ListInscriptionsParams): Promise<PaginatedResult<Inscription>> {
    const pageLimit = params?.limit || 50
    const pageOffset = params?.offset || 0

    let baseQuery = this.inscriptionsRef
      .where('eventId', '==', eventId)
      .orderBy('criadoEm', 'desc')

    if (params?.status) {
      baseQuery = this.inscriptionsRef
        .where('eventId', '==', eventId)
        .where('status', '==', params.status)
        .orderBy('criadoEm', 'desc')
    }

    // Count total
    const allDocs = await baseQuery.get()
    const total = allDocs.size

    // Get paginated results
    const paginatedQuery = baseQuery.limit(pageLimit).offset(pageOffset)
    const querySnapshot = await paginatedQuery.get()

    const inscriptions = querySnapshot.docs.map(docSnap => this.mapToEntity(docSnap))

    return {
      items: inscriptions,
      total,
      limit: pageLimit,
      offset: pageOffset,
    }
  }

  async findByUserId(userId: string, params?: ListInscriptionsParams): Promise<Inscription[]> {
    let query = this.inscriptionsRef
      .where('userId', '==', userId)
      .orderBy('criadoEm', 'desc')

    if (params?.status) {
      query = this.inscriptionsRef
        .where('userId', '==', userId)
        .where('status', '==', params.status)
        .orderBy('criadoEm', 'desc')
    }

    const querySnapshot = await query.get()
    return querySnapshot.docs.map(docSnap => this.mapToEntity(docSnap))
  }

  async findByCPF(cpf: string): Promise<Inscription[]> {
    const querySnapshot = await this.inscriptionsRef
      .where('guestData.cpf', '==', cpf)
      .orderBy('criadoEm', 'desc')
      .get()

    return querySnapshot.docs.map(docSnap => this.mapToEntity(docSnap))
  }

  async findByEventIdAndUserId(eventId: string, userId: string): Promise<Inscription | null> {
    const querySnapshot = await this.inscriptionsRef
      .where('eventId', '==', eventId)
      .where('userId', '==', userId)
      .limit(1)
      .get()

    if (querySnapshot.empty) {
      return null
    }

    return this.mapToEntity(querySnapshot.docs[0])
  }

  async findByEventIdAndCPF(eventId: string, cpf: string): Promise<Inscription | null> {
    const querySnapshot = await this.inscriptionsRef
      .where('eventId', '==', eventId)
      .where('guestData.cpf', '==', cpf)
      .limit(1)
      .get()

    if (querySnapshot.empty) {
      return null
    }

    return this.mapToEntity(querySnapshot.docs[0])
  }

  async countByEventId(eventId: string): Promise<number> {
    const querySnapshot = await this.inscriptionsRef
      .where('eventId', '==', eventId)
      .get()

    return querySnapshot.size
  }

  async countByEventIdAndStatus(eventId: string, status: InscriptionStatus): Promise<number> {
    const querySnapshot = await this.inscriptionsRef
      .where('eventId', '==', eventId)
      .where('status', '==', status)
      .get()

    return querySnapshot.size
  }

  async save(inscription: Inscription): Promise<void> {
    const docRef = this.inscriptionsRef.doc(inscription.id)
    await docRef.set(this.mapToFirestore(inscription))
  }

  async update(inscription: Inscription): Promise<void> {
    const docRef = this.inscriptionsRef.doc(inscription.id)
    await docRef.update(this.mapToFirestore(inscription))
  }

  async delete(id: string): Promise<void> {
    await this.inscriptionsRef.doc(id).delete()
  }

  private mapToEntity(docSnap: FirebaseFirestore.DocumentSnapshot): Inscription {
    const data = docSnap.data()!
    return Inscription.fromPersistence({
      id: docSnap.id,
      eventId: data.eventId,
      categoryId: data.categoryId,
      userId: data.userId,
      guestData: data.guestData ? {
        nome: data.guestData.nome,
        email: data.guestData.email,
        cpf: data.guestData.cpf,
        telefone: data.guestData.telefone,
      } : undefined,
      valor: data.valor || 0,
      status: data.status as InscriptionStatus,
      paymentId: data.paymentId,
      criadoEm: data.criadoEm?.toDate() || new Date(),
      atualizadoEm: data.atualizadoEm?.toDate() || new Date(),
    })
  }

  private mapToFirestore(inscription: Inscription) {
    const json = inscription.toJSON()
    return {
      eventId: json.eventId,
      categoryId: json.categoryId,
      userId: json.userId || null,
      guestData: json.guestData || null,
      valor: json.valor,
      status: json.status,
      paymentId: json.paymentId || null,
      criadoEm: Timestamp.fromDate(json.criadoEm),
      atualizadoEm: Timestamp.fromDate(json.atualizadoEm),
    }
  }
}
