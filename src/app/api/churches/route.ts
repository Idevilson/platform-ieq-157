import { NextResponse } from 'next/server'
import { ListChurches } from '@/server/application/church/ListChurches'
import { FirebaseChurchRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseChurchRepositoryAdmin'

const churchRepository = new FirebaseChurchRepositoryAdmin()
const listChurches = new ListChurches(churchRepository)

export async function GET() {
  try {
    const result = await listChurches.execute({ ativo: true, limit: 100 })

    const items = result.items.map((c) => ({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      cidade: c.cidade,
      estado: c.estado,
      ativo: c.ativo,
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('[GET /api/churches]', error)
    return NextResponse.json({ error: 'Erro ao listar igrejas' }, { status: 500 })
  }
}
