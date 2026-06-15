import { getAdminFirestore } from '../admin'
import { PermissionDef } from '@/server/domain/permission/entities/PermissionDef'
import { IPermissionRepository } from '@/server/domain/permission/repositories/IPermissionRepository'

const COLLECTION = 'permissions'

interface PermissionDocument {
  key: string
  label: string
  description?: string
  system: boolean
}

export class FirebasePermissionRepositoryAdmin implements IPermissionRepository {
  private get ref() {
    return getAdminFirestore().collection(COLLECTION)
  }

  async list(): Promise<PermissionDef[]> {
    const snap = await this.ref.get()
    return snap.docs.map((d) => PermissionDef.fromPersistence(d.data() as PermissionDocument))
  }

  async findByKey(key: string): Promise<PermissionDef | null> {
    const snap = await this.ref.doc(key).get()
    if (!snap.exists) return null
    return PermissionDef.fromPersistence(snap.data() as PermissionDocument)
  }

  async upsert(permission: PermissionDef): Promise<void> {
    const json = permission.toJSON()
    await this.ref.doc(permission.key).set({
      key: json.key,
      label: json.label,
      description: json.description ?? null,
      system: json.system,
    })
  }

  async delete(key: string): Promise<void> {
    await this.ref.doc(key).delete()
  }
}

export const firebasePermissionRepositoryAdmin = new FirebasePermissionRepositoryAdmin()
