import { getAdminFirestore } from '../admin'
import { AuditLog } from '@/server/domain/audit/entities/AuditLog'
import { IAuditLogRepository, ListAuditLogsParams } from '@/server/domain/audit/repositories/IAuditLogRepository'
import { AuditLogType, AuditLogTargetKind } from '@/shared/constants'
import { Timestamp } from 'firebase-admin/firestore'

const COLLECTION = 'auditLogs'

export class FirebaseAuditLogRepositoryAdmin implements IAuditLogRepository {
  private get collection() {
    return getAdminFirestore().collection(COLLECTION)
  }

  async append(log: AuditLog): Promise<void> {
    const ref = this.collection.doc()
    await ref.set(this.toFirestore(log))
  }

  async list(params?: ListAuditLogsParams): Promise<AuditLog[]> {
    const snapshot = await this.collection
      .orderBy('criadoEm', 'desc')
      .limit(params?.limit ?? 100)
      .get()

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return AuditLog.fromPersistence({
        id: docSnap.id,
        type: data.type as AuditLogType,
        actorId: data.actorId,
        actorNome: data.actorNome,
        eventId: data.eventId,
        targetKind: data.targetKind as AuditLogTargetKind,
        targetId: data.targetId,
        targetNome: data.targetNome,
        targetCpf: data.targetCpf ?? undefined,
        totalParticipantes: data.totalParticipantes ?? undefined,
        comLed: typeof data.comLed === 'boolean' ? data.comLed : undefined,
        criadoEm: data.criadoEm?.toDate?.() ?? new Date(),
      })
    })
  }

  private toFirestore(log: AuditLog) {
    return {
      type: log.type,
      actorId: log.actorId,
      actorNome: log.actorNome,
      eventId: log.eventId,
      targetKind: log.targetKind,
      targetId: log.targetId,
      targetNome: log.targetNome,
      targetCpf: log.targetCpf ?? null,
      totalParticipantes: log.totalParticipantes ?? null,
      comLed: log.comLed ?? null,
      criadoEm: Timestamp.fromDate(log.criadoEm),
    }
  }
}

export const firebaseAuditLogRepositoryAdmin = new FirebaseAuditLogRepositoryAdmin()
