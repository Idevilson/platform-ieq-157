import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminFirestore } from '@/server/infrastructure/firebase/admin'
import { extractBearerToken, mapUserDocumentToResponse, UserDocument } from '../shared'

export async function GET(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization')
  const token = extractBearerToken(authorizationHeader)

  if (!token) {
    return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 })
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    const firestore = getAdminFirestore()
    const userDocument = await firestore.collection('users').doc(decodedToken.uid).get()

    if (!userDocument.exists) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    const userData = userDocument.data() as UserDocument
    const user = mapUserDocumentToResponse(userDocument.id, userData)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[GET /api/auth/me]', error)

    // Check for Firestore NOT_FOUND error (database doesn't exist)
    const firestoreError = error as { code?: number; details?: string }
    if (firestoreError.code === 5) {
      console.error('[GET /api/auth/me] Firestore database not found. Create it in Firebase Console.')
      return NextResponse.json({ error: 'Banco de dados nao configurado' }, { status: 503 })
    }

    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
