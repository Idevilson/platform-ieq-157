'use client'

import { useEffect, useState } from 'react'
import { useCreateChurch } from '@/hooks/mutations/useAdminChurchMutations'

interface CreateChurchModalProps {
  open: boolean
  onClose: () => void
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CreateChurchModal({ open, onClose }: CreateChurchModalProps) {
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createChurch = useCreateChurch()

  useEffect(() => {
    if (!open) {
      setNome('')
      setSlug('')
      setSlugManual(false)
      setCidade('')
      setEstado('')
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!slugManual) setSlug(slugify(nome))
  }, [nome, slugManual])

  if (!open) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await createChurch.mutateAsync({
        nome: nome.trim(),
        slug: slug.trim() || undefined,
        cidade: cidade.trim() || undefined,
        estado: estado.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar igreja')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-bg-secondary border border-gold/20 rounded-2xl overflow-hidden"
      >
        <header className="px-6 py-4 border-b border-gold/10">
          <h2 className="text-lg font-semibold text-text-primary">Nova igreja</h2>
        </header>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={2}
              className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-gold/15 text-sm text-text-primary focus:border-gold focus:outline-none"
              placeholder="Ex: SEDE DE REDENÇÃO"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-text-muted">Slug</label>
              <button
                type="button"
                onClick={() => setSlugManual((v) => !v)}
                className="text-xs text-gold hover:underline"
              >
                {slugManual ? 'Gerar automaticamente' : 'Editar manualmente'}
              </button>
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              readOnly={!slugManual}
              pattern="[a-z0-9-]+"
              className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-gold/15 text-sm text-text-secondary focus:border-gold focus:outline-none"
              placeholder="sede-redencao"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-gold/15 text-sm text-text-primary focus:border-gold focus:outline-none"
                placeholder="Redenção"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">UF</label>
              <input
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                maxLength={2}
                className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-gold/15 text-sm text-text-primary uppercase focus:border-gold focus:outline-none"
                placeholder="PA"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <footer className="px-6 py-4 bg-bg-tertiary/50 border-t border-gold/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={createChurch.isPending}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createChurch.isPending || !nome.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-dark text-bg-primary text-sm font-semibold shadow-gold disabled:opacity-50 hover:shadow-gold-lg transition-all"
          >
            {createChurch.isPending ? 'Criando…' : 'Criar igreja'}
          </button>
        </footer>
      </form>
    </div>
  )
}
