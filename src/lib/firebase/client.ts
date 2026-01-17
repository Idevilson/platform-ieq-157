import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

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
