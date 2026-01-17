import { getAdminFirestore } from '../admin'
import { Event, EventProps } from '@/server/domain/event/entities/Event'
import { EventCategory } from '@/server/domain/event/entities/EventCategory'
import { IEventRepository, ListEventsParams } from '@/server/domain/event/repositories/IEventRepository'
import { PaginatedResult, EventStatus, PaymentMethod } from '@/server/domain/shared/types'
import { Timestamp } from 'firebase-admin/firestore'

const EVENTS_COLLECTION = 'events'
const CATEGORIES_SUBCOLLECTION = 'categories'

export class FirebaseEventRepositoryAdmin implements IEventRepository {
  private get db() {
    return getAdminFirestore()
  }

  private get eventsRef() {
    return this.db.collection(EVENTS_COLLECTION)
  }

  async findById(id: string): Promise<Event | null> {
    const docSnap = await this.eventsRef.doc(id).get()

    if (!docSnap.exists) {
      return null
    }

    const categories = await this.findCategoriesByEventId(id)
    return this.mapToEntity(docSnap, categories)
  }

  async findAll(params?: ListEventsParams): Promise<PaginatedResult<Event>> {
    const pageLimit = params?.limit || 10
    const pageOffset = params?.offset || 0

    let baseQuery = this.eventsRef.orderBy('criadoEm', 'desc')

    if (params?.status) {
      baseQuery = this.eventsRef.where('status', '==', params.status).orderBy('criadoEm', 'desc')
    }

    // Get all for count (not ideal but Firestore doesn't have count without fetching)
    const allDocs = await baseQuery.get()
    const total = allDocs.size

    // Get paginated results
    const paginatedQuery = baseQuery.limit(pageLimit).offset(pageOffset)
    const querySnapshot = await paginatedQuery.get()

    const events: Event[] = []
    for (const docSnap of querySnapshot.docs) {
      const categories = await this.findCategoriesByEventId(docSnap.id)
      events.push(this.mapToEntity(docSnap, categories))
    }

    return {
      items: events,
      total,
      limit: pageLimit,
      offset: pageOffset,
    }
  }

  async findExpiredOpenEvents(): Promise<Event[]> {
    const now = new Date()
    const querySnapshot = await this.eventsRef.where('status', '==', 'aberto').get()

    const events: Event[] = []
    for (const docSnap of querySnapshot.docs) {
      const categories = await this.findCategoriesByEventId(docSnap.id)
      const event = this.mapToEntity(docSnap, categories)
      const endDate = event.dataFim || event.dataInicio
      if (now > endDate) {
        events.push(event)
      }
    }

    return events
  }

  async save(event: Event): Promise<void> {
    const docRef = this.eventsRef.doc(event.id)
    const data = this.mapToFirestore(event)
    await docRef.set(data)

    // Save categories as subcollection
    for (const category of event.categorias) {
      await this.saveCategory(event.id, category)
    }
  }

  async update(event: Event): Promise<void> {
    const docRef = this.eventsRef.doc(event.id)
    const data = this.mapToFirestore(event)
    await docRef.update(data)
  }

  async delete(id: string): Promise<void> {
    // Delete categories first
    const categoriesSnapshot = await this.eventsRef.doc(id).collection(CATEGORIES_SUBCOLLECTION).get()
    for (const categoryDoc of categoriesSnapshot.docs) {
      await categoryDoc.ref.delete()
    }

    // Delete event
    await this.eventsRef.doc(id).delete()
  }

  // Category operations
  async findCategoryById(eventId: string, categoryId: string): Promise<EventCategory | null> {
    const categorySnap = await this.eventsRef
      .doc(eventId)
      .collection(CATEGORIES_SUBCOLLECTION)
      .doc(categoryId)
      .get()

    if (!categorySnap.exists) {
      return null
    }

    return this.mapCategoryToEntity(categorySnap)
  }

  async findCategoriesByEventId(eventId: string): Promise<EventCategory[]> {
    const querySnapshot = await this.eventsRef
      .doc(eventId)
      .collection(CATEGORIES_SUBCOLLECTION)
      .orderBy('nome')
      .get()

    return querySnapshot.docs.map(docSnap => this.mapCategoryToEntity(docSnap))
  }

  async saveCategory(eventId: string, category: EventCategory): Promise<void> {
    const categoryRef = this.eventsRef
      .doc(eventId)
      .collection(CATEGORIES_SUBCOLLECTION)
      .doc(category.id)

    await categoryRef.set({
      nome: category.nome,
      descricao: category.descricao,
      valor: category.valorCents,
      ordem: category.ordem,
    })
  }

  async deleteCategory(eventId: string, categoryId: string): Promise<void> {
    await this.eventsRef
      .doc(eventId)
      .collection(CATEGORIES_SUBCOLLECTION)
      .doc(categoryId)
      .delete()
  }

  private parseDate(value: unknown): Date {
    if (!value) return new Date()
    // Firebase Timestamp
    if (typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate()
    }
    // ISO string or other string format
    if (typeof value === 'string') {
      return new Date(value)
    }
    // Already a Date
    if (value instanceof Date) {
      return value
    }
    return new Date()
  }

  private mapToEntity(docSnap: FirebaseFirestore.DocumentSnapshot, categories: EventCategory[]): Event {
    const data = docSnap.data()!
    const props: EventProps = {
      id: docSnap.id,
      titulo: data.titulo,
      subtitulo: data.subtitulo,
      descricao: data.descricao,
      descricaoCompleta: data.descricaoCompleta,
      dataInicio: this.parseDate(data.dataInicio),
      dataFim: data.dataFim ? this.parseDate(data.dataFim) : undefined,
      local: data.local,
      endereco: data.endereco || '',
      googleMapsUrl: data.googleMapsUrl,
      whatsappContato: data.whatsappContato,
      status: data.status as EventStatus,
      metodosPagamento: (data.metodosPagamento || []) as PaymentMethod[],
      imagemUrl: data.imagemUrl,
      categorias: categories,
      criadoEm: this.parseDate(data.criadoEm),
      atualizadoEm: this.parseDate(data.atualizadoEm),
    }
    return Event.fromPersistence(props)
  }

  private mapCategoryToEntity(docSnap: FirebaseFirestore.DocumentSnapshot): EventCategory {
    const data = docSnap.data()!
    return EventCategory.fromPersistence({
      id: docSnap.id,
      nome: data.nome,
      valor: data.valor || 0,
      descricao: data.descricao,
      ordem: data.ordem,
    })
  }

  private mapToFirestore(event: Event) {
    return {
      titulo: event.titulo,
      subtitulo: event.subtitulo,
      descricao: event.descricao,
      descricaoCompleta: event.descricaoCompleta,
      dataInicio: Timestamp.fromDate(event.dataInicio),
      dataFim: event.dataFim ? Timestamp.fromDate(event.dataFim) : null,
      local: event.local,
      endereco: event.endereco,
      googleMapsUrl: event.googleMapsUrl,
      whatsappContato: event.whatsappContato,
      status: event.status,
      metodosPagamento: event.metodosPagamento,
      imagemUrl: event.imagemUrl,
      criadoEm: Timestamp.fromDate(event.criadoEm),
      atualizadoEm: Timestamp.fromDate(event.atualizadoEm),
    }
  }
}
