// Formatters - centralized formatting utilities
// Following Object Calisthenics: no abbreviations, single responsibility

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '')

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')

  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export function formatDate(value: string | Date): string {
  const dateObject = new Date(value)

  return dateObject.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(value: string | Date): string {
  const dateObject = new Date(value)

  return dateObject.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(valueInCents: number): string {
  const valueInReais = valueInCents / 100

  return valueInReais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatEventDate(startDate: string, endDate?: string): string {
  const start = new Date(startDate)
  const shortOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  const fullOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }

  if (!endDate) {
    return start.toLocaleDateString('pt-BR', fullOptions)
  }

  const end = new Date(endDate)
  return `${start.toLocaleDateString('pt-BR', shortOptions)} - ${end.toLocaleDateString('pt-BR', fullOptions)}`
}
