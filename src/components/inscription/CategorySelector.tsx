'use client'

interface Category {
  id: string
  nome: string
  valor: number
  valorFormatado: string
  descricao?: string
  ordem?: number
  beneficiosInclusos?: string[]
  valorAtual?: number
  valorAtualFormatado?: string
}

interface CategorySelectorProps {
  categories: Category[]
  selectedCategoryId?: string
  onSelect: (categoryId: string) => void
  disabled?: boolean
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

  return (
    <div className="category-selector">
      <label className="category-selector__label">Escolha sua categoria:</label>
      <div className="category-selector__list">
        {sortedCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id
          const currentPrice = category.valorAtualFormatado ?? category.valorFormatado
          const benefits = category.beneficiosInclusos ?? []

          return (
            <button
              key={category.id}
              type="button"
              className={`category-card ${isSelected ? 'category-card--selected' : ''}`}
              onClick={() => !disabled && onSelect(category.id)}
              disabled={disabled}
            >
              <div className="category-card__header">
                <h4 className="category-card__name">{category.nome}</h4>
                <div>
                  <span className="category-card__price">{currentPrice}</span>
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
