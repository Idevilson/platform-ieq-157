import { AuditLog } from '../entities/AuditLog'

export interface ListAuditLogsParams {
  limit?: number
}

export interface IAuditLogRepository {
  append(log: AuditLog): Promise<void>
  list(params?: ListAuditLogsParams): Promise<AuditLog[]>
}
