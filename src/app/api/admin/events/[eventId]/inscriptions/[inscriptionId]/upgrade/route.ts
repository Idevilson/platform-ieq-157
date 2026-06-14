import { NextRequest, NextResponse } from 'next/server'
import { ValidationError } from '@/server/domain/shared/errors'
import { InscriptionPaymentMethod, INSCRIPTION_PAYMENT_METHODS } from '@/shared/constants'
import { requestInscriptionUpgrade, resolveAdminUid, bearerToken } from './_shared'

interface RouteParams {
  params: Promise<{ eventId: string; inscriptionId: string }>
}

function parseMetodo(value: string | null): InscriptionPaymentMethod {
  if (value && (INSCRIPTION_PAYMENT_METHODS as readonly string[]).includes(value)) {
    return value as InscriptionPaymentMethod
  }
  return 'PIX'
}

// GET → preview da diferença (sem efeitos colaterais)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUid = await resolveAdminUid(bearerToken(request))
    if (!adminUid) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })

    const { eventId, inscriptionId } = await params
    const newCategoryId = request.nextUrl.searchParams.get('newCategoryId')
    if (!newCategoryId) {
      return NextResponse.json({ error: 'newCategoryId é obrigatório' }, { status: 400 })
    }
    const metodo = parseMetodo(request.nextUrl.searchParams.get('metodo'))

    const preview = await requestInscriptionUpgrade.preview({ eventId, inscriptionId, newCategoryId, metodo })
    return NextResponse.json({ preview })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Upgrade Preview] Erro:', error)
    return NextResponse.json({ error: 'Erro ao calcular o upgrade' }, { status: 500 })
  }
}

// POST → gera o upgrade pendente (cobrança da diferença)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUid = await resolveAdminUid(bearerToken(request))
    if (!adminUid) return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })

    const { eventId, inscriptionId } = await params
    const body = await request.json().catch(() => ({}))
    if (!body.newCategoryId) {
      return NextResponse.json({ error: 'newCategoryId é obrigatório' }, { status: 400 })
    }
    const metodo = parseMetodo(body.metodo ?? null)

    const result = await requestInscriptionUpgrade.execute({
      eventId,
      inscriptionId,
      newCategoryId: body.newCategoryId,
      metodo,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[Admin Upgrade Request] Erro:', error)
    return NextResponse.json({ error: 'Erro ao gerar o upgrade' }, { status: 500 })
  }
}
