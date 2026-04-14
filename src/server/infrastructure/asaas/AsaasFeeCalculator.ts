
import { Money } from '@/server/domain/shared/value-objects/Money'
import { PaymentBreakdown } from '@/server/domain/shared/value-objects/PaymentBreakdown'
import { IPaymentFeeCalculator } from '@/server/domain/payment/services/IPaymentFeeCalculator'
import { PaymentMethod } from '@/shared/constants'

const CARD_PERCENT = 2.99
const CARD_FIXED_REAIS = 0.49
const PIX_FIXED_REAIS = 1.99

export class AsaasFeeCalculator implements IPaymentFeeCalculator {
  calculateBreakdown(valorBase: Money, metodo: PaymentMethod): PaymentBreakdown {
    if (metodo === 'PIX') return this.compute(valorBase, PIX_FIXED_REAIS, 0, 'PIX')
    if (metodo === 'CREDIT_CARD') return this.compute(valorBase, CARD_FIXED_REAIS, CARD_PERCENT, 'CREDIT_CARD')
    return PaymentBreakdown.create({ valorBase, valorTaxa: Money.zero(), valorTotal: valorBase, metodo })
  }

  private compute(valorBase: Money, fixedReais: number, percent: number, metodo: PaymentMethod): PaymentBreakdown {
    const taxaReais = (valorBase.getReais() * percent / 100) + fixedReais
    const taxa = Money.fromReais(Math.round(taxaReais * 100) / 100)
    const total = valorBase.add(taxa)
    return PaymentBreakdown.create({ valorBase, valorTaxa: taxa, valorTotal: total, metodo })
  }
}

export const asaasFeeCalculator = new AsaasFeeCalculator()
