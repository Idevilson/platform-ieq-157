export interface ChurchProps {
  id: string
  nome: string
  slug: string
  cidade?: string
  estado?: string
  ativo: boolean
  totalMembros: number
  criadoEm: Date
  atualizadoEm: Date
}

export interface CreateChurchDTO {
  nome: string
  slug: string
  cidade?: string
  estado?: string
  ativo?: boolean
}

export interface UpdateChurchDTO {
  nome?: string
  cidade?: string
  estado?: string
  ativo?: boolean
}

export class Church {
  private constructor(private readonly props: ChurchProps) {}

  static create(dto: CreateChurchDTO): Church {
    const now = new Date()
    return new Church({
      id: dto.slug,
      nome: dto.nome,
      slug: dto.slug,
      cidade: dto.cidade,
      estado: dto.estado,
      ativo: dto.ativo ?? true,
      totalMembros: 0,
      criadoEm: now,
      atualizadoEm: now,
    })
  }

  static fromPersistence(props: ChurchProps): Church {
    return new Church(props)
  }

  get id() { return this.props.id }
  get nome() { return this.props.nome }
  get slug() { return this.props.slug }
  get cidade() { return this.props.cidade }
  get estado() { return this.props.estado }
  get ativo() { return this.props.ativo }
  get totalMembros() { return this.props.totalMembros }
  get criadoEm() { return this.props.criadoEm }
  get atualizadoEm() { return this.props.atualizadoEm }

  isActive(): boolean {
    return this.props.ativo
  }

  hasMembers(): boolean {
    return this.props.totalMembros > 0
  }

  update(dto: UpdateChurchDTO): void {
    if (dto.nome !== undefined) this.props.nome = dto.nome
    if (dto.cidade !== undefined) this.props.cidade = dto.cidade
    if (dto.estado !== undefined) this.props.estado = dto.estado
    if (dto.ativo !== undefined) this.props.ativo = dto.ativo
    this.props.atualizadoEm = new Date()
  }

  deactivate(): void {
    this.props.ativo = false
    this.props.atualizadoEm = new Date()
  }

  activate(): void {
    this.props.ativo = true
    this.props.atualizadoEm = new Date()
  }

  toJSON() {
    return {
      id: this.props.id,
      nome: this.props.nome,
      slug: this.props.slug,
      cidade: this.props.cidade,
      estado: this.props.estado,
      ativo: this.props.ativo,
      totalMembros: this.props.totalMembros,
      criadoEm: this.props.criadoEm,
      atualizadoEm: this.props.atualizadoEm,
    }
  }

  toSummary() {
    return {
      id: this.props.id,
      nome: this.props.nome,
      slug: this.props.slug,
      cidade: this.props.cidade,
      estado: this.props.estado,
      ativo: this.props.ativo,
    }
  }
}
