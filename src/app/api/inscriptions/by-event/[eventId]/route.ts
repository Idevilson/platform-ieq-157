import { NextRequest, NextResponse } from 'next/server'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    const inscription = await inscriptionRepository.findByEventIdAndUserId(eventId, userId)

    if (!inscription) {
      return NextResponse.json({ inscription: null })
    }

    return NextResponse.json({ inscription: inscription.toJSON() })
  } catch (error) {
    console.error('Get user inscription by event error:', error)
    return NextResponse.json({ error: 'Erro ao buscar inscrição' }, { status: 500 })
  }
}
