'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAdminQ4NewsList } from '@/hooks/queries/useAdminQ4News'
import { useCreateNewsPost, useUpdateNewsPost, useDeleteNewsPost } from '@/hooks/mutations/useAdminQ4NewsMutations'
import { NewsStatus, NEWS_STATUSES, NEWS_STATUS_LABELS } from '@/shared/constants'

function formatDate(date: string | Date | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function parseVideoId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/)
  return match?.[1] || null
}

function getStatusBadgeClass(status: string): string {
  if (status === 'publicado') return 'bg-green-500/20 text-green-400'
  return 'bg-yellow-500/20 text-yellow-400'
}

interface NewsFormData {
  slug: string
  titulo: string
  descricao: string
  conteudo: string
  youtubeUrl: string
  status: string
}

const emptyForm: NewsFormData = {
  slug: '',
  titulo: '',
  descricao: '',
  conteudo: '',
  youtubeUrl: '',
  status: 'rascunho',
}

interface NewsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: NewsFormData) => void
  isLoading: boolean
  initialData?: NewsFormData
  title: string
}

function NewsModal({ isOpen, onClose, onSubmit, isLoading, initialData, title }: NewsModalProps) {
  const [form, setForm] = useState<NewsFormData>(initialData || emptyForm)
  const videoId = parseVideoId(form.youtubeUrl)

  useEffect(() => {
    setForm(initialData || emptyForm)
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-secondary border border-gold/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Slug (opcional)</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              placeholder="meu-post-customizado"
              className="w-full bg-bg-tertiary border border-gold/20 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Titulo *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
              className="w-full bg-bg-tertiary border border-gold/20 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Resumo *</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
              rows={2}
              className="w-full bg-bg-tertiary border border-gold/20 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Conteudo *</label>
            <textarea
              value={form.conteudo}
              onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
              required
              rows={5}
              className="w-full bg-bg-tertiary border border-gold/20 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">YouTube URL *</label>
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              required
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-bg-tertiary border border-gold/20 rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold"
            />
            {videoId && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gold/10">
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt="Thumbnail"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="rascunho"
                  checked={form.status === 'rascunho'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="accent-gold"
                />
                <span className="text-sm text-text-primary">Rascunho</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="publicado"
                  checked={form.status === 'publicado'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="accent-gold"
                />
                <span className="text-sm text-text-primary">Publicado</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gold/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gold text-bg-primary font-medium text-sm rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface NewsDetailModalProps {
  post: any
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

function NewsDetailModal({ post, onClose, onEdit, onDelete }: NewsDetailModalProps) {
  const videoId = parseVideoId(post.youtubeUrl || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-secondary border border-gold/20 rounded-2xl">
        {videoId && (
          <div className="relative aspect-video w-full bg-bg-tertiary rounded-t-2xl overflow-hidden">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={post.titulo}
              className="w-full h-full object-cover"
            />
            <a
              href={post.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
            >
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </a>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(post.status)}`}>
                  {NEWS_STATUS_LABELS[post.status as NewsStatus] || post.status}
                </span>
                <span className="text-xs text-text-muted">{formatDate(post.publicadoEm || post.criadoEm)}</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary">{post.titulo}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ml-4">
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wide">Resumo</label>
              <p className="text-sm text-text-secondary mt-1">{post.descricao}</p>
            </div>

            {post.conteudo && (
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wide">Conteúdo</label>
                <div className="mt-1 text-sm text-text-secondary whitespace-pre-wrap bg-bg-tertiary rounded-lg p-4">
                  {post.conteudo}
                </div>
              </div>
            )}

            {post.youtubeUrl && (
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wide">YouTube</label>
                <a href={post.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-gold hover:underline mt-1 truncate">
                  {post.youtubeUrl}
                </a>
              </div>
            )}

            {post.id && (
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wide">Slug</label>
                <p className="text-sm text-text-secondary mt-1 font-mono">{post.id}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gold/10">
            <button
              onClick={onEdit}
              className="flex-1 py-2.5 bg-gold text-bg-primary font-medium text-sm rounded-lg hover:bg-gold-dark transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              onClick={onDelete}
              className="py-2.5 px-6 bg-red-500/10 text-red-400 font-medium text-sm rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DeleteConfirmProps {
  postTitle: string
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

function DeleteConfirm({ postTitle, onClose, onConfirm, isLoading }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-bg-secondary border border-gold/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Confirmar exclusao</h2>
        <p className="text-text-secondary mb-6">
          Tem certeza que deseja excluir <strong className="text-text-primary">&quot;{postTitle}&quot;</strong>? Esta acao nao pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-red-500 text-white font-medium text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminQ4NewsPage() {
  const [statusFilter, setStatusFilter] = useState<NewsStatus | ''>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [deletingPost, setDeletingPost] = useState<any | null>(null)
  const [viewingPost, setViewingPost] = useState<any | null>(null)

  const { data, isLoading, error } = useAdminQ4NewsList({
    status: statusFilter || undefined,
    limit: 50,
  })
  const createMutation = useCreateNewsPost()
  const updateMutation = useUpdateNewsPost()
  const deleteMutation = useDeleteNewsPost()

  const items = useMemo(() => {
    const list = data?.items || []
    if (!searchTerm) return list
    const search = searchTerm.toLowerCase()
    return list.filter((p: any) => p.titulo?.toLowerCase().includes(search))
  }, [data?.items, searchTerm])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <span className="text-text-secondary">Carregando noticias...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400">Erro ao carregar noticias</p>
      </div>
    )
  }

  const handleCreate = async (formData: NewsFormData) => {
    try {
      await createMutation.mutateAsync({
        slug: formData.slug || undefined,
        titulo: formData.titulo,
        descricao: formData.descricao,
        conteudo: formData.conteudo,
        youtubeUrl: formData.youtubeUrl,
        status: formData.status,
      })
      setIsCreateOpen(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar noticia')
    }
  }

  const handleUpdate = async (formData: NewsFormData) => {
    if (!editingPost) return
    try {
      await updateMutation.mutateAsync({
        newsId: editingPost.id,
        titulo: formData.titulo,
        descricao: formData.descricao,
        conteudo: formData.conteudo,
        youtubeUrl: formData.youtubeUrl,
        status: formData.status,
      })
      setEditingPost(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar noticia')
    }
  }

  const handleDelete = async () => {
    if (!deletingPost) return
    try {
      await deleteMutation.mutateAsync(deletingPost.id)
      setDeletingPost(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir noticia')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Q4-News</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por titulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-bg-tertiary border border-gold/20 rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold w-full sm:w-56"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as NewsStatus | '')}
              className="bg-bg-tertiary border border-gold/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold"
            >
              <option value="">Todos</option>
              {NEWS_STATUSES.map((s) => (
                <option key={s} value={s}>{NEWS_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-gold text-bg-primary font-medium text-sm rounded-lg hover:bg-gold-dark transition-colors"
          >
            + Nova Postagem
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          Nenhuma noticia encontrada
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Titulo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Data</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((post: any) => (
                <tr
                  key={post.id}
                  onClick={() => setViewingPost(post)}
                  className="border-b border-gold/5 hover:bg-gold/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <p className="font-medium text-text-primary">{post.titulo}</p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{post.descricao}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(post.status)}`}>
                      {NEWS_STATUS_LABELS[post.status as NewsStatus] || post.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-text-secondary">{formatDate(post.publicadoEm || post.criadoEm)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-xs text-text-muted">Clique para ver</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > items.length && (
        <div className="mt-4 text-center text-sm text-text-secondary">
          Exibindo {items.length} de {data.total} noticias
        </div>
      )}

      <NewsModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
        title="Nova Postagem"
      />

      {editingPost && (
        <NewsModal
          isOpen={true}
          onClose={() => setEditingPost(null)}
          onSubmit={handleUpdate}
          isLoading={updateMutation.isPending}
          initialData={{
            slug: '',
            titulo: editingPost.titulo || '',
            descricao: editingPost.descricao || '',
            conteudo: editingPost.conteudo || '',
            youtubeUrl: editingPost.youtubeUrl || '',
            status: editingPost.status || 'rascunho',
          }}
          title="Editar Postagem"
        />
      )}

      {viewingPost && (
        <NewsDetailModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onEdit={() => {
            setEditingPost(viewingPost)
            setViewingPost(null)
          }}
          onDelete={() => {
            setDeletingPost(viewingPost)
            setViewingPost(null)
          }}
        />
      )}

      {deletingPost && (
        <DeleteConfirm
          postTitle={deletingPost.titulo}
          onClose={() => setDeletingPost(null)}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
