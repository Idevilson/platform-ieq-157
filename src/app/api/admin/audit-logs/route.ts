import { NextRequest, NextResponse } from 'next/server'
import { FirebaseAuditLogRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseAuditLogRepositoryAdmin'
import { FirebaseEventRepositoryAdmin } from '@/server/infrastructure/firebase/repositories/FirebaseEventRepositoryAdmin'
import { ListAuditLogs } from '@/server/application/audit/ListAuditLogs'
import { verifyAdmin } from '../_perm-shared'

const auditLogRepository = new FirebaseAuditLogRepositoryAdmin()
const eventRepository = new FirebaseEventRepositoryAdmin()
const listAuditLogs = new ListAuditLogs(auditLogRepository, eventRepository)

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
  }
  const limitParam = request.nextUrl.searchParams.get('limit')
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 100, 1), 500) : 100
  const logs = await listAuditLogs.execute({ limit })
  return NextResponse.json({ logs })
}
