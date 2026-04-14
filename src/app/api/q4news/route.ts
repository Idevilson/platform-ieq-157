import { NextRequest, NextResponse } from 'next/server'
import { ListNewsPosts } from '@/server/application/q4news/ListNewsPosts'
import { FirebaseNewsPostRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseNewsPostRepositoryAdmin'

const newsPostRepository = new FirebaseNewsPostRepositoryAdmin()
const listNewsPosts = new ListNewsPosts(newsPostRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = await listNewsPosts.execute({
      status: 'publicado',
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('List news posts error:', error)
    return NextResponse.json(
      { error: 'Erro ao listar noticias' },
      { status: 500 }
    )
  }
}
