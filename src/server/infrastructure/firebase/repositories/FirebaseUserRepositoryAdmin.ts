import { getAdminFirestore } from '../admin'
import { User } from '@/server/domain/user/entities/User'
import { IUserRepository } from '@/server/domain/user/repositories/IUserRepository'
import { UserRole } from '@/server/domain/shared/types'
import { Gender } from '@/shared/constants'
import { Timestamp } from 'firebase-admin/firestore'

const COLLECTION = 'users'

interface UserDocument {
  id: string
  email: string
  nome: string
  telefone?: string
  cpf?: string
  dataNascimento?: Timestamp
  sexo?: Gender
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
    const docRef = this.db.collection(COLLECTION).doc(id)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return null
    }

    return this.mapDocumentToEntity(docSnap.data() as UserDocument)
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
    const json = user.toJSON()
    const docRef = this.db.collection(COLLECTION).doc(json.id)
    const data = this.mapEntityToDocument(user)
    await docRef.set(data)
  }

  async update(user: User): Promise<void> {
    const json = user.toJSON()
    const docRef = this.db.collection(COLLECTION).doc(json.id)
    const data = this.mapEntityToDocument(user)
    await docRef.update(data)
  }

  async delete(id: string): Promise<void> {
    const docRef = this.db.collection(COLLECTION).doc(id)
    await docRef.delete()
  }

  private mapDocumentToEntity(doc: UserDocument): User {
    return User.restore(
      doc.id,
      doc.email,
      {
        nome: doc.nome,
        telefone: doc.telefone,
        dataNascimento: doc.dataNascimento?.toDate(),
        sexo: doc.sexo,
        role: doc.role,
        criadoEm: doc.criadoEm.toDate(),
        atualizadoEm: doc.atualizadoEm.toDate(),
        asaasCustomerId: doc.asaasCustomerId,
      },
      doc.cpf
    )
  }

  private mapEntityToDocument(user: User): Record<string, unknown> {
    const json = user.toJSON()
    const doc: Record<string, unknown> = {
      id: json.id,
      email: json.email,
      nome: json.nome,
      role: json.role,
      criadoEm: Timestamp.fromDate(json.criadoEm as Date),
      atualizadoEm: Timestamp.fromDate(json.atualizadoEm as Date),
    }

    if (json.telefone) doc.telefone = json.telefone
    if (json.cpf) doc.cpf = json.cpf
    if (json.dataNascimento) doc.dataNascimento = Timestamp.fromDate(json.dataNascimento as Date)
    if (json.sexo) doc.sexo = json.sexo
    if (json.asaasCustomerId) doc.asaasCustomerId = json.asaasCustomerId

    return doc
  }
}

export const firebaseUserRepositoryAdmin = new FirebaseUserRepositoryAdmin()
