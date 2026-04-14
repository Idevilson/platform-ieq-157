
import { Money } from '@/server/domain/shared/value-objects/Money'
import { PaymentBreakdown } from '@/server/domain/shared/value-objects/PaymentBreakdown'
import { PaymentMethod } from '@/shared/constants'

export interface IPaymentFeeCalculator {
  calculateBreakdown(
    valorBase: Money,
    metodo: PaymentMethod,
    parcelas?: number,
  ): PaymentBreakdown
}
