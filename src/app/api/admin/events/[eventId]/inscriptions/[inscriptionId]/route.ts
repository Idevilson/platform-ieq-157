import { NextRequest, NextResponse } from 'next/server'
import { DeleteInscription } from '@/server/application/inscription/DeleteInscription'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebasePaymentRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebasePaymentRepositoryAdmin'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const paymentRepository = new FirebasePaymentRepositoryAdmin()
const perkRepository = new FirebaseEventPerkRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const deleteInscription = new DeleteInscription(inscriptionRepository, paymentRepository, perkRepository)

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.split('Bearer ')[1]
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const user = await userRepository.findById(decoded.uid)
    if (!user || !user.isAdmin()) return null
    return decoded.uid
  } catch {
    return null
  }
}

interface RouteParams {
  params: Promise<{ eventId: string; inscriptionId: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }

  try {
    const { eventId, inscriptionId } = await params
    const result = await deleteInscription.execute({ eventId, inscriptionId })
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Erro ao excluir inscrição'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
