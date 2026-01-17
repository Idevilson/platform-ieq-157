import { getAdminFirestore } from '../admin'
import { User } from '@/server/domain/user/entities/User'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { UserRole } from '@/server/domain/shared/types'
import { Timestamp } from 'firebase-admin/firestore'

const COLLECTION = 'users'

interface UserDocument {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  role: UserRole
  asaasCustomerId?: string
  criadoEm: Timestamp
  atualizadoEm: Timestamp
}

export class FirebaseUserRepositoryAdmin implements IUserRepository {
  private get db() {
    return getAdminFirestore()
  }

  async findById(id: string): Promise<User | null> {
    console.log('[FirebaseUserRepositoryAdmin.findById] Buscando id:', id)
    const docRef = this.db.collection(COLLECTION).doc(id)

    try {
      const docSnap = await docRef.get()
      console.log(
        '[FirebaseUserRepositoryAdmin.findById] Resultado:',
        docSnap.exists ? 'encontrado' : 'nao existe'
      )

      if (!docSnap.exists) {
        return null
      }

      return this.mapDocumentToEntity(docSnap.data() as UserDocument)
    } catch (error) {
      console.error('[FirebaseUserRepositoryAdmin.findById] Erro:', error)
      return null
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const querySnapshot = await this.db
      .collection(COLLECTION)
      .where('email', '==', email.toLowerCase())
      .get()

    if (querySnapshot.empty) {
      return null
    }

    return this.mapDocumentToEntity(querySnapshot.docs[0].data() as UserDocument)
  }

  async findByCPF(cpf: string): Promise<User | null> {
    const cleanCpf = cpf.replace(/\D/g, '')
    const querySnapshot = await this.db
      .collection(COLLECTION)
      .where('cpf', '==', cleanCpf)
      .get()

    if (querySnapshot.empty) {
      return null
    }

    return this.mapDocumentToEntity(querySnapshot.docs[0].data() as UserDocument)
  }

  async save(user: User): Promise<void> {
    console.log('[FirebaseUserRepositoryAdmin.save] Salvando user:', user.id)
    const docRef = this.db.collection(COLLECTION).doc(user.id)
    const data = this.mapEntityToDocument(user)
    await docRef.set(data)
    console.log('[FirebaseUserRepositoryAdmin.save] Documento salvo com sucesso!')
  }

  async update(user: User): Promise<void> {
    const docRef = this.db.collection(COLLECTION).doc(user.id)
    const data = this.mapEntityToDocument(user)
    await docRef.update(data)
  }

  async delete(id: string): Promise<void> {
    const docRef = this.db.collection(COLLECTION).doc(id)
    await docRef.delete()
  }

  private mapDocumentToEntity(doc: UserDocument): User {
    return User.fromPersistence({
      id: doc.id,
      email: doc.email,
      nome: doc.nome,
      telefone: doc.telefone,
      cpf: doc.cpf,
      role: doc.role,
      asaasCustomerId: doc.asaasCustomerId,
      criadoEm: doc.criadoEm.toDate(),
      atualizadoEm: doc.atualizadoEm.toDate(),
    })
  }

  private mapEntityToDocument(user: User): Record<string, unknown> {
    const json = user.toJSON()
    const doc: Record<string, unknown> = {
      id: user.id,
      email: json.email,
      nome: json.nome,
      role: json.role,
      criadoEm: Timestamp.fromDate(user.criadoEm),
      atualizadoEm: Timestamp.fromDate(user.atualizadoEm),
    }

    if (json.telefone) doc.telefone = json.telefone
    if (json.cpf) doc.cpf = json.cpf
    if (json.asaasCustomerId) doc.asaasCustomerId = json.asaasCustomerId

    return doc
  }
}

export const firebaseUserRepositoryAdmin = new FirebaseUserRepositoryAdmin()
