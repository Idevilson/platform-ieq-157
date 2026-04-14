import { NextRequest, NextResponse } from 'next/server'
import { UpdateNewsPost } from '@/server/application/q4news/UpdateNewsPost'
import { DeleteNewsPost } from '@/server/application/q4news/DeleteNewsPost'
import { FirebaseNewsPostRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseNewsPostRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { NewsNotFoundError, ValidationError } from '@/server/domain/shared/errors'

const newsPostRepository = new FirebaseNewsPostRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const updateNewsPost = new UpdateNewsPost(newsPostRepository)
const deleteNewsPost = new DeleteNewsPost(newsPostRepository)

interface RouteParams {
  params: Promise<{ newsId: string }>
}

async function verifyQ4NewsAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    const user = await userRepository.findById(decodedToken.uid)
    if (!user?.hasPermission('adm-q4-news')) return null
    return decodedToken.uid
  } catch {
    return null
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyQ4NewsAdmin(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Acesso nao autorizado' },
        { status: 401 }
      )
    }

    const { newsId } = await params
    const body = await request.json()

    const result = await updateNewsPost.execute(newsId, body)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof NewsNotFoundError) {
      return NextResponse.json(
        { error: 'Noticia nao encontrada' },
        { status: 404 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('[Admin Q4News API] Erro ao atualizar noticia:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar noticia' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const adminId = await verifyQ4NewsAdmin(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Acesso nao autorizado' },
        { status: 401 }
      )
    }

    const { newsId } = await params

    await deleteNewsPost.execute(newsId)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof NewsNotFoundError) {
      return NextResponse.json(
        { error: 'Noticia nao encontrada' },
        { status: 404 }
      )
    }

    console.error('[Admin Q4News API] Erro ao deletar noticia:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar noticia' },
      { status: 500 }
    )
  }
}
