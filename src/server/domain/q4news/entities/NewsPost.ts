export type NewsStatus = 'rascunho' | 'publicado'

export interface NewsPostProps {
  id: string
  titulo: string
  descricao: string
  conteudo: string
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl: string
  status: NewsStatus
  autorId: string
  autorNome: string
  criadoEm: Date
  atualizadoEm: Date
  publicadoEm: Date | null
}

export interface CreateNewsPostDTO {
  titulo: string
  descricao: string
  conteudo: string
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl: string
  status: NewsStatus
  autorId: string
  autorNome: string
}

export interface UpdateNewsPostDTO {
  titulo?: string
  descricao?: string
  conteudo?: string
  youtubeUrl?: string
  youtubeVideoId?: string
  thumbnailUrl?: string
  status?: NewsStatus
}

export class NewsPost {
  private constructor(private readonly props: NewsPostProps) {}

  static create(id: string, dto: CreateNewsPostDTO): NewsPost {
    const now = new Date()
    return new NewsPost({
      id,
      ...dto,
      criadoEm: now,
      atualizadoEm: now,
      publicadoEm: dto.status === 'publicado' ? now : null,
    })
  }

  static fromPersistence(props: NewsPostProps): NewsPost {
    return new NewsPost(props)
  }

  get id() { return this.props.id }
  get titulo() { return this.props.titulo }
  get descricao() { return this.props.descricao }
  get conteudo() { return this.props.conteudo }
  get youtubeUrl() { return this.props.youtubeUrl }
  get youtubeVideoId() { return this.props.youtubeVideoId }
  get thumbnailUrl() { return this.props.thumbnailUrl }
  get status() { return this.props.status }
  get autorId() { return this.props.autorId }
  get autorNome() { return this.props.autorNome }
  get criadoEm() { return this.props.criadoEm }
  get atualizadoEm() { return this.props.atualizadoEm }
  get publicadoEm() { return this.props.publicadoEm }

  isPublished(): boolean {
    return this.props.status === 'publicado'
  }

  update(dto: UpdateNewsPostDTO): void {
    if (dto.titulo !== undefined) this.props.titulo = dto.titulo
    if (dto.descricao !== undefined) this.props.descricao = dto.descricao
    if (dto.conteudo !== undefined) this.props.conteudo = dto.conteudo
    if (dto.youtubeUrl !== undefined) this.props.youtubeUrl = dto.youtubeUrl
    if (dto.youtubeVideoId !== undefined) this.props.youtubeVideoId = dto.youtubeVideoId
    if (dto.thumbnailUrl !== undefined) this.props.thumbnailUrl = dto.thumbnailUrl

    if (dto.status !== undefined && dto.status !== this.props.status) {
      this.props.status = dto.status
      if (dto.status === 'publicado' && !this.props.publicadoEm) {
        this.props.publicadoEm = new Date()
      }
    }

    this.props.atualizadoEm = new Date()
  }

  toJSON() {
    return {
      id: this.props.id,
      titulo: this.props.titulo,
      descricao: this.props.descricao,
      conteudo: this.props.conteudo,
      youtubeUrl: this.props.youtubeUrl,
      youtubeVideoId: this.props.youtubeVideoId,
      thumbnailUrl: this.props.thumbnailUrl,
      status: this.props.status,
      statusLabel: this.props.status === 'publicado' ? 'Publicado' : 'Rascunho',
      autorId: this.props.autorId,
      autorNome: this.props.autorNome,
      criadoEm: this.props.criadoEm,
      atualizadoEm: this.props.atualizadoEm,
      publicadoEm: this.props.publicadoEm,
    }
  }

  toSummary() {
    return {
      id: this.props.id,
      titulo: this.props.titulo,
      descricao: this.props.descricao,
      youtubeVideoId: this.props.youtubeVideoId,
      thumbnailUrl: this.props.thumbnailUrl,
      status: this.props.status,
      autorNome: this.props.autorNome,
      publicadoEm: this.props.publicadoEm,
    }
  }
}
