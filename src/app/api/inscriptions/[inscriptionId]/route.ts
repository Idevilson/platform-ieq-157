import { NextRequest, NextResponse } from 'next/server'
import { GetInscriptionById } from '@/server/application/inscription/GetInscriptionById'
import { CancelInscription } from '@/server/application/inscription/CancelInscription'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { InscriptionNotFoundError, ValidationError } from '@/server/domain/shared/errors'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()

const getInscriptionById = new GetInscriptionById(inscriptionRepository)
const cancelInscription = new CancelInscription(inscriptionRepository)

interface RouteParams {
  params: Promise<{ inscriptionId: string }>
}

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken.uid
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { inscriptionId } = await params
    const userId = await getUserIdFromRequest(request)

    const result = await getInscriptionById.execute({
      inscriptionId,
      userId: userId || undefined,
      allowGuest: !userId, // Allow guest access if no auth
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get inscription error:', error)

    if (error instanceof InscriptionNotFoundError) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao buscar inscrição' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { inscriptionId } = await params
    const userId = await getUserIdFromRequest(request)

    const result = await cancelInscription.execute({
      inscriptionId,
      userId: userId || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Cancel inscription error:', error)

    if (error instanceof InscriptionNotFoundError) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao cancelar inscrição' },
      { status: 500 }
    )
  }
}
