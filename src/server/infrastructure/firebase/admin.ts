// Firebase Admin SDK configuration
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

// Cached instances
let _adminAuth: Auth | null = null
let _adminFirestore: Firestore | null = null
let _initialized = false

function getServiceAccountCredentials() {
  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT

  if (!serviceAccountJson) {
    throw new Error(
      'Missing FIREBASE_ADMIN_SERVICE_ACCOUNT environment variable. Set it with the Firebase service account JSON (raw or base64 encoded).'
    )
  }

  try {
    // Try parsing as raw JSON first
    let parsed
    try {
      parsed = JSON.parse(serviceAccountJson)
    } catch {
      // If raw JSON fails, try base64 decoding
      const decoded = Buffer.from(serviceAccountJson, 'base64').toString('utf-8')
      parsed = JSON.parse(decoded)
    }

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    }
  } catch {
    throw new Error(
      'Invalid FIREBASE_ADMIN_SERVICE_ACCOUNT format. Provide valid JSON or base64 encoded JSON.'
    )
  }
}

function ensureInitialized() {
  if (_initialized) return

  // Initialize app if not already done
  if (getApps().length === 0) {
    const credentials = getServiceAccountCredentials()
    initializeApp({
      credential: cert(credentials),
      projectId: credentials.projectId,
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
