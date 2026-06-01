'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdminChurches } from '@/hooks/queries/useAdminChurches'
import { useDeleteChurch } from '@/hooks/mutations/useAdminChurchMutations'
import { CreateChurchModal } from '@/components/admin/CreateChurchModal'
import { EditChurchModal } from '@/components/admin/EditChurchModal'
import type { ChurchDTO } from '@/shared/types'

export default function AdminChurchesPage() {
  const { data: churches = [], isLoading } = useAdminChurches()
  const deleteChurch = useDeleteChurch()
  const [createOpen, setCreateOpen] = useState(false)
  const [editChurch, setEditChurch] = useState<ChurchDTO | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ChurchDTO | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleteError(null)
    try {
      await deleteChurch.mutateAsync(confirmDelete.id)
      setConfirmDelete(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Gerencie as igrejas disponíveis para vínculo de usuários.
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-gold-dark text-bg-primary text-sm font-semibold shadow-gold hover:shadow-gold-lg transition-all"
        >
          + Nova igreja
        </button>
      </div>

      <div className="rounded-xl border border-gold/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-tertiary/50 text-text-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-left px-4 py-3">Cidade/UF</th>
              <th className="text-right px-4 py-3">Membros</th>
              <th className="text-center px-4 py-3">Ativo</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Carregando…
                </td>
              </tr>
            ) : churches.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Nenhuma igreja cadastrada. Clique em &quot;Nova igreja&quot; para começar.
                </td>
              </tr>
            ) : (
              churches.map((church) => (
                <tr key={church.id} className="border-t border-gold/5 hover:bg-bg-tertiary/30">
                  <td className="px-4 py-3 text-text-primary">{church.nome}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{church.slug}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {[church.cidade, church.estado].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary tabular-nums">
                    {church.totalMembros}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        church.ativo ? 'bg-emerald-500' : 'bg-text-muted/40'
                      }`}
                      title={church.ativo ? 'Ativa' : 'Inativa'}
                    />
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <Link
                      href={`/minha-conta/admin/igrejas/${church.id}`}
                      className="text-xs text-gold hover:underline"
                    >
                      Ver
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditChurch(church)}
                      className="text-xs text-gold hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(church)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateChurchModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditChurchModal
        open={editChurch !== null}
        onClose={() => setEditChurch(null)}
        church={editChurch}
      />

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-bg-secondary border border-red-500/30 rounded-xl p-5">
            <h3 className="text-base font-semibold text-text-primary">
              Excluir &quot;{confirmDelete.nome}&quot;?
            </h3>
            <p className="text-sm text-text-muted mt-2">
              Ação irreversível. Só é permitido excluir igrejas sem membros vinculados.
            </p>
            {deleteError && <p className="mt-2 text-sm text-red-400">{deleteError}</p>}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(null)
                  setDeleteError(null)
                }}
                disabled={deleteChurch.isPending}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteChurch.isPending}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm font-medium hover:bg-red-500/25 disabled:opacity-50"
              >
                {deleteChurch.isPending ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
