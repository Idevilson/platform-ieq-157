"use client"

export type CheckoutMethod = 'PIX' | 'CREDIT_CARD'

interface PaymentMethodSelectorProps {
  value: CheckoutMethod
  onChange: (method: CheckoutMethod) => void
  disabled?: boolean
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <MethodCard
        selected={value === 'PIX'}
        disabled={disabled}
        title="PIX"
        subtitle="Pagamento instantâneo"
        onClick={() => onChange('PIX')}
      />
      <MethodCard
        selected={value === 'CREDIT_CARD'}
        disabled={disabled}
        title="Cartão de Crédito"
        subtitle="Pagamento à vista"
        onClick={() => onChange('CREDIT_CARD')}
      />
    </div>
  )
}

function MethodCard({
  selected,
  disabled,
  title,
  subtitle,
  onClick,
}: {
  selected: boolean
  disabled?: boolean
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-gold bg-gold/10'
          : 'border-gold/20 bg-bg-secondary hover:border-gold/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-text-primary font-semibold">{title}</h4>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
        {selected && <span className="text-gold text-lg">✓</span>}
      </div>
    </button>
  )
}
