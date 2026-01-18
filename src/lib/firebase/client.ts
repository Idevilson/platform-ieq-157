import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

function getFirebaseConfig() {
  const configJson = process.env.FIREBASE_CLIENT_CONFIG

  if (!configJson) {
    throw new Error('Missing FIREBASE_CLIENT_CONFIG environment variable')
  }

  try {
    // Try raw JSON first
    try {
      return JSON.parse(configJson)
    } catch {
      // Try base64 decoding
      const decoded = atob(configJson)
      return JSON.parse(decoded)
    }
  } catch {
    throw new Error('Invalid FIREBASE_CLIENT_CONFIG format. Use raw JSON or base64 encoded JSON.')
  }
}

const firebaseConfig = getFirebaseConfig()

let app: FirebaseApp | null = null
let auth: Auth | null = null
let firestore: Firestore | null = null

function isClient(): boolean {
  return typeof window !== 'undefined'
}

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (!isClient()) {
      throw new Error('Firebase client SDK can only be used in browser')
    }
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    if (!isClient()) {
      throw new Error('Firebase Auth can only be used in browser')
    }
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export function getFirestoreDb(): Firestore {
  if (!firestore) {
    if (!isClient()) {
      throw new Error('Firestore can only be used in browser')
    }
    firestore = getFirestore(getFirebaseApp())
  }
  return firestore
}

export { getFirebaseApp }
