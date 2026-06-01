import { getAdminFirestore } from '../admin'
import { Church, ChurchProps } from '@/server/domain/church/entities/Church'
import {
  IChurchRepository,
  ListChurchesParams,
  PaginatedChurchResult,
  ListChurchMembersParams,
  PaginatedChurchMembersResult,
  TransferUserChurchInput,
} from '@/server/domain/church/repositories/IChurchRepository'
import {
  ChurchNotFoundError,
  UserNotFoundError,
} from '@/server/domain/shared/errors'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

const CHURCHES_COLLECTION = 'churches'
const USERS_COLLECTION = 'users'

export class FirebaseChurchRepositoryAdmin implements IChurchRepository {
  private get db() {
    return getAdminFirestore()
  }

  private get churchesRef() {
    return this.db.collection(CHURCHES_COLLECTION)
  }

  private get usersRef() {
    return this.db.collection(USERS_COLLECTION)
  }

  async findById(id: string): Promise<Church | null> {
    const docSnap = await this.churchesRef.doc(id).get()
    if (!docSnap.exists) return null
    return this.mapToEntity(docSnap)
  }

  async findBySlug(slug: string): Promise<Church | null> {
    return this.findById(slug)
  }

  async findAll(params?: ListChurchesParams): Promise<PaginatedChurchResult> {
    const pageLimit = params?.limit ?? 50
    const pageOffset = params?.offset ?? 0

    const baseQuery = params?.ativo === undefined
      ? this.churchesRef.orderBy('nome', 'asc')
      : this.churchesRef.where('ativo', '==', params.ativo).orderBy('nome', 'asc')

    const allDocs = await baseQuery.get()
    const total = allDocs.size

    const paginatedQuery = baseQuery.limit(pageLimit).offset(pageOffset)
    const querySnapshot = await paginatedQuery.get()

    const items = querySnapshot.docs.map((docSnap) => this.mapToEntity(docSnap))

    return { items, total, limit: pageLimit, offset: pageOffset }
  }

  async countMembers(churchId: string): Promise<number> {
    const snap = await this.usersRef.where('churchId', '==', churchId).count().get()
    return snap.data().count
  }

  async listMembers(params: ListChurchMembersParams): Promise<PaginatedChurchMembersResult> {
    const pageLimit = params.limit ?? 50
    const pageOffset = params.offset ?? 0

    const baseQuery = this.usersRef
      .where('churchId', '==', params.churchId)
      .orderBy('nome', 'asc')

    const allDocs = await baseQuery.get()

    let filtered = allDocs.docs
    if (params.search) {
      const needle = params.search.toLowerCase()
      filtered = filtered.filter((d) => {
        const data = d.data()
        const nome = String(data.nome ?? '').toLowerCase()
        const email = String(data.email ?? '').toLowerCase()
        return nome.includes(needle) || email.includes(needle)
      })
    }

    const total = filtered.length
    const page = filtered.slice(pageOffset, pageOffset + pageLimit)

    const items = page.map((d) => {
      const data = d.data()
      return {
        userId: d.id,
        nome: data.nome,
        email: data.email,
        vinculadoEm: data.atualizadoEm?.toDate?.() ?? undefined,
      }
    })

    return { items, total, limit: pageLimit, offset: pageOffset }
  }

  async save(church: Church): Promise<void> {
    const docRef = this.churchesRef.doc(church.id)
    await docRef.set(this.mapToFirestore(church))
  }

  async update(church: Church): Promise<void> {
    const docRef = this.churchesRef.doc(church.id)
    await docRef.update(this.mapToFirestore(church))
  }

  async delete(id: string): Promise<void> {
    await this.churchesRef.doc(id).delete()
  }

  async transferUserChurch(input: TransferUserChurchInput): Promise<void> {
    const { userId, oldChurchId, newChurchId } = input

    if (oldChurchId === newChurchId) return

    await this.db.runTransaction(async (tx) => {
      const userRef = this.usersRef.doc(userId)
      const userSnap = await tx.get(userRef)
      if (!userSnap.exists) {
        throw new UserNotFoundError(userId)
      }

      const currentChurchId = (userSnap.data()?.churchId as string | null | undefined) ?? null

      if (currentChurchId !== oldChurchId) {
        throw new Error(
          `Vínculo desatualizado: igreja atual ${currentChurchId} != esperada ${oldChurchId}`
        )
      }

      const oldChurchRef = oldChurchId ? this.churchesRef.doc(oldChurchId) : null
      const newChurchRef = newChurchId ? this.churchesRef.doc(newChurchId) : null

      if (oldChurchRef) {
        const oldSnap = await tx.get(oldChurchRef)
        if (!oldSnap.exists) throw new ChurchNotFoundError(oldChurchId!)
      }

      if (newChurchRef) {
        const newSnap = await tx.get(newChurchRef)
        if (!newSnap.exists) throw new ChurchNotFoundError(newChurchId!)
      }

      const now = Timestamp.now()

      tx.update(userRef, {
        churchId: newChurchId,
        atualizadoEm: now,
      })

      if (oldChurchRef) {
        tx.update(oldChurchRef, {
          totalMembros: FieldValue.increment(-1),
          atualizadoEm: now,
        })
      }

      if (newChurchRef) {
        tx.update(newChurchRef, {
          totalMembros: FieldValue.increment(1),
          atualizadoEm: now,
        })
      }
    })
  }

  private parseDate(value: unknown): Date {
    if (!value) return new Date()
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate()
    }
    if (typeof value === 'string') return new Date(value)
    if (value instanceof Date) return value
    return new Date()
  }

  private mapToEntity(docSnap: FirebaseFirestore.DocumentSnapshot): Church {
    const data = docSnap.data()!
    const props: ChurchProps = {
      id: docSnap.id,
      nome: data.nome,
      slug: data.slug ?? docSnap.id,
      cidade: data.cidade,
      estado: data.estado,
      ativo: data.ativo ?? true,
      totalMembros: typeof data.totalMembros === 'number' ? data.totalMembros : 0,
      criadoEm: this.parseDate(data.criadoEm),
      atualizadoEm: this.parseDate(data.atualizadoEm),
    }
    return Church.fromPersistence(props)
  }

  private mapToFirestore(church: Church) {
    return {
      nome: church.nome,
      slug: church.slug,
      cidade: church.cidade ?? null,
      estado: church.estado ?? null,
      ativo: church.ativo,
      totalMembros: church.totalMembros,
      criadoEm: Timestamp.fromDate(church.criadoEm),
      atualizadoEm: Timestamp.fromDate(church.atualizadoEm),
    }
  }
}
