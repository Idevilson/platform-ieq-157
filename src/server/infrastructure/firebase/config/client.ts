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

console.log('[Firebase Config] projectId:', firebaseConfig.projectId)

function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    console.log('[Firebase] Initializing app...')
    const app = initializeApp(firebaseConfig)
    console.log('[Firebase] App initialized:', app.name)
    return app
  }
  return getApps()[0]
}

let auth: Auth | null = null
let firestore: Firestore | null = null

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}

export function getFirestoreDb(): Firestore {
  if (!firestore) {
    console.log('[Firestore] Getting Firestore instance...')
    const app = getFirebaseApp()
    // Se você criou um banco com nome específico, descomente a linha abaixo:
    // firestore = getFirestore(app, 'NOME_DO_BANCO')
    firestore = getFirestore(app)
    console.log('[Firestore] Instance created for project:', app.options.projectId)
    console.log('[Firestore] Tentando conectar ao servidor...')
  }
  return firestore
}

export { getFirebaseApp }
