"use client"

import { useState } from 'react'
import { KitItemDef, KitDeliveryDTO } from '@/shared/constants'

interface Props {
  items: KitItemDef[]
  deliveries: KitDeliveryDTO[]
  elegivelLed: boolean
  onDeliverFull: () => void
  quantidadePorItem?: number
  ledQuantidade?: number
  busy?: boolean
}

export function KitDeliveryList({ items, deliveries, elegivelLed, onDeliverFull, quantidadePorItem, ledQuantidade, busy }: Props) {
  const [confirming, setConfirming] = useState(false)
  if (!items.length) return null

  const byId = new Map(deliveries.map((d) => [d.itemId, d]))
  const aplicaveis = items.filter((i) => !i.condicionalAoBrinde || elegivelLed)
  const fullyDelivered = aplicaveis.length > 0 && aplicaveis.every((i) => byId.get(i.id)?.entregue)
  const entreguePorNome = aplicaveis.map((i) => byId.get(i.id)?.entreguePorNome).find(Boolean)

  return (
    <div className="pt-4 border-t border-gold/10">
      <p className="text-sm text-gold font-medium mb-2">Kit</p>
      <div className="space-y-1.5 mb-3">
        {items.map((item) => {
          const entregue = !!byId.get(item.id)?.entregue
          const isLed = !!item.condicionalAoBrinde
          const naoContemplado = isLed && !elegivelLed
          const qtd = isLed ? ledQuantidade : quantidadePorItem
          return (
            <div key={item.id} className={`flex items-center justify-between gap-2 text-sm ${naoContemplado ? 'text-text-muted' : 'text-text-primary'}`}>
              <span className="flex items-center gap-2 min-w-0">
                {entregue
                  ? <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10l3.5 3.5L15 6" /></svg>
                  : <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${naoContemplado ? 'bg-text-muted/40' : 'bg-gold/60'}`} />}
                <span className="truncate">{item.nome}{isLed ? ' 🎁' : ''}{qtd && qtd > 1 ? ` ×${qtd}` : ''}</span>
              </span>
              {naoContemplado && <span className="text-xs whitespace-nowrap">não contemplado</span>}
            </div>
          )
        })}
      </div>

      {fullyDelivered ? (
        <p className="text-sm text-green-400 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10l3.5 3.5L15 6" /></svg>
          Kit entregue{entreguePorNome ? ` por ${entreguePorNome}` : ''}
        </p>
      ) : confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Não dá pra desfazer.</span>
          <button onClick={() => { onDeliverFull(); setConfirming(false) }} disabled={busy} className="text-sm font-bold px-3 py-2 rounded-lg bg-green-500 text-white disabled:opacity-50">
            Confirmar entrega
          </button>
          <button onClick={() => setConfirming(false)} disabled={busy} className="text-sm px-3 py-2 rounded-lg text-text-secondary border border-gold/20">
            Cancelar
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} disabled={busy} className="w-full py-2.5 rounded-lg bg-gold/15 text-gold border border-gold/30 font-semibold disabled:opacity-50">
          {busy ? 'Entregando...' : 'Entregar kit completo'}
        </button>
      )}

      {!elegivelLed && items.some((i) => i.condicionalAoBrinde) && (
        <p className="text-xs text-text-muted mt-2">Sem direito à pulseira LED (não atendeu aos critérios do brinde).</p>
      )}
    </div>
  )
}
