import { NextRequest } from 'next/server'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebasePermissionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePermissionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseAuditLogRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseAuditLogRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ListPermissions, CreatePermission, UpdatePermission, DeletePermission } from '@/server/application/permission/PermissionCatalog'
import { ListUsers, SetUserPermissions } from '@/server/application/user/AdminUserManagement'
import { ListEventTeam } from '@/server/application/user/ListEventTeam'
import { ConfigureEventKit } from '@/server/application/event/ConfigureEventKit'
import { DeliverFullKit } from '@/server/application/inscription/DeliverFullKit'

export const userRepository = new FirebaseUserRepositoryAdmin()
export const permissionRepository = new FirebasePermissionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
export const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
export const auditLogRepository = new FirebaseAuditLogRepositoryAdmin()

export const configureEventKit = new ConfigureEventKit(eventRepository)
export const deliverFullKit = new DeliverFullKit(eventRepository, inscriptionRepository, batchRepository, auditLogRepository, userRepository)

export const listPermissions = new ListPermissions(permissionRepository)
export const createPermission = new CreatePermission(permissionRepository)
export const updatePermission = new UpdatePermission(permissionRepository)
export const deletePermission = new DeletePermission(permissionRepository)
export const listUsers = new ListUsers(userRepository)
export const setUserPermissions = new SetUserPermissions(userRepository)
export const listEventTeam = new ListEventTeam(userRepository)

export async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    const user = await userRepository.findById(decoded.uid)
    return user?.isAdmin() ?? false
  } catch {
    return false
  }
}

export interface Actor {
  uid: string
  nome: string
  isAdmin: boolean
  hasPermission: (key: string, eventId?: string) => boolean
}

export async function resolveActor(request: NextRequest): Promise<Actor | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    const user = await userRepository.findById(decoded.uid)
    if (!user) return null
    return {
      uid: decoded.uid,
      nome: user.toJSON().nome,
      isAdmin: user.isAdmin(),
      hasPermission: (key, eventId) => user.hasPermission(key, eventId),
    }
  } catch {
    return null
  }
}
