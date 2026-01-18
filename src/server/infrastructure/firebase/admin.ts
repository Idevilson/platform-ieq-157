// Firebase Admin SDK configuration
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import serviceAccount from '../../../../portal-ieq-sede-firebase-adminsdk-fbsvc-e5560b6ccd.json'

// Cached instances
let _adminAuth: Auth | null = null
let _adminFirestore: Firestore | null = null
let _initialized = false

function ensureInitialized() {
  if (_initialized) return

  // Initialize app if not already done
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount as Parameters<typeof cert>[0]),
      projectId: serviceAccount.project_id,
    })
  }

  // Configure Firestore settings (must be before any operations)
  const db = getFirestore()
  try {
    db.settings({ ignoreUndefinedProperties: true })
  } catch {
    // Settings already configured, ignore
  }
  _adminFirestore = db

  _initialized = true
}

export function getAdminAuth(): Auth {
  ensureInitialized()
  if (!_adminAuth) {
    _adminAuth = getAuth()
  }
  return _adminAuth
}

export function getAdminFirestore(): Firestore {
  ensureInitialized()
  return _adminFirestore!
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
