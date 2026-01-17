import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { getFirebaseAuth } from './client'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResult {
  uid: string
  email: string
  displayName: string | null
}

function mapFirebaseUser(user: FirebaseUser): AuthResult {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName,
  }
}

export async function registerWithEmail(credentials: AuthCredentials): Promise<AuthResult> {
  const auth = getFirebaseAuth()
  const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password)

  return mapFirebaseUser(userCredential.user)
}

export async function loginWithEmail(credentials: AuthCredentials): Promise<AuthResult> {
  const auth = getFirebaseAuth()
  const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)

  return mapFirebaseUser(userCredential.user)
}

export async function loginWithGoogle(): Promise<AuthResult> {
  const auth = getFirebaseAuth()
  const googleProvider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, googleProvider)

  return mapFirebaseUser(userCredential.user)
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth()
  await signOut(auth)
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth()
  await sendPasswordResetEmail(auth, email)
}

export async function getCurrentUser(): Promise<AuthResult | null> {
  const auth = getFirebaseAuth()

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user ? mapFirebaseUser(user) : null)
    })
  })
}

export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth()
  const user = auth.currentUser

  if (!user) return null

  return user.getIdToken()
}

export function onAuthStateChange(callback: (user: AuthResult | null) => void): () => void {
  const auth = getFirebaseAuth()

  return onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUser(user) : null)
  })
}

// Facade for backward compatibility
export const firebaseAuthService = {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  sendPasswordReset,
  getCurrentUser,
  getIdToken,
  onAuthStateChange,
}
