'use client'

import { useEffect, useState } from 'react'
import type { ChurchSummaryDTO } from '@/shared/types'

interface ChurchSelectorModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (churchId: string) => Promise<void>
  churches: ChurchSummaryDTO[]
  currentChurchId?: string | null
  mode?: 'initial' | 'change'
  loading?: boolean
}

export function ChurchSelectorModal({
  open,
  onClose,
  onConfirm,
  churches,
  currentChurchId,
  mode = 'initial',
  loading = false,
}: ChurchSelectorModalProps) {
  const availableChurches = mode === 'change'
    ? churches.filter((c) => c.id !== currentChurchId)
    : churches

  const [selected, setSelected] = useState<string | null>(
    currentChurchId ?? (availableChurches.length === 1 ? availableChurches[0].id : null)
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSelected(currentChurchId ?? (availableChurches.length === 1 ? availableChurches[0].id : null))
      setError(null)
      setSubmitting(false)
    }
  }, [open, currentChurchId, availableChurches])

  if (!open) return null

  const handleConfirm = async () => {
    if (!selected) {
      setError('Selecione uma igreja para continuar')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onConfirm(selected)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao vincular igreja')
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'change' ? 'Trocar de igreja' : 'De qual igreja você faz parte?'
  const description =
    mode === 'change'
      ? 'Selecione a nova igreja. O vínculo anterior será substituído.'
      : 'Selecione uma opção. Você pode trocar a qualquer momento na sua conta.'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 animate-dropdown"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-bg-secondary border border-gold/20 rounded-2xl shadow-dark-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gold/10">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <p className="text-sm text-text-muted mt-1">{description}</p>
        </div>

        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              <div className="h-14 bg-bg-tertiary rounded-lg animate-pulse" />
              <div className="h-14 bg-bg-tertiary rounded-lg animate-pulse" />
            </div>
          ) : availableChurches.length === 0 ? (
            <p className="text-sm text-text-muted py-6 text-center">
              Nenhuma igreja disponível no momento.
            </p>
          ) : (
            <ul className="space-y-2">
              {availableChurches.map((church) => {
                const isSelected = selected === church.id
                return (
                  <li key={church.id}>
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-gold bg-gold/5'
                          : 'border-gold/10 hover:border-gold/30 hover:bg-bg-tertiary'
                      }`}
                    >
                      <input
                        type="radio"
                        name="church"
                        value={church.id}
                        checked={isSelected}
                        onChange={() => setSelected(church.id)}
                        className="mt-1 accent-gold"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">{church.nome}</p>
                        {(church.cidade || church.estado) && (
                          <p className="text-xs text-text-muted mt-0.5">
                            {[church.cidade, church.estado].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}

          <p className="text-xs text-text-muted mt-4">
            Outras unidades aparecerão aqui conforme forem cadastradas.
          </p>

          {error && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="px-6 py-4 bg-bg-tertiary/50 border-t border-gold/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
          >
            {mode === 'change' ? 'Cancelar' : 'Agora não'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || !selected || availableChurches.length === 0}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-dark text-bg-primary text-sm font-semibold shadow-gold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-gold-lg transition-all"
          >
            {submitting ? 'Salvando…' : 'Confirmar →'}
          </button>
        </div>
      </div>
    </div>
  )
}
