import { NextRequest, NextResponse } from 'next/server'
import { UpdateBatchParticipants } from '@/server/application/inscription/UpdateBatchParticipants'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const perkRepository = new FirebaseEventPerkRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const updateBatchParticipants = new UpdateBatchParticipants(batchRepository, eventRepository, perkRepository)

interface RouteParams {
  params: Promise<{ batchId: string }>
}

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    const user = await userRepository.findById(decoded.uid)
    return user?.isAdmin() ?? false
  } catch {
    return false
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await verifyAdmin(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { batchId } = await params
    const body = await request.json()
    const { participantes } = body as { participantes: { nome: string; sexo: string; tamanho?: string }[] }

    if (!Array.isArray(participantes)) {
      return NextResponse.json({ error: 'participantes deve ser um array' }, { status: 400 })
    }

    const result = await updateBatchParticipants.execute({ batchId, participantes: participantes as never })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Update Batch Participants] Erro:', error)
    return NextResponse.json({ error: 'Erro ao atualizar participantes' }, { status: 500 })
  }
}
