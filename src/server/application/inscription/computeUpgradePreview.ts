import { Inscription } from '@/server/domain/inscription/entities/Inscription'
import { EventCategory } from '@/server/domain/event/entities/EventCategory'
import { Money } from '@/server/domain/shared/value-objects/Money'
import { IPaymentFeeCalculator } from '@/server/domain/payment/services/IPaymentFeeCalculator'
import { InscriptionPaymentMethod } from '@/shared/constants'

export interface UpgradePreviewResult {
  currentCategoryId: string
  newCategoryId: string
  newCategoryNome: string
  /** Base da nova categoria avaliada na DATA da inscrição (respeita early bird). */
  targetValorCents: number
  /** targetValorCents − inscription.valorCents. <= 0 indica downgrade (sem cobrança). */
  diferencaBaseCents: number
  diferencaBaseFormatado: string
  taxaCents: number
  totalCents: number
  totalFormatado: string
  metodo: InscriptionPaymentMethod
  isDowngrade: boolean
}

/**
 * Calcula a diferença de um upgrade de categoria respeitando a data da inscrição
 * (early bird) e aplicando a taxa do método POR CIMA da diferença (a taxa não entra
 * no cálculo do valor devido).
 */
export function computeUpgradePreview(
  inscription: Inscription,
  newCategory: EventCategory,
  metodo: InscriptionPaymentMethod,
  feeCalculator: IPaymentFeeCalculator,
): UpgradePreviewResult {
  const targetValorCents = newCategory.getCurrentPrice(inscription.criadoEm).getCents()
  const diferencaBaseCents = targetValorCents - inscription.valorCents
  const isDowngrade = diferencaBaseCents <= 0

  const baseCommon = {
    currentCategoryId: inscription.categoryId,
    newCategoryId: newCategory.id,
    newCategoryNome: newCategory.nome,
    targetValorCents,
    diferencaBaseCents,
    metodo,
    isDowngrade,
  }

  if (isDowngrade) {
    return {
      ...baseCommon,
      diferencaBaseFormatado: Money.fromCents(Math.abs(diferencaBaseCents)).getFormatted(),
      taxaCents: 0,
      totalCents: 0,
      totalFormatado: Money.fromCents(0).getFormatted(),
    }
  }

  const base = Money.fromCents(diferencaBaseCents)
  const breakdown = feeCalculator.calculateBreakdown(base, metodo)
  return {
    ...baseCommon,
    diferencaBaseFormatado: base.getFormatted(),
    taxaCents: breakdown.valorTaxa.getCents(),
    totalCents: breakdown.valorTotal.getCents(),
    totalFormatado: breakdown.valorTotal.getFormatted(),
  }
}
