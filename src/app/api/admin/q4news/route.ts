import { NextRequest, NextResponse } from 'next/server'
import { ListNewsPosts } from '@/server/application/q4news/ListNewsPosts'
import { CreateNewsPost } from '@/server/application/q4news/CreateNewsPost'
import { FirebaseNewsPostRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseNewsPostRepositoryAdmin'
import { FirebaseUserRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseUserRepositoryAdmin'
import { adminAuth } from '@/server/infrastructure/firebase/admin'
import { ValidationError } from '@/server/domain/shared/errors'
import { NewsStatus } from '@/server/domain/q4news/entities/NewsPost'

const newsPostRepository = new FirebaseNewsPostRepositoryAdmin()
const userRepository = new FirebaseUserRepositoryAdmin()
const listNewsPosts = new ListNewsPosts(newsPostRepository)
const createNewsPost = new CreateNewsPost(newsPostRepository)

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

export async function GET(request: NextRequest) {
  try {
    const adminId = await verifyQ4NewsAdmin(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Acesso nao autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as NewsStatus | null
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const result = await listNewsPosts.execute({
      status: status || undefined,
      limit,
      offset,
      full: true,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Admin Q4News API] Erro ao listar noticias:', error)
    return NextResponse.json(
      { error: 'Erro ao listar noticias' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminId = await verifyQ4NewsAdmin(request)
    if (!adminId) {
      return NextResponse.json(
        { error: 'Acesso nao autorizado' },
        { status: 401 }
      )
    }

    const adminUser = await userRepository.findById(adminId)
    const autorNome = adminUser?.toJSON().nome ?? 'Admin'

    const body = await request.json()

    const result = await createNewsPost.execute({
      slug: body.slug,
      titulo: body.titulo,
      descricao: body.descricao,
      conteudo: body.conteudo,
      youtubeUrl: body.youtubeUrl,
      status: body.status,
      autorId: adminId,
      autorNome,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('[Admin Q4News API] Erro ao criar noticia:', error)
    return NextResponse.json(
      { error: 'Erro ao criar noticia' },
      { status: 500 }
    )
  }
}
