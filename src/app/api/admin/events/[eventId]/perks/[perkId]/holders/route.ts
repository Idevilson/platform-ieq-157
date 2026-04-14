import { NextRequest, NextResponse } from 'next/server'
import { ListPerkHolders } from '@/server/application/event/ListPerkHolders'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'

const userRepository = new FirebaseUserRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const listPerkHolders = new ListPerkHolders(userRepository, inscriptionRepository)

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    const user = await userRepository.findById(decoded.uid)
    if (!user?.isAdmin()) return null
    return decoded.uid
  } catch {
    return null
  }
}

interface RouteParams {
  params: Promise<{ eventId: string; perkId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  try {
    const { eventId, perkId } = await params
    const result = await listPerkHolders.execute(eventId, perkId)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar holders'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
