import { NextResponse } from 'next/server'
import { avisos, getUltimosAvisos } from '@/data/avisos'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit')

  if (limit) {
    const quantidade = parseInt(limit, 10)
    if (!isNaN(quantidade)) {
      return NextResponse.json({ avisos: getUltimosAvisos(quantidade) })
    }
  }

  return NextResponse.json({ avisos })
}
