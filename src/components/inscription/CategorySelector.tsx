'use client'

interface Category {
  id: string
  nome: string
  valor: number
  valorFormatado: string
  descricao?: string
  ordem?: number
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

  // Sort by ordem if available
  const sortedCategories = [...categories].sort((a, b) => (a.ordem || 0) - (b.ordem || 0))

  return (
    <div className="category-selector">
      <label className="category-selector__label">Selecione uma categoria:</label>
      <div className="category-selector__list">
        {sortedCategories.map((category) => {
          const isSelected = selectedCategoryId === category.id
          const isDisabled = disabled

          return (
            <button
              key={category.id}
              type="button"
              className={`category-card ${isSelected ? 'category-card--selected' : ''}`}
              onClick={() => !isDisabled && onSelect(category.id)}
              disabled={isDisabled}
            >
              <div className="category-card__header">
                <h4 className="category-card__name">{category.nome}</h4>
                <span className="category-card__price">{category.valorFormatado}</span>
              </div>

              {category.descricao && (
                <p className="category-card__description">{category.descricao}</p>
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
