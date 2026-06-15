'use client'

import { useState } from 'react'
import { usePermissions, useAdminUsers, useEventTeam } from '@/hooks/queries/useAdminPermissions'
import { useSetUserPermissions } from '@/hooks/mutations/useAdminPermissions'
import { useAdminEventsList } from '@/hooks/queries/useAdminEvents'
import { AdminUserDTO } from '@/lib/services/adminService'
import { GLOBAL_PERMISSION_SCOPE } from '@/shared/constants'

interface ScopeState {
  enabled: boolean
  global: boolean
  eventIds: string[]
}

function buildInitialScopes(user: AdminUserDTO): Record<string, ScopeState> {
  const scopes: Record<string, ScopeState> = {}
  for (const grant of user.permissions) {
    const global = grant.eventIds.includes(GLOBAL_PERMISSION_SCOPE)
    scopes[grant.key] = { enabled: true, global, eventIds: global ? [] : grant.eventIds }
  }
  return scopes
}

export default function UsuariosPage() {
  const [query, setQuery] = useState('')
  const { data: users = [], isLoading } = useAdminUsers(query)
  const { data: permissions = [] } = usePermissions()
  const { data: eventsData } = useAdminEventsList()
  const events = eventsData?.events ?? []
  const setUserPermissions = useSetUserPermissions()

  const [selected, setSelected] = useState<AdminUserDTO | null>(null)
  const [scopes, setScopes] = useState<Record<string, ScopeState>>({})
  const [savedMsg, setSavedMsg] = useState('')

  const selectUser = (user: AdminUserDTO) => {
    setSelected(user)
    setScopes(buildInitialScopes(user))
    setSavedMsg('')
  }

  const toggleEnabled = (key: string) => {
    setScopes((prev) => {
      const current = prev[key] ?? { enabled: false, global: true, eventIds: [] }
      return { ...prev, [key]: { ...current, enabled: !current.enabled } }
    })
  }

  const setGlobal = (key: string, global: boolean) => {
    setScopes((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { enabled: true, eventIds: [] }), enabled: true, global, eventIds: global ? [] : (prev[key]?.eventIds ?? []) } }))
  }

  const toggleEvent = (key: string, eventId: string) => {
    setScopes((prev) => {
      const current = prev[key] ?? { enabled: true, global: false, eventIds: [] }
      const has = current.eventIds.includes(eventId)
      return { ...prev, [key]: { ...current, enabled: true, global: false, eventIds: has ? current.eventIds.filter((e) => e !== eventId) : [...current.eventIds, eventId] } }
    })
  }

  const handleSave = async () => {
    if (!selected) return
    setSavedMsg('')
    const grants = Object.entries(scopes)
      .filter(([, s]) => s.enabled && (s.global || s.eventIds.length > 0))
      .map(([key, s]) => ({ key, eventIds: s.global ? [GLOBAL_PERMISSION_SCOPE] : s.eventIds }))
    try {
      const updated = await setUserPermissions.mutateAsync({ userId: selected.id, grants })
      setSelected(updated)
      setSavedMsg('Permissões salvas.')
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-primary">Usuários & Permissões</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-bg-secondary border border-gold/10 rounded-2xl p-5 space-y-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, email ou CPF" className="w-full bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-text-primary" />
          {isLoading ? <p className="text-text-secondary text-sm">Carregando...</p> : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {users.map((u) => (
                <button key={u.id} onClick={() => selectUser(u)} className={`w-full text-left px-3 py-2 rounded-lg ${selected?.id === u.id ? 'bg-gold/15' : 'hover:bg-white/5'}`}>
                  <span className="text-text-primary text-sm">{u.nome}</span>
                  <span className="text-text-muted text-xs block">{u.email}{u.role === 'admin' ? ' · admin' : ''}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-bg-secondary border border-gold/10 rounded-2xl p-5">
          {!selected ? (
            <p className="text-text-secondary text-sm">Selecione um usuário para atribuir permissões.</p>
          ) : selected.role === 'admin' ? (
            <p className="text-text-secondary text-sm">{selected.nome} é admin — já tem todas as permissões.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-gold font-medium">{selected.nome}</p>
              {permissions.map((perm) => {
                const s = scopes[perm.key] ?? { enabled: false, global: true, eventIds: [] }
                return (
                  <div key={perm.key} className="border-t border-gold/10 pt-3">
                    <label className="flex items-center gap-2 text-sm text-text-primary">
                      <input type="checkbox" checked={s.enabled} onChange={() => toggleEnabled(perm.key)} />
                      {perm.label}
                    </label>
                    {s.enabled && (
                      <div className="mt-2 ml-6 space-y-1">
                        <label className="flex items-center gap-2 text-xs text-text-secondary">
                          <input type="checkbox" checked={s.global} onChange={(e) => setGlobal(perm.key, e.target.checked)} /> Todos os eventos
                        </label>
                        {!s.global && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {events.map((ev) => (
                              <label key={ev.id} className={`text-xs px-2 py-1 rounded-lg border cursor-pointer ${s.eventIds.includes(ev.id) ? 'bg-gold/20 text-gold border-gold/40' : 'bg-bg-tertiary text-text-secondary border-transparent'}`}>
                                <input type="checkbox" className="hidden" checked={s.eventIds.includes(ev.id)} onChange={() => toggleEvent(perm.key, ev.id)} />
                                {ev.titulo ?? ev.id}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              <button onClick={handleSave} disabled={setUserPermissions.isPending} className="w-full py-2.5 bg-gold/20 text-gold font-bold rounded-lg disabled:opacity-50 border border-gold/30">
                {setUserPermissions.isPending ? 'Salvando...' : 'Salvar permissões'}
              </button>
              {savedMsg && <p className="text-sm text-green-400 text-center">{savedMsg}</p>}
            </div>
          )}
        </div>
      </div>

      <TeamView events={events} />
    </div>
  )
}

function TeamView({ events }: { events: { id: string; titulo?: string }[] }) {
  const [eventId, setEventId] = useState('')
  const { data: team = [], isLoading } = useEventTeam(eventId)

  return (
    <div className="bg-bg-secondary border border-gold/10 rounded-2xl p-5 space-y-3">
      <p className="text-gold font-medium">Time do evento</p>
      <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-text-primary">
        <option value="">Selecione o evento...</option>
        {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.titulo ?? ev.id}</option>)}
      </select>
      {eventId && (isLoading ? <p className="text-text-secondary text-sm">Carregando...</p> : team.length === 0 ? (
        <p className="text-text-secondary text-sm">Ninguém com permissões de operação neste evento ainda.</p>
      ) : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-text-muted"><th className="p-2">Membro</th><th className="p-2">Permissões</th></tr></thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.userId} className="border-t border-gold/5">
                <td className="p-2 text-text-primary">{m.nome}<span className="text-text-muted text-xs block">{m.email}</span></td>
                <td className="p-2 text-text-secondary">{m.permissions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}
