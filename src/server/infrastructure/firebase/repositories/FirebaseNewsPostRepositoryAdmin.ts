import { getAdminFirestore } from '../admin'
import { NewsPost, NewsPostProps } from '@/server/domain/q4news/entities/NewsPost'
import { INewsPostRepository, ListNewsPostsParams, PaginatedNewsResult } from '@/server/domain/q4news/repositories/INewsPostRepository'
import { Timestamp } from 'firebase-admin/firestore'

const COLLECTION = 'q4-news-posts'

export class FirebaseNewsPostRepositoryAdmin implements INewsPostRepository {
  private get db() {
    return getAdminFirestore()
  }

  private get postsRef() {
    return this.db.collection(COLLECTION)
  }

  async findById(id: string): Promise<NewsPost | null> {
    const docSnap = await this.postsRef.doc(id).get()
    if (!docSnap.exists) return null
    return this.mapToEntity(docSnap)
  }

  async findAll(params?: ListNewsPostsParams): Promise<PaginatedNewsResult> {
    const pageLimit = params?.limit || 10
    const pageOffset = params?.offset || 0

    let baseQuery = this.postsRef.orderBy('criadoEm', 'desc')

    if (params?.status) {
      baseQuery = this.postsRef.where('status', '==', params.status).orderBy('criadoEm', 'desc')
    }

    const allDocs = await baseQuery.get()
    const total = allDocs.size

    const paginatedQuery = baseQuery.limit(pageLimit).offset(pageOffset)
    const querySnapshot = await paginatedQuery.get()

    const items: NewsPost[] = querySnapshot.docs.map(docSnap => this.mapToEntity(docSnap))

    return {
      items,
      total,
      limit: pageLimit,
      offset: pageOffset,
    }
  }

  async save(post: NewsPost): Promise<void> {
    const docRef = this.postsRef.doc(post.id)
    const data = this.mapToFirestore(post)
    await docRef.set(data)
  }

  async update(post: NewsPost): Promise<void> {
    const docRef = this.postsRef.doc(post.id)
    const data = this.mapToFirestore(post)
    await docRef.update(data)
  }

  async delete(id: string): Promise<void> {
    await this.postsRef.doc(id).delete()
  }

  private parseDate(value: unknown): Date {
    if (!value) return new Date()
    if (typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate()
    }
    if (typeof value === 'string') return new Date(value)
    if (value instanceof Date) return value
    return new Date()
  }

  private mapToEntity(docSnap: FirebaseFirestore.DocumentSnapshot): NewsPost {
    const data = docSnap.data()!
    const props: NewsPostProps = {
      id: docSnap.id,
      titulo: data.titulo,
      descricao: data.descricao,
      conteudo: data.conteudo,
      youtubeUrl: data.youtubeUrl,
      youtubeVideoId: data.youtubeVideoId,
      thumbnailUrl: data.thumbnailUrl,
      status: data.status,
      autorId: data.autorId,
      autorNome: data.autorNome,
      criadoEm: this.parseDate(data.criadoEm),
      atualizadoEm: this.parseDate(data.atualizadoEm),
      publicadoEm: data.publicadoEm ? this.parseDate(data.publicadoEm) : null,
    }
    return NewsPost.fromPersistence(props)
  }

  private mapToFirestore(post: NewsPost) {
    return {
      titulo: post.titulo,
      descricao: post.descricao,
      conteudo: post.conteudo,
      youtubeUrl: post.youtubeUrl,
      youtubeVideoId: post.youtubeVideoId,
      thumbnailUrl: post.thumbnailUrl,
      status: post.status,
      autorId: post.autorId,
      autorNome: post.autorNome,
      criadoEm: Timestamp.fromDate(post.criadoEm),
      atualizadoEm: Timestamp.fromDate(post.atualizadoEm),
      publicadoEm: post.publicadoEm ? Timestamp.fromDate(post.publicadoEm) : null,
    }
  }
}
