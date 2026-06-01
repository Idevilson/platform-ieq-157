'use client'

import { useEffect, useState } from 'react'
import { useUpdateChurch } from '@/hooks/mutations/useAdminChurchMutations'
import type { ChurchDTO } from '@/shared/types'

interface EditChurchModalProps {
  open: boolean
  onClose: () => void
  church: ChurchDTO | null
}

export function EditChurchModal({ open, onClose, church }: EditChurchModalProps) {
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const updateChurch = useUpdateChurch()

  useEffect(() => {
    if (open && church) {
      setNome(church.nome)
      setCidade(church.cidade ?? '')
      setEstado(church.estado ?? '')
      setAtivo(church.ativo)
      setError(null)
    }
  }, [open, church])

  if (!open || !church) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await updateChurch.mutateAsync({
        churchId: church.id,
        nome: nome.trim(),
        cidade: cidade.trim() || undefined,
        estado: estado.trim() || undefined,
        ativo,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar igreja')
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
          <h2 className="text-lg font-semibold text-text-primary">Editar igreja</h2>
          <p className="text-xs text-text-muted mt-1">
            Slug <code className="text-text-secondary">{church.slug}</code> não pode ser alterado.
          </p>
        </header>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={2}
              className="w-full px-3 py-2 rounded-lg bg-bg-tertiary border border-gold/15 text-sm text-text-primary focus:border-gold focus:outline-none"
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
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="accent-gold"
            />
            <span className="text-sm text-text-secondary">Igreja ativa (visível no seletor)</span>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <footer className="px-6 py-4 bg-bg-tertiary/50 border-t border-gold/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updateChurch.isPending}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={updateChurch.isPending || !nome.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-dark text-bg-primary text-sm font-semibold shadow-gold disabled:opacity-50 hover:shadow-gold-lg transition-all"
          >
            {updateChurch.isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </footer>
      </form>
    </div>
  )
}
