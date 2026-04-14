import { NextRequest, NextResponse } from 'next/server'
import { GetNewsPostById } from '@/server/application/q4news/GetNewsPostById'
import { FirebaseNewsPostRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseNewsPostRepositoryAdmin'
import { NewsNotFoundError } from '@/server/domain/shared/errors'

const newsPostRepository = new FirebaseNewsPostRepositoryAdmin()
const getNewsPostById = new GetNewsPostById(newsPostRepository)

interface RouteParams {
  params: Promise<{ newsId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { newsId } = await params
    const result = await getNewsPostById.execute({ newsId })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof NewsNotFoundError) {
      return NextResponse.json(
        { error: 'Noticia nao encontrada' },
        { status: 404 }
      )
    }

    console.error('Get news post error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar noticia' },
      { status: 500 }
    )
  }
}
