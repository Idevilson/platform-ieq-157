import { NextRequest, NextResponse } from 'next/server'
import { ListUserInscriptions } from '@/server/application/inscription/ListUserInscriptions'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { InscriptionStatus, INSCRIPTION_STATUSES } from '@/shared/constants'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()

const listUserInscriptions = new ListUserInscriptions(
  inscriptionRepository,
  eventRepository
)

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticacao nao fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    let userId: string

    try {
      const decodedToken = await adminAuth.verifyIdToken(token)
      userId = decodedToken.uid
    } catch {
      return NextResponse.json(
        { error: 'Token invalido ou expirado' },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')

    let status: InscriptionStatus | undefined
    if (statusParam && INSCRIPTION_STATUSES.includes(statusParam as InscriptionStatus)) {
      status = statusParam as InscriptionStatus
    }

    // Execute use case
    const result = await listUserInscriptions.execute({
      userId,
      status,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('List user inscriptions error:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar inscricoes' },
      { status: 500 }
    )
  }
}
