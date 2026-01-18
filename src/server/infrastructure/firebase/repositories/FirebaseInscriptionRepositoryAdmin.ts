import { getAdminFirestore } from '../admin'
import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { IInscriptionRepository, ListInscriptionsParams } from '@/server/domain/inscription/repositories/IInscriptionRepository'
import { InscriptionStatus, PaginatedResult } from '@/server/domain/shared/types'
import { Gender, InscriptionPaymentMethod } from '@/shared/constants'
import { Timestamp } from 'firebase-admin/firestore'

export class FirebaseInscriptionRepositoryAdmin implements IInscriptionRepository {
  private get db() {
    return getAdminFirestore()
  }

  private inscriptionsRef(eventId: string) {
    return this.db.collection('events').doc(eventId).collection('inscriptions')
  }

  private get inscriptionsGroupRef() {
    return this.db.collectionGroup('inscriptions')
  }

  async findById(id: string, eventId?: string): Promise<Inscription | null> {
    if (eventId) {
      const docSnap = await this.inscriptionsRef(eventId).doc(id).get()
      if (!docSnap.exists) return null
      return this.mapToEntity(docSnap, eventId)
    }

    // Query by stored id field instead of __name__ for collectionGroup
    const querySnapshot = await this.inscriptionsGroupRef
      .where('id', '==', id)
      .limit(1)
      .get()

    if (querySnapshot.empty) return null

    const doc = querySnapshot.docs[0]
    const eventIdFromPath = doc.ref.parent.parent?.id
    return this.mapToEntity(doc, eventIdFromPath || '')
  }

  async findByEventId(eventId: string, params?: ListInscriptionsParams): Promise<PaginatedResult<Inscription>> {
    const pageLimit = params?.limit || 50
    const pageOffset = params?.offset || 0

    let baseQuery: FirebaseFirestore.Query = this.inscriptionsRef(eventId)
      .orderBy('criadoEm', 'desc')

    if (params?.status) {
      baseQuery = this.inscriptionsRef(eventId)
        .where('status', '==', params.status)
        .orderBy('criadoEm', 'desc')
    }

    const allDocs = await baseQuery.get()
    const total = allDocs.size

    const paginatedQuery = baseQuery.limit(pageLimit).offset(pageOffset)
    const querySnapshot = await paginatedQuery.get()

    const inscriptions = querySnapshot.docs.map(docSnap => this.mapToEntity(docSnap, eventId))

    return {
      items: inscriptions,
      total,
      limit: pageLimit,
      offset: pageOffset,
    }
  }

  async findByUserId(userId: string, params?: ListInscriptionsParams): Promise<Inscription[]> {
    let query = this.inscriptionsGroupRef
      .where('userId', '==', userId)
      .orderBy('criadoEm', 'desc')

    if (params?.status) {
      query = this.inscriptionsGroupRef
        .where('userId', '==', userId)
        .where('status', '==', params.status)
        .orderBy('criadoEm', 'desc')
    }

    const querySnapshot = await query.get()
    return querySnapshot.docs.map(docSnap => {
      const eventId = docSnap.ref.parent.parent?.id || ''
      return this.mapToEntity(docSnap, eventId)
    })
  }

  async findByCPF(cpf: string): Promise<Inscription[]> {
    const querySnapshot = await this.inscriptionsGroupRef
      .where('guestData.cpf', '==', cpf)
      .orderBy('criadoEm', 'desc')
      .get()

    return querySnapshot.docs.map(docSnap => {
      const eventId = docSnap.ref.parent.parent?.id || ''
      return this.mapToEntity(docSnap, eventId)
    })
  }

  async findByEventIdAndUserId(eventId: string, userId: string): Promise<Inscription | null> {
    const querySnapshot = await this.inscriptionsRef(eventId)
      .where('userId', '==', userId)
      .limit(1)
      .get()

    if (querySnapshot.empty) return null
    return this.mapToEntity(querySnapshot.docs[0], eventId)
  }

  async findByEventIdAndCPF(eventId: string, cpf: string): Promise<Inscription | null> {
    const querySnapshot = await this.inscriptionsRef(eventId)
      .where('guestData.cpf', '==', cpf)
      .limit(1)
      .get()

    if (querySnapshot.empty) return null
    return this.mapToEntity(querySnapshot.docs[0], eventId)
  }

  async countByEventId(eventId: string): Promise<number> {
    const querySnapshot = await this.inscriptionsRef(eventId).get()
    return querySnapshot.size
  }

  async countByEventIdAndStatus(eventId: string, status: InscriptionStatus): Promise<number> {
    const querySnapshot = await this.inscriptionsRef(eventId)
      .where('status', '==', status)
      .get()
    return querySnapshot.size
  }

  async save(inscription: Inscription): Promise<void> {
    const json = inscription.toJSON()
    const docRef = this.inscriptionsRef(json.eventId).doc(inscription.id)
    await docRef.set(this.mapToFirestore(inscription))
  }

  async update(inscription: Inscription): Promise<void> {
    const json = inscription.toJSON()
    const docRef = this.inscriptionsRef(json.eventId).doc(inscription.id)
    await docRef.update(this.mapToFirestore(inscription))
  }

  async delete(id: string, eventId: string): Promise<void> {
    await this.inscriptionsRef(eventId).doc(id).delete()
  }

  private mapToEntity(docSnap: FirebaseFirestore.DocumentSnapshot, eventId: string): Inscription {
    const data = docSnap.data()!
    return Inscription.fromPersistence({
      id: docSnap.id,
      eventId: eventId,
      categoryId: data.categoryId,
      userId: data.userId,
      guestData: data.guestData ? this.mapGuestDataFromFirestore(data.guestData) : undefined,
      valor: data.valor || 0,
      status: data.status as InscriptionStatus,
      paymentId: data.paymentId,
      preferredPaymentMethod: (data.preferredPaymentMethod as InscriptionPaymentMethod) || 'PIX',
      criadoEm: data.criadoEm?.toDate() || new Date(),
      atualizadoEm: data.atualizadoEm?.toDate() || new Date(),
    })
  }

  private mapGuestDataFromFirestore(guestData: {
    nome: string
    email: string
    cpf: string
    telefone: string
    dataNascimento?: Timestamp
    sexo?: Gender
  }) {
    return {
      nome: guestData.nome,
      email: guestData.email,
      cpf: guestData.cpf,
      telefone: guestData.telefone,
      dataNascimento: guestData.dataNascimento?.toDate() || new Date(),
      sexo: guestData.sexo || 'masculino' as Gender,
    }
  }

  private mapToFirestore(inscription: Inscription) {
    const json = inscription.toJSON()
    return {
      id: inscription.id, // Store id for collectionGroup queries
      categoryId: json.categoryId,
      userId: json.userId || null,
      guestData: json.guestData ? this.mapGuestDataToFirestore(json.guestData) : null,
      valor: json.valor,
      preferredPaymentMethod: json.preferredPaymentMethod,
      status: json.status,
      paymentId: json.paymentId || null,
      criadoEm: Timestamp.fromDate(json.criadoEm as Date),
      atualizadoEm: Timestamp.fromDate(json.atualizadoEm as Date),
    }
  }

  private mapGuestDataToFirestore(guestData: {
    nome: string
    email: string
    cpf: string
    telefone: string
    dataNascimento: Date
    sexo: Gender
  }) {
    return {
      nome: guestData.nome,
      email: guestData.email,
      cpf: guestData.cpf,
      telefone: guestData.telefone,
      dataNascimento: Timestamp.fromDate(guestData.dataNascimento),
      sexo: guestData.sexo,
    }
  }
}
