export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

export function isValidCPF(cpf: string): boolean {
  const clean = cleanCPF(cpf)

  if (clean.length !== 11) return false
  if (/^(\d)\1+$/.test(clean)) return false

  return matchesCheckDigits(clean)
}

function matchesCheckDigits(cpf: string): boolean {
  return matchesDigit(cpf, 9, 10) && matchesDigit(cpf, 10, 11)
}

function matchesDigit(cpf: string, position: number, initialWeight: number): boolean {
  let sum = 0
  for (let i = 0; i < position; i++) {
    sum += parseInt(cpf.charAt(i)) * (initialWeight - i)
  }
  const remainder = (sum * 10) % 11
  const expected = remainder === 10 || remainder === 11 ? 0 : remainder
  return expected === parseInt(cpf.charAt(position))
}
