import { NextRequest, NextResponse } from 'next/server'
import { CreateEventPerk } from '@/server/application/event/CreateEventPerk'
import { ListEventPerks } from '@/server/application/event/ListEventPerks'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { FirebaseEventPerkRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventPerkRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

const eventRepository = new FirebaseEventRepositoryAdmin()
const perkRepository = new FirebaseEventPerkRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const createEventPerk = new CreateEventPerk(eventRepository, perkRepository)
const listEventPerks = new ListEventPerks(perkRepository)

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
  params: Promise<{ eventId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  try {
    const { eventId } = await params
    const perks = await listEventPerks.execute(eventId)
    return NextResponse.json({ perks }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar brindes'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
  }
  try {
    const { eventId } = await params
    const body = await request.json()
    const perk = await createEventPerk.execute({
      eventId,
      nome: body.nome,
      descricao: body.descricao,
      limiteEstoque: body.limiteEstoque,
      categoriaId: body.categoriaId ?? null,
    })
    return NextResponse.json({ perk }, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Erro ao criar brinde'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
