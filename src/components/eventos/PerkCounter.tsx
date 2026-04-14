"use client"

import { useQuery } from '@tanstack/react-query'

interface PerkSummary {
  id: string
  nome: string
  limiteEstoque: number
  quantidadeRestante: number
  disponivel: boolean
}

interface PerkSummaryResponse {
  summary: PerkSummary | null
}

async function fetchPerkSummary(eventId: string): Promise<PerkSummary | null> {
  const response = await fetch(`/api/events/${eventId}/perks/summary`)
  if (!response.ok) return null
  const data = (await response.json()) as PerkSummaryResponse
  return data.summary
}

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
  const { data, isLoading } = useQuery({
    queryKey: ['perk-summary', eventId],
    queryFn: () => fetchPerkSummary(eventId),
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

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
        <p className="text-lg text-text-primary font-semibold">
          Pulseiras esgotadas — {data.limiteEstoque}/{data.limiteEstoque} alocadas
        </p>
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
