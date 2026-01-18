
export class Phone {
  private readonly value: string

  private constructor(phone: string) {
    this.value = phone
  }

  static create(phone: string): Phone {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Telefone é obrigatório')
    }

    const cleanPhone = Phone.clean(phone)

    if (!Phone.isValid(cleanPhone)) {
      throw new Error('Telefone inválido. Use formato: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX')
    }

    return new Phone(cleanPhone)
  }

  static clean(phone: string): string {
    return phone.replace(/\D/g, '')
  }

  static isValid(phone: string): boolean {
    const cleanPhone = Phone.clean(phone)
    // Brazilian phone: 10 digits (landline) or 11 digits (mobile)
    return cleanPhone.length === 10 || cleanPhone.length === 11
  }

  getValue(): string {
    return this.value
  }

  getFormatted(): string {
    if (this.value.length === 11) {
      return this.value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return this.value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  getDDD(): string {
    return this.value.substring(0, 2)
  }

  isMobile(): boolean {
    return this.value.length === 11
  }

  equals(other: Phone): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
