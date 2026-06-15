import { IAuditLogRepository } from '@/server/domain/audit/repositories/IAuditLogRepository'
import { IEventRepository } from '@/server/domain/event/repositories/IEventRepository'
import { AuditLogDTO } from '@/shared/constants'

export interface ListAuditLogsInput {
  limit?: number
}

export class ListAuditLogs {
  constructor(
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(input: ListAuditLogsInput = {}): Promise<AuditLogDTO[]> {
    const logs = await this.auditLogRepository.list({ limit: input.limit ?? 100 })
    const events = await this.eventRepository.findAll({ limit: 500, offset: 0 })
    const titleById = new Map(events.items.map((e) => [e.id, e.titulo]))
    return logs.map((log) => ({ ...log.toJSON(), eventTitulo: titleById.get(log.eventId) }))
  }
}
