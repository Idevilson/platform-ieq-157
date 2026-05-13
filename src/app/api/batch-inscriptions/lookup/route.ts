import { NextRequest, NextResponse } from 'next/server'
import { LookupBatchByCPF } from '@/server/application/inscription/LookupBatchByCPF'
import { FirebaseBatchInscriptionRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseBatchInscriptionRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { ValidationError } from '@/server/domain/shared/errors'

const batchRepository = new FirebaseBatchInscriptionRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const lookupBatch = new LookupBatchByCPF(batchRepository, eventRepository)

export async function GET(request: NextRequest) {
  try {
    const cpf = request.nextUrl.searchParams.get('cpf')
    if (!cpf) {
      return NextResponse.json({ error: 'cpf é obrigatório' }, { status: 400 })
    }

    const result = await lookupBatch.execute({ cpf })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 })
    }
    console.error('[Batch Lookup] Erro:', error)
    return NextResponse.json({ error: 'Erro ao consultar lotes' }, { status: 500 })
  }
}
