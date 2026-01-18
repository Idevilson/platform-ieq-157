import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth, getAdminFirestore } from '@/server/infrastructure/firebase/admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { extractBearerToken, mapUserDocumentToResponse, UserDocument } from '../shared'
import { Gender, GENDERS } from '@/shared/constants'

interface UpdateProfileRequest {
  nome?: string
  cpf?: string
  telefone?: string
  dataNascimento?: string
  sexo?: Gender
}

function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function buildUpdateData(requestBody: UpdateProfileRequest): Record<string, unknown> {
  const updateData: Record<string, unknown> = {
    atualizadoEm: FieldValue.serverTimestamp(),
  }

  if (requestBody.nome !== undefined) {
    updateData.nome = requestBody.nome
  }

  if (requestBody.cpf !== undefined) {
    updateData.cpf = sanitizeDigits(requestBody.cpf)
  }

  if (requestBody.telefone !== undefined) {
    updateData.telefone = sanitizeDigits(requestBody.telefone)
  }

  if (requestBody.dataNascimento !== undefined) {
    updateData.dataNascimento = Timestamp.fromDate(new Date(requestBody.dataNascimento))
  }

  if (requestBody.sexo !== undefined) {
    if (GENDERS.includes(requestBody.sexo)) {
      updateData.sexo = requestBody.sexo
    }
  }

  return updateData
}

export async function PATCH(request: NextRequest) {
  const authorizationHeader = request.headers.get('Authorization')
  const token = extractBearerToken(authorizationHeader)

  if (!token) {
    return NextResponse.json({ error: 'Token nao fornecido' }, { status: 401 })
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token)
    const requestBody = await request.json() as UpdateProfileRequest
    const updateData = buildUpdateData(requestBody)

    const firestore = getAdminFirestore()
    const userReference = firestore.collection('users').doc(decodedToken.uid)

    await userReference.update(updateData)

    const updatedDocument = await userReference.get()
    const userData = updatedDocument.data() as UserDocument
    const user = mapUserDocumentToResponse(updatedDocument.id, userData)

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[PATCH /api/auth/profile]', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
