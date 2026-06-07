import { useQuery } from '@tanstack/react-query'

interface PerkSummary {
  id: string
  nome: string
  limiteEstoque: number
  quantidadeRestante: number
  disponivel: boolean
}

async function fetchPerkSummary(eventId: string): Promise<PerkSummary | null> {
  const response = await fetch(`/api/events/${eventId}/perks/summary`)
  if (!response.ok) return null
  const data = (await response.json()) as { summary: PerkSummary | null }
  return data.summary
}

export function usePerkSummary(eventId: string) {
  return useQuery({
    queryKey: ['perk-summary', eventId],
    queryFn: () => fetchPerkSummary(eventId),
    staleTime: 5 * 60 * 1000,
  })
}
