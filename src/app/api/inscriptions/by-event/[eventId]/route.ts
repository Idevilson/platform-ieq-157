import { NextRequest, NextResponse } from 'next/server'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()

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

    const byUserId = await inscriptionRepository.findByEventIdAndUserId(eventId, userId)
    if (byUserId) {
      return NextResponse.json({ inscription: byUserId.toJSON() })
    }

    const user = await userRepository.findById(userId)
    const cpf = user?.toJSON().cpf?.replace(/\D/g, '')
    if (!cpf) {
      return NextResponse.json({ inscription: null })
    }

    const byCpf = await inscriptionRepository.findByEventIdAndCPF(eventId, cpf)
    return NextResponse.json({ inscription: byCpf?.toJSON() ?? null })
  } catch (error) {
    console.error('Get user inscription by event error:', error)
    return NextResponse.json({ error: 'Erro ao buscar inscrição' }, { status: 500 })
  }
}
