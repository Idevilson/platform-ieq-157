
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
import { getFirebaseAuth } from '../config/client'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResult {
  uid: string
  email: string
  displayName: string | null
}

export class FirebaseAuthService {
  private auth = getFirebaseAuth()
  private googleProvider = new GoogleAuthProvider()

  async registerWithEmail(credentials: AuthCredentials): Promise<AuthResult> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    )
    return this.mapFirebaseUser(userCredential.user)
  }

  async loginWithEmail(credentials: AuthCredentials): Promise<AuthResult> {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    )
    return this.mapFirebaseUser(userCredential.user)
  }

  async loginWithGoogle(): Promise<AuthResult> {
    const userCredential = await signInWithPopup(this.auth, this.googleProvider)
    return this.mapFirebaseUser(userCredential.user)
  }

  async logout(): Promise<void> {
    await signOut(this.auth)
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email)
  }

  async getCurrentUser(): Promise<AuthResult | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe()
        if (user) {
          resolve(this.mapFirebaseUser(user))
        } else {
          resolve(null)
        }
      })
    })
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser
    if (!user) return null
    return user.getIdToken()
  }

  onAuthStateChange(callback: (user: AuthResult | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => {
      if (user) {
        callback(this.mapFirebaseUser(user))
      } else {
        callback(null)
      }
    })
  }

  private mapFirebaseUser(user: FirebaseUser): AuthResult {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName,
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService()
