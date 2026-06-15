export interface PermissionDefProps {
  key: string
  label: string
  description?: string
  system: boolean
}

export class PermissionDef {
  readonly key: string
  private _label: string
  private _description?: string
  readonly system: boolean

  private constructor(props: PermissionDefProps) {
    const key = props.key.trim()
    if (!key) throw new Error('Permissão exige uma chave')
    if (!/^[a-z0-9-:]+$/.test(key)) {
      throw new Error('Chave de permissão deve conter apenas minúsculas, números, hífen e dois-pontos')
    }
    if (!props.label.trim()) throw new Error('Permissão exige um rótulo')
    this.key = key
    this._label = props.label.trim()
    this._description = props.description?.trim() || undefined
    this.system = props.system
  }

  static create(props: PermissionDefProps): PermissionDef {
    return new PermissionDef(props)
  }

  static fromPersistence(data: PermissionDefProps): PermissionDef {
    return new PermissionDef(data)
  }

  get label(): string {
    return this._label
  }

  get description(): string | undefined {
    return this._description
  }

  updateLabel(label: string, description?: string): void {
    if (!label.trim()) throw new Error('Permissão exige um rótulo')
    this._label = label.trim()
    this._description = description?.trim() || undefined
  }

  toJSON() {
    return {
      key: this.key,
      label: this._label,
      description: this._description,
      system: this.system,
    }
  }
}
