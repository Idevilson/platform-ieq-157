import { NextRequest, NextResponse } from 'next/server'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { AdminBatchListItem } from '@/shared/types/inscription'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()

interface RouteParams {
  params: Promise<{ eventId: string }>
}

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.split('Bearer ')[1])
    const user = await userRepository.findById(decoded.uid)
    return user?.isAdmin() ? decoded.uid : null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { eventId } = await params
    const batches = await batchRepository.findByEventId(eventId)

    const items: AdminBatchListItem[] = batches.map(batch => {
      const json = batch.toJSON()
      return {
        id: batch.id,
        eventId: batch.eventId,
        categoryId: batch.categoryId,
        responsavelNome: batch.responsavel.nome,
        responsavelCpf: batch.responsavel.cpf,
        cidade: batch.cidade,
        totalParticipantes: batch.totalParticipantes,
        valorTotal: batch.breakdown?.valorTotal.getCents() ?? batch.valorTotalCents,
        valorTotalFormatado: batch.breakdown?.valorTotal.getFormatted() ?? batch.valorTotalFormatado,
        status: batch.status,
        preferredPaymentMethod: batch.preferredPaymentMethod,
        paymentId: batch.paymentId,
        paymentStatus: json.paymentStatus,
        confirmadoPorNome: batch.confirmadoPorNome,
        confirmadoEm: batch.confirmadoEm?.toISOString(),
        kitDeliveries: json.kitDeliveries,
        criadoEm: json.criadoEm,
        participantes: json.participantes.map(p => ({ nome: p.nome, sexo: p.sexo, tamanho: p.tamanho ?? undefined, temBrinde: p.temBrinde })),
      }
    })

    return NextResponse.json({ batches: items })
  } catch (error) {
    console.error('[Admin List Batches] Erro:', error)
    return NextResponse.json({ error: 'Erro ao listar lotes' }, { status: 500 })
  }
}
