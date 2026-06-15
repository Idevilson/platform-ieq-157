'use client'

import { useState } from 'react'
import { usePermissions } from '@/hooks/queries/useAdminPermissions'
import { useCreatePermission, useUpdatePermission, useDeletePermission } from '@/hooks/mutations/useAdminPermissions'

export default function PermissoesPage() {
  const { data: permissions = [], isLoading } = usePermissions()
  const createPermission = useCreatePermission()
  const deletePermission = useDeletePermission()
  const updatePermission = useUpdatePermission()

  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')
    try {
      await createPermission.mutateAsync({ key: key.trim(), label: label.trim(), description: description.trim() || undefined })
      setKey(''); setLabel(''); setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar permissão')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">Permissões</h2>

      <div className="bg-bg-secondary border border-gold/10 rounded-2xl p-5 space-y-3">
        <p className="text-sm text-gold font-medium">Nova permissão (custom)</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input value={key} onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9-:]/g, ''))} placeholder="chave (ex.: check-in)" className="bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-text-primary" />
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="rótulo" className="bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-text-primary" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="descrição (opcional)" className="bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-text-primary" />
        </div>
        <button onClick={handleCreate} disabled={!key.trim() || !label.trim() || createPermission.isPending} className="px-4 py-2 bg-gold/20 text-gold font-bold rounded-lg disabled:opacity-50 border border-gold/30">
          {createPermission.isPending ? 'Criando...' : 'Criar permissão'}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <div className="bg-bg-secondary border border-gold/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <p className="p-5 text-text-secondary">Carregando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-gold/10">
                <th className="p-3">Chave</th><th className="p-3">Rótulo</th><th className="p-3">Tipo</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.key} className="border-b border-gold/5">
                  <td className="p-3 font-mono text-text-secondary">{p.key}</td>
                  <td className="p-3 text-text-primary">
                    <input
                      defaultValue={p.label}
                      onBlur={(e) => e.target.value !== p.label && updatePermission.mutate({ key: p.key, label: e.target.value, description: p.description })}
                      className="bg-transparent border-b border-transparent hover:border-gold/30 focus:border-gold/50 focus:outline-none w-full"
                    />
                  </td>
                  <td className="p-3">{p.system ? <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-gold">sistema</span> : <span className="text-xs text-text-muted">custom</span>}</td>
                  <td className="p-3 text-right">
                    {!p.system && (
                      <button onClick={() => deletePermission.mutate(p.key)} className="text-red-400 text-xs hover:underline">remover</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
