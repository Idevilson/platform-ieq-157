import { EventCategoryDTO } from '@/shared/types/event'

export interface CategoryStyle {
  rowBg: string
  rowBorder: string
  cardBg: string
  modalBg: string
  modalHeaderBg: string
  tagClass: string
  label: string
}

const NEUTRAL: CategoryStyle = {
  rowBg: '',
  rowBorder: '',
  cardBg: '',
  modalBg: '',
  modalHeaderBg: '',
  tagClass: 'bg-gray-500/15 text-gray-300 border border-gray-500/30',
  label: '',
}

const PALETTE: Omit<CategoryStyle, 'label'>[] = [
  {
    rowBg: 'bg-sky-500/5 hover:bg-sky-500/10',
    rowBorder: 'border-l-4 border-l-sky-400 border-b border-b-sky-500/20',
    cardBg: 'bg-sky-500/5 border-sky-500/40 border-l-4 border-l-sky-400',
    modalBg: 'bg-slate-900 border-l-4 border-l-sky-400 border-y border-r border-sky-500/30',
    modalHeaderBg: 'bg-slate-900/95 border-b border-sky-500/20',
    tagClass: 'bg-sky-500/25 text-sky-100 border border-sky-400/50',
  },
  {
    rowBg: 'bg-yellow-500/5 hover:bg-yellow-500/10',
    rowBorder: 'border-l-4 border-l-yellow-400 border-b border-b-yellow-500/20',
    cardBg: 'bg-yellow-500/5 border-yellow-500/40 border-l-4 border-l-yellow-400',
    modalBg: 'bg-stone-900 border-l-4 border-l-yellow-400 border-y border-r border-yellow-500/30',
    modalHeaderBg: 'bg-stone-900/95 border-b border-yellow-500/20',
    tagClass: 'bg-yellow-500/25 text-yellow-100 border border-yellow-400/50',
  },
]

const TIER_LABELS = ['Simples', 'Premium']

export function getCategoryStyle(categoryId: string | undefined, categories: EventCategoryDTO[]): CategoryStyle {
  if (!categoryId) return NEUTRAL
  const sorted = [...categories].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
  const idx = sorted.findIndex((c) => c.id === categoryId)
  if (idx < 0) return NEUTRAL
  const palette = PALETTE[idx] ?? PALETTE[PALETTE.length - 1]
  const label = TIER_LABELS[idx] ?? TIER_LABELS[TIER_LABELS.length - 1]
  return { ...palette, label }
}
