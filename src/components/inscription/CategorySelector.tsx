'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  nome: string
  valor: number
  valorFormatado: string
  descricao?: string
  ordem?: number
  earlyBirdValor?: number
  earlyBirdValorFormatado?: string
  earlyBirdDeadline?: string
  beneficiosInclusos?: string[]
  valorAtual?: number
  valorAtualFormatado?: string
  earlyBirdAtivo?: boolean
}

interface CategorySelectorProps {
  categories: Category[]
  selectedCategoryId?: string
  onSelect: (categoryId: string) => void
  disabled?: boolean
}

function useCountdown(deadline?: string) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!deadline) return

    const update = () => {
      const now = new Date().getTime()
      const target = new Date(deadline).getTime()
      const diff = target - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
        return
      }
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
        return
      }
      setTimeLeft(`${minutes}m`)
    }

    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [deadline])

  return { timeLeft, isExpired }
}

function EarlyBirdBanner({ deadline }: { deadline: string }) {
  const { timeLeft, isExpired } = useCountdown(deadline)

  if (isExpired) return null

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl text-center animate-pulse-slow">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-lg">🔥</span>
        <span className="text-green-400 font-bold text-sm uppercase tracking-wide">Preço Promocional</span>
        <span className="text-lg">🔥</span>
      </div>
      <p className="text-text-secondary text-xs mb-2">Inscreva-se agora e pague menos!</p>
      {timeLeft && (
        <div className="inline-flex items-center gap-2 bg-black/30 rounded-lg px-4 py-2">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          <span className="text-green-400 font-mono font-bold text-sm">{timeLeft}</span>
          <span className="text-text-muted text-xs">restantes</span>
        </div>
      )}
    </div>
  )
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  disabled = false,
}: CategorySelectorProps) {
  if (categories.length === 0) {
    return (
      <div className="category-selector category-selector--empty">
        <p>Nenhuma categoria disponível para este evento.</p>
      </div>
    )
  }

  const sortedCategories = [...categories].sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
  const hasAnyEarlyBird = sortedCategories.some((c) => c.earlyBirdAtivo)
  const earliestDeadline = sortedCategories
    .filter((c) => c.earlyBirdAtivo && c.earlyBirdDeadline)
    .map((c) => c.earlyBirdDeadline!)
    .sort()[0]

  return (
    <div className="category-selector">
      {hasAnyEarlyBird && earliestDeadline && (
        <EarlyBirdBanner deadline={earliestDeadline} />
      )}

      <label className="category-selector__label">Escolha sua categoria:</label>
      <div className="category-selector__list">
        {sortedCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id
          const isEarlyBird = category.earlyBirdAtivo === true
          const currentPrice = category.valorAtualFormatado ?? category.valorFormatado
          const originalPrice = isEarlyBird ? category.valorFormatado : null
          const benefits = category.beneficiosInclusos ?? []

          return (
            <button
              key={category.id}
              type="button"
              className={`category-card ${isSelected ? 'category-card--selected' : ''}`}
              onClick={() => !disabled && onSelect(category.id)}
              disabled={disabled}
            >
              {isEarlyBird && (
                <div className="mb-2">
                  <span className="inline-block px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/30">
                    🔥 Promoção
                  </span>
                </div>
              )}

              <div className="category-card__header">
                <h4 className="category-card__name">{category.nome}</h4>
                <div>
                  <span className="category-card__price">{currentPrice}</span>
                  {originalPrice && (
                    <span className="block text-xs text-text-muted line-through mt-0.5">{originalPrice}</span>
                  )}
                </div>
              </div>

              {category.descricao && (
                <p className="category-card__description">{category.descricao}</p>
              )}

              {benefits.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-text-secondary text-left">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <span className="text-gold">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}

              {isSelected && (
                <div className="category-card__footer">
                  <span className="category-card__check">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
