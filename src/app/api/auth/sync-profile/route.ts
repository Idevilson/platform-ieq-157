import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminFirestore } from '@/server/infrastructure/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import { extractBearerToken, mapUserDocumentToResponse, UserDocument } from '../shared'

interface SyncProfileRequest {
  email: string
  displayName?: string
}

function createNewUserData(userId: string, email: string, displayName: string) {
  return {
    id: userId,
    email: email.toLowerCase(),
    nome: displayName,
    role: 'user',
    criadoEm: FieldValue.serverTimestamp(),
    atualizadoEm: FieldValue.serverTimestamp(),
  }
}

export async function POST(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization')
  const token = extractBearerToken(authorizationHeader)

  if (!token) {
    return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 })
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    const requestBody = await request.json() as SyncProfileRequest

    if (!requestBody.email) {
      return NextResponse.json({ error: 'Email e obrigatorio' }, { status: 400 })
    }

    const firestore = getAdminFirestore()
    const userReference = firestore.collection('users').doc(decodedToken.uid)
    const userDocument = await userReference.get()

    const wasCreated = !userDocument.exists

    if (wasCreated) {
      const newUserData = createNewUserData(
        decodedToken.uid,
        requestBody.email,
        requestBody.displayName ?? ''
      )
      await userReference.set(newUserData)
    }

    const finalDocument = await userReference.get()
    const userData = finalDocument.data() as UserDocument
    const user = mapUserDocumentToResponse(finalDocument.id, userData)

    return NextResponse.json({ user, created: wasCreated })
  } catch (error) {
    console.error('[POST /api/auth/sync-profile]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
