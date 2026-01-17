// Client-side user repository using Firebase Client SDK
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from './client'
import { UserDTO } from '@/shared/types'
import { UserRole } from '@/shared/constants'

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

function isClient(): boolean {
  return typeof window !== 'undefined'
}

function isProfileComplete(user: UserDocument): boolean {
  return !!(user.nome && user.cpf && user.telefone)
}

function formatCPF(cpf?: string): string | undefined {
  if (!cpf) return undefined
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`
}

function mapDocumentToDTO(data: UserDocument): UserDTO {
  return {
    id: data.id,
    email: data.email,
    nome: data.nome,
    telefone: data.telefone,
    cpf: data.cpf,
    cpfFormatado: formatCPF(data.cpf),
    role: data.role,
    asaasCustomerId: data.asaasCustomerId,
    isProfileComplete: isProfileComplete(data),
    criadoEm: data.criadoEm?.toDate?.()?.toISOString() || new Date().toISOString(),
    atualizadoEm: data.atualizadoEm?.toDate?.()?.toISOString() || new Date().toISOString(),
  }
}

export const userRepository = {
  async findById(id: string): Promise<UserDTO | null> {
    // Only run on client
    if (!isClient()) {
      return null
    }

    try {
      const db = getFirestoreDb()
      const docRef = doc(db, COLLECTION, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return mapDocumentToDTO(docSnap.data() as UserDocument)
    } catch (error) {
      console.error('[userRepository.findById] Error:', error)
      return null
    }
  },

  async create(data: {
    id: string
    email: string
    nome: string
  }): Promise<UserDTO> {
    // Only run on client
    if (!isClient()) {
      throw new Error('Cannot create user on server side')
    }

    const db = getFirestoreDb()
    const docRef = doc(db, COLLECTION, data.id)
    const now = Timestamp.now()

    const userData: UserDocument = {
      id: data.id,
      email: data.email.toLowerCase(),
      nome: data.nome,
      role: 'user',
      criadoEm: now,
      atualizadoEm: now,
    }

    await setDoc(docRef, userData)
    return mapDocumentToDTO(userData)
  },

  async update(
    id: string,
    data: { nome?: string; cpf?: string; telefone?: string }
  ): Promise<UserDTO | null> {
    // Only run on client
    if (!isClient()) {
      throw new Error('Cannot update user on server side')
    }

    const db = getFirestoreDb()
    const docRef = doc(db, COLLECTION, id)

    const updateData: Record<string, unknown> = {
      atualizadoEm: Timestamp.now(),
    }

    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.cpf !== undefined) updateData.cpf = data.cpf.replace(/\D/g, '')
    if (data.telefone !== undefined) updateData.telefone = data.telefone.replace(/\D/g, '')

    await updateDoc(docRef, updateData)

    // Return updated user
    return this.findById(id)
  },

  async findOrCreate(data: {
    id: string
    email: string
    nome: string
  }): Promise<{ user: UserDTO; created: boolean }> {
    // Only run on client
    if (!isClient()) {
      throw new Error('Cannot access Firestore on server side')
    }

    const existing = await this.findById(data.id)
    if (existing) {
      return { user: existing, created: false }
    }

    const user = await this.create(data)
    return { user, created: true }
  },
}
