import { PermissionDef } from '../entities/PermissionDef'

export interface IPermissionRepository {
  list(): Promise<PermissionDef[]>
  findByKey(key: string): Promise<PermissionDef | null>
  upsert(permission: PermissionDef): Promise<void>
  delete(key: string): Promise<void>
}
