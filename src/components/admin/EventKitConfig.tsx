"use client"

import { useState } from 'react'
import { KitItemDef } from '@/shared/constants'
import { useConfigureEventKit } from '@/hooks/mutations/useEventKit'

export function EventKitConfig({ eventId, kitItems }: { eventId: string; kitItems: KitItemDef[] }) {
  const [items, setItems] = useState<KitItemDef[]>(kitItems)
  const [savedMsg, setSavedMsg] = useState('')
  const configure = useConfigureEventKit()

  const update = (index: number, patch: Partial<KitItemDef>) =>
    setItems(items.map((it, i) => (i === index ? { ...it, ...patch } : it)))

  const save = async () => {
    setSavedMsg('')
    try {
      const saved = await configure.mutateAsync({ eventId, items: items.filter((it) => it.nome.trim()) })
      setItems(saved)
      setSavedMsg('Kit salvo.')
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : 'Erro ao salvar o kit')
    }
  }

  return (
    <div className="bg-bg-secondary border border-gold/10 rounded-2xl p-5 space-y-3">
      <p className="text-gold font-medium">Kit do evento</p>
      <p className="text-xs text-text-secondary">Itens entregues aos confirmados. &quot;Só com brinde&quot; = entregue apenas a quem ganhou o brinde (ex.: pulseira LED).</p>

      {items.map((item, i) => (
        <div key={i} className="flex flex-wrap items-center gap-3">
          <input
            value={item.nome}
            onChange={(e) => update(i, { nome: e.target.value })}
            placeholder="Item (ex.: Pulseira holográfica)"
            className="flex-1 min-w-44 bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-text-primary"
          />
          <label className="text-xs text-text-secondary flex items-center gap-1">
            <input type="checkbox" checked={!!item.condicionalAoBrinde} onChange={(e) => update(i, { condicionalAoBrinde: e.target.checked })} /> só com brinde
          </label>
          <label className="text-xs text-text-secondary flex items-center gap-1">
            <input type="checkbox" checked={!!item.porTamanho} onChange={(e) => update(i, { porTamanho: e.target.checked })} /> por tamanho
          </label>
          <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-red-400 text-xs hover:underline">remover</button>
        </div>
      ))}

      <div className="flex gap-3 items-center">
        <button onClick={() => setItems([...items, { id: '', nome: '', condicionalAoBrinde: false, porTamanho: false }])} className="text-sm text-gold">
          + adicionar item
        </button>
        <button onClick={save} disabled={configure.isPending} className="ml-auto px-4 py-2 bg-gold/20 text-gold font-bold rounded-lg disabled:opacity-50 border border-gold/30">
          {configure.isPending ? 'Salvando...' : 'Salvar kit'}
        </button>
      </div>
      {savedMsg && <p className="text-sm text-green-400">{savedMsg}</p>}
    </div>
  )
}
