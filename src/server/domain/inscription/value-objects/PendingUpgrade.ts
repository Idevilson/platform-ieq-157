import { InscriptionPaymentMethod } from '@/shared/constants'

export interface PendingUpgradeProps {
  targetCategoryId: string
  targetValorCents: number
  diferencaBaseCents: number
  adjustmentPaymentId: string
  metodo: InscriptionPaymentMethod
  criadoEm: Date
}

/**
 * Estado de upgrade de categoria pendente, embutido na Inscription.
 * A troca de categoria/valor só é aplicada quando o pagamento da diferença
 * (Payment tipo AJUSTE = adjustmentPaymentId) confirma.
 */
export class PendingUpgrade {
  readonly targetCategoryId: string
  readonly targetValorCents: number
  readonly diferencaBaseCents: number
  readonly adjustmentPaymentId: string
  readonly metodo: InscriptionPaymentMethod
  readonly criadoEm: Date

  private constructor(props: PendingUpgradeProps) {
    if (!props.targetCategoryId) {
      throw new Error('pendingUpgrade exige targetCategoryId')
    }
    if (props.diferencaBaseCents <= 0) {
      throw new Error('pendingUpgrade exige diferencaBaseCents > 0 (somente upgrade)')
    }
    if (props.targetValorCents <= 0) {
      throw new Error('pendingUpgrade exige targetValorCents > 0')
    }
    if (!props.adjustmentPaymentId) {
      throw new Error('pendingUpgrade exige adjustmentPaymentId')
    }
    this.targetCategoryId = props.targetCategoryId
    this.targetValorCents = props.targetValorCents
    this.diferencaBaseCents = props.diferencaBaseCents
    this.adjustmentPaymentId = props.adjustmentPaymentId
    this.metodo = props.metodo
    this.criadoEm = props.criadoEm
  }

  static create(props: PendingUpgradeProps): PendingUpgrade {
    return new PendingUpgrade(props)
  }

  static fromPersistence(data: {
    targetCategoryId: string
    targetValorCents: number
    diferencaBaseCents: number
    adjustmentPaymentId: string
    metodo: InscriptionPaymentMethod
    criadoEm: Date
  }): PendingUpgrade {
    return new PendingUpgrade(data)
  }

  toJSON() {
    return {
      targetCategoryId: this.targetCategoryId,
      targetValorCents: this.targetValorCents,
      diferencaBaseCents: this.diferencaBaseCents,
      adjustmentPaymentId: this.adjustmentPaymentId,
      metodo: this.metodo,
      criadoEm: this.criadoEm.toISOString(),
    }
  }
}
