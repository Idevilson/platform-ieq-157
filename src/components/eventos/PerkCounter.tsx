"use client"

import { usePerkSummary } from '@/hooks/queries/usePerkSummary'

interface PerkCounterProps {
  eventId: string
  title?: string
  description?: string
}

export function PerkCounter({
  eventId,
  title = '🎁 Brinde Especial',
  description,
}: PerkCounterProps) {
  const { data, isLoading } = usePerkSummary(eventId)

  if (isLoading) {
    return (
      <div className="card max-w-xl mx-auto text-center py-8">
        <div className="w-8 h-8 mx-auto border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const progressPercent = data.limiteEstoque === 0
    ? 0
    : Math.round((1 - data.quantidadeRestante / data.limiteEstoque) * 100)

  const esgotado = !data.disponivel

  return (
    <div className="card max-w-xl mx-auto text-center border-gold/40">
      <h3 className="text-xl font-bold text-gold mb-2">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-4">{description}</p>}

      {esgotado ? (
        <div className="flex flex-col items-center gap-5 py-2">
          {/* Ícone com badge de esgotado */}
          <div className="relative inline-flex">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2"
              style={{ background: 'rgba(212,160,23,0.06)', borderColor: 'rgba(212,160,23,0.2)' }}
            >
              🎁
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border"
              style={{ background: '#130505', borderColor: 'rgba(239,68,68,0.5)', color: '#f87171' }}
            >
              ✕
            </span>
          </div>

          {/* Badge */}
          <span
            className="text-[11px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', borderColor: 'rgba(239,68,68,0.25)' }}
          >
            Brinde Esgotado
          </span>

          {/* Contagem final */}
          <div className="text-center">
            <p className="text-4xl font-black" style={{ color: 'rgba(212,160,23,0.45)' }}>
              {data.limiteEstoque}{' '}
              <span className="text-2xl font-normal" style={{ color: 'rgba(255,255,255,0.2)' }}>
                / {data.limiteEstoque}
              </span>
            </p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              brindes alocados
            </p>
          </div>

          {/* Barra 100% preenchida */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full w-full rounded-full"
              style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.5), rgba(239,68,68,0.7))' }}
            />
          </div>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Todos os brindes foram alocados para os primeiros inscritos confirmados.
          </p>
        </div>
      ) : (
        <>
          <p className="text-3xl font-black text-gold mb-2">
            {data.quantidadeRestante} / {data.limiteEstoque}
          </p>
          <p className="text-sm text-text-muted mb-4">
            pulseiras restantes para os primeiros pagantes confirmados
          </p>
          <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}
