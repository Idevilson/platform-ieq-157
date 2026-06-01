'use client'

import { useEffect, useState } from 'react'
import { useChurchMembers } from '@/hooks/queries/useChurchMembers'
import { useAdminRemoveMember } from '@/hooks/mutations/useAdminChurchMutations'

interface ChurchMembersListProps {
  churchId: string
}

export function ChurchMembersList({ churchId }: ChurchMembersListProps) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [limit, setLimit] = useState(50)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading } = useChurchMembers(churchId, {
    search: debouncedSearch || undefined,
    limit,
  })
  const removeMember = useAdminRemoveMember()

  const handleRemove = async () => {
    if (!confirmRemove) return
    try {
      await removeMember.mutateAsync({ churchId, userId: confirmRemove })
      setConfirmRemove(null)
    } catch {
      // erro fica no estado da mutation; UI mostra abaixo
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nome ou email"
          className="flex-1 max-w-md px-3 py-2 rounded-lg bg-bg-tertiary border border-gold/15 text-sm text-text-primary focus:border-gold focus:outline-none"
        />
        <span className="text-xs text-text-muted">
          {data?.total ?? 0} membro{(data?.total ?? 0) === 1 ? '' : 's'}
        </span>
      </div>

      <div className="rounded-xl border border-gold/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-tertiary/50 text-text-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-right px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-text-muted">
                  Carregando…
                </td>
              </tr>
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-text-muted">
                  Nenhum membro encontrado.
                </td>
              </tr>
            ) : (
              data?.items.map((member) => (
                <tr key={member.userId} className="border-t border-gold/5 hover:bg-bg-tertiary/30">
                  <td className="px-4 py-3 text-text-primary">{member.nome}</td>
                  <td className="px-4 py-3 text-text-secondary">{member.email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(member.userId)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remover vínculo
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > limit && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + 50)}
            className="px-4 py-2 text-sm text-gold hover:underline"
          >
            Carregar mais
          </button>
        </div>
      )}

      {confirmRemove && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-bg-secondary border border-red-500/30 rounded-xl p-5">
            <h3 className="text-base font-semibold text-text-primary">Remover vínculo?</h3>
            <p className="text-sm text-text-muted mt-2">
              O usuário ficará sem igreja declarada. Ele poderá vincular-se novamente pelo próprio painel.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRemove(null)}
                disabled={removeMember.isPending}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={removeMember.isPending}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm font-medium hover:bg-red-500/25 disabled:opacity-50"
              >
                {removeMember.isPending ? 'Removendo…' : 'Remover'}
              </button>
            </div>
            {removeMember.isError && (
              <p className="mt-3 text-sm text-red-400">
                {(removeMember.error as Error).message}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
