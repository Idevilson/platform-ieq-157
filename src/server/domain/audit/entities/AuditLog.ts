import { AuditLogType, AuditLogTargetKind, AuditLogDTO } from '@/shared/constants'

export interface AuditLogProps {
  id: string
  type: AuditLogType
  actorId: string
  actorNome: string
  eventId: string
  targetKind: AuditLogTargetKind
  targetId: string
  targetNome: string
  targetCpf?: string
  totalParticipantes?: number
  comLed?: boolean
  criadoEm: Date
}

export class AuditLog {
  readonly id: string
  readonly type: AuditLogType
  readonly actorId: string
  readonly actorNome: string
  readonly eventId: string
  readonly targetKind: AuditLogTargetKind
  readonly targetId: string
  readonly targetNome: string
  readonly targetCpf?: string
  readonly totalParticipantes?: number
  readonly comLed?: boolean
  readonly criadoEm: Date

  private constructor(props: AuditLogProps) {
    this.id = props.id
    this.type = props.type
    this.actorId = props.actorId
    this.actorNome = props.actorNome
    this.eventId = props.eventId
    this.targetKind = props.targetKind
    this.targetId = props.targetId
    this.targetNome = props.targetNome
    this.targetCpf = props.targetCpf
    this.totalParticipantes = props.totalParticipantes
    this.comLed = props.comLed
    this.criadoEm = props.criadoEm
  }

  static create(input: Omit<AuditLogProps, 'id' | 'criadoEm'>): AuditLog {
    return new AuditLog({ ...input, id: '', criadoEm: new Date() })
  }

  static fromPersistence(props: AuditLogProps): AuditLog {
    return new AuditLog(props)
  }

  toJSON(): AuditLogDTO {
    return {
      id: this.id,
      type: this.type,
      actorId: this.actorId,
      actorNome: this.actorNome,
      eventId: this.eventId,
      targetKind: this.targetKind,
      targetId: this.targetId,
      targetNome: this.targetNome,
      targetCpf: this.targetCpf,
      totalParticipantes: this.totalParticipantes,
      comLed: this.comLed,
      criadoEm: this.criadoEm.toISOString(),
    }
  }
}
