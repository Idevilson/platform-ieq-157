
import { Money } from './Money'
import { PaymentMethod } from '@/shared/constants'

export interface PaymentBreakdownProps {
  valorBase: Money
  valorTaxa: Money
  valorTotal: Money
  metodo: PaymentMethod
  parcelas?: number | null
  valorParcela?: Money | null
}

export class PaymentBreakdown {
  readonly valorBase: Money
  readonly valorTaxa: Money
  readonly valorTotal: Money
  readonly metodo: PaymentMethod
  readonly parcelas?: number
  readonly valorParcela?: Money

  private constructor(props: PaymentBreakdownProps) {
    if (!props.valorBase.add(props.valorTaxa).equals(props.valorTotal)) {
      throw new Error('valorBase + valorTaxa deve ser igual a valorTotal')
    }
    const parcelas = props.parcelas ?? undefined
    const valorParcela = props.valorParcela ?? undefined
    if (parcelas !== undefined && parcelas < 1) {
      throw new Error('parcelas deve ser >= 1')
    }
    this.valorBase = props.valorBase
    this.valorTaxa = props.valorTaxa
    this.valorTotal = props.valorTotal
    this.metodo = props.metodo
    this.parcelas = parcelas
    this.valorParcela = valorParcela
  }

  static create(props: PaymentBreakdownProps): PaymentBreakdown {
    return new PaymentBreakdown(props)
  }

  static fromCents(data: {
    valorBase: number
    valorTaxa: number
    valorTotal: number
    metodo: PaymentMethod
    parcelas?: number
    valorParcela?: number
  }): PaymentBreakdown {
    return new PaymentBreakdown({
      valorBase: Money.fromCents(data.valorBase),
      valorTaxa: Money.fromCents(data.valorTaxa),
      valorTotal: Money.fromCents(data.valorTotal),
      metodo: data.metodo,
      parcelas: data.parcelas,
      valorParcela: data.valorParcela !== undefined ? Money.fromCents(data.valorParcela) : undefined,
    })
  }

  toJSON() {
    return {
      valorBase: this.valorBase.getCents(),
      valorBaseFormatado: this.valorBase.getFormatted(),
      valorTaxa: this.valorTaxa.getCents(),
      valorTaxaFormatado: this.valorTaxa.getFormatted(),
      valorTotal: this.valorTotal.getCents(),
      valorTotalFormatado: this.valorTotal.getFormatted(),
      metodo: this.metodo,
      parcelas: this.parcelas,
      valorParcela: this.valorParcela?.getCents(),
      valorParcelaFormatado: this.valorParcela?.getFormatted(),
    }
  }
}
