import { NextRequest, NextResponse } from 'next/server'
import { DeleteBatch } from '@/server/application/inscription/DeleteBatch'
import { UpdateBatchResponsavel } from '@/server/application/inscription/UpdateBatchResponsavel'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseInscriptionRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const inscriptionRepository = new FirebaseInscriptionRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const deleteBatch = new DeleteBatch(batchRepository, inscriptionRepository)
const updateBatchResponsavel = new UpdateBatchResponsavel(batchRepository)

interface RouteParams {
  params: Promise<{ batchId: string }>
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

    const { batchId } = await params
    const batch = await batchRepository.findById(batchId)
    if (!batch) {
      return NextResponse.json({ error: 'Lote não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ batch: batch.toJSON() })
  } catch (error) {
    console.error('[Admin Get Batch] Erro:', error)
    return NextResponse.json({ error: 'Erro ao buscar lote' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { batchId } = await params
    const body = await request.json()
    const { nome, cpf } = body as { nome?: string; cpf?: string }

    await updateBatchResponsavel.execute({ batchId, nome, cpf })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Update Batch Responsavel] Erro:', error)
    return NextResponse.json({ error: 'Erro ao atualizar responsável' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyAdmin(request)
    if (!adminId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const { batchId } = await params
    const result = await deleteBatch.execute({ batchId })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Delete Batch] Erro:', error)
    return NextResponse.json({ error: 'Erro ao excluir lote' }, { status: 500 })
  }
}
