import { ShirtSize } from '@/shared/constants'

const SOLD_OUT_SHIRT_SIZES: Record<string, readonly ShirtSize[]> = {
  'geracao-forte': ['PP', 'P'],
}

export function soldOutShirtSizes(eventId: string): readonly ShirtSize[] {
  return SOLD_OUT_SHIRT_SIZES[eventId] ?? []
}

export function isShirtSizeSoldOut(eventId: string, size: ShirtSize): boolean {
  return soldOutShirtSizes(eventId).includes(size)
}
