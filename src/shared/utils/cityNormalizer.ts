export const CANONICAL_CITIES = [
  'Redenção',
  'Parauapebas',
  'Marabá',
  'Conceição do Araguaia',
  'Novo Repartimento',
  'Xinguara',
  'Santana do Araguaia',
  "Pau D'arco",
  'Rio Maria',
] as const

export type CanonicalCity = (typeof CANONICAL_CITIES)[number]

export type CityBucket = CanonicalCity | 'Outras' | 'Sem cidade'

export interface NormalizedCity {
  canonical: string
  bucket: CityBucket
  raw: string | null | undefined
}

const PATTERNS: ReadonlyArray<[RegExp, CanonicalCity]> = [
  [/^redenc/, 'Redenção'],
  [/^parauap/, 'Parauapebas'],
  [/^paraup/, 'Parauapebas'],
  [/^marab/, 'Marabá'],
  [/^conceicao/, 'Conceição do Araguaia'],
  [/^nov[oa]repartimento/, 'Novo Repartimento'],
  [/^xinguara/, 'Xinguara'],
  [/^santanadoaraguaia/, 'Santana do Araguaia'],
  [/^paudarco/, "Pau D'arco"],
  [/^riomaria/, 'Rio Maria'],
]

function stripKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const KNOWN_NON_CITIES = new Set([
  'para',
  'pa',
  'brasil',
  'br',
  'go',
  'mg',
  'sp',
  'mt',
  'ms',
  'rj',
  'rs',
])

function isGarbage(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed) return true
  if (/^\d+$/.test(trimmed)) return true
  if (KNOWN_NON_CITIES.has(stripKey(trimmed))) return true
  return false
}

const STOP_WORDS = new Set(['do', 'da', 'de', 'dos', 'das', 'e'])

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/(\s+)/)
    .map((part, i) => {
      if (/^\s+$/.test(part)) return part
      if (i > 0 && STOP_WORDS.has(part)) return part
      return part.replace(/^([a-zà-ÿ])/, (c) => c.toUpperCase())
    })
    .join('')
}

export function normalizeCity(raw: string | null | undefined): NormalizedCity {
  if (raw == null || isGarbage(String(raw))) {
    return { canonical: 'Sem cidade', bucket: 'Sem cidade', raw }
  }
  const key = stripKey(String(raw))
  for (const [pattern, canonical] of PATTERNS) {
    if (pattern.test(key)) {
      return { canonical, bucket: canonical, raw }
    }
  }
  return { canonical: titleCase(String(raw).trim()), bucket: 'Outras', raw }
}

const HOME_CITY: CanonicalCity = 'Redenção'

export function compareNormalizedCity(a: NormalizedCity, b: NormalizedCity): number {
  const tier = (n: NormalizedCity): number => {
    if (n.canonical === HOME_CITY) return 0
    if (n.bucket === 'Sem cidade') return 3
    if (n.bucket === 'Outras') return 2
    return 1
  }
  const ta = tier(a)
  const tb = tier(b)
  if (ta !== tb) return ta - tb
  return a.canonical.localeCompare(b.canonical, 'pt-BR')
}
