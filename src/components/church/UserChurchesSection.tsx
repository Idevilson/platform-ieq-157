'use client'

import { useState } from 'react'
import { useUserChurch } from '@/hooks/queries/useUserChurch'
import { usePublicChurches } from '@/hooks/queries/useChurches'
import {
  useClearUserChurch,
  useSetUserChurch,
} from '@/hooks/mutations/useUserChurchMutations'
import { ChurchSelectorModal } from './ChurchSelectorModal'

export function UserChurchesSection() {
  const { data: userChurch, isLoading } = useUserChurch()
  const { data: availableChurches = [] } = usePublicChurches()
  const setChurch = useSetUserChurch()
  const clearChurch = useClearUserChurch()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const current = userChurch?.church ?? null
  const mode = current ? 'change' : 'initial'

  const handleConfirm = async (churchId: string) => {
    await setChurch.mutateAsync(churchId)
  }

  const handleClear = async () => {
    await clearChurch.mutateAsync()
    setConfirmClear(false)
  }

  if (isLoading) {
    return (
      <section className="rounded-xl border border-gold/10 bg-bg-secondary p-5">
        <h2 className="text-base font-semibold text-text-primary mb-3">Minha igreja</h2>
        <div className="h-20 bg-bg-tertiary rounded-lg animate-pulse" />
      </section>
    )
  }

  return (
    <>
      <section className="rounded-xl border border-gold/10 bg-bg-secondary p-5">
        <h2 className="text-base font-semibold text-text-primary mb-3">Minha igreja</h2>

        {current ? (
          <div className="rounded-lg border border-gold/15 bg-bg-tertiary p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">{current.nome}</p>
              {(current.cidade || current.estado) && (
                <p className="text-xs text-text-muted mt-1">
                  {[current.cidade, current.estado].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-gold/30 text-xs text-gold hover:bg-gold/5 transition-colors"
              >
                Trocar igreja
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Remover vínculo
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-amber-300 font-medium">Você ainda não declarou sua igreja</p>
              <p className="text-xs text-text-muted mt-1">
                Vincule-se a uma igreja para identificar sua comunidade.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors"
            >
              Vincular-se →
            </button>
          </div>
        )}
      </section>

      <ChurchSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        churches={availableChurches}
        currentChurchId={userChurch?.churchId ?? null}
        mode={mode}
      />

      {confirmClear && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-bg-secondary border border-red-500/30 rounded-xl p-5">
            <h3 className="text-base font-semibold text-text-primary">Remover vínculo?</h3>
            <p className="text-sm text-text-muted mt-2">
              Você ficará sem igreja declarada. Pode vincular-se novamente a qualquer momento.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                disabled={clearChurch.isPending}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={clearChurch.isPending}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm font-medium hover:bg-red-500/25 disabled:opacity-50"
              >
                {clearChurch.isPending ? 'Removendo…' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
