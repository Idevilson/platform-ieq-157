// Firebase Admin SDK configuration
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import serviceAccount from '../../../../portal-ieq-sede-firebase-adminsdk-fbsvc-e5560b6ccd.json'

// Check if app is already initialized to prevent duplicate initialization
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    projectId: serviceAccount.project_id,
  })
}

// Cached instances
let _adminAuth: Auth | null = null
let _adminFirestore: Firestore | null = null

export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth()
  }
  return _adminAuth
}

export function getAdminFirestore(): Firestore {
  if (!_adminFirestore) {
    _adminFirestore = getFirestore()
    _adminFirestore.settings({ ignoreUndefinedProperties: true })
  }
  return _adminFirestore
}

// Lazy-initialized exports for backwards compatibility
export const adminAuth = {
  verifyIdToken: (token: string) => getAdminAuth().verifyIdToken(token),
  getUser: (uid: string) => getAdminAuth().getUser(uid),
  createUser: (properties: Parameters<Auth['createUser']>[0]) => getAdminAuth().createUser(properties),
  updateUser: (uid: string, properties: Parameters<Auth['updateUser']>[1]) => getAdminAuth().updateUser(uid, properties),
  deleteUser: (uid: string) => getAdminAuth().deleteUser(uid),
}

export const adminDb = {
  collection: (path: string) => getAdminFirestore().collection(path),
  doc: (path: string) => getAdminFirestore().doc(path),
}

export function getAdminApp(): App {
  return getApps()[0]
}
