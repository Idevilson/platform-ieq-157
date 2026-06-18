'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { operacaoService } from '@/lib/services/operacaoService'
import { useDownloadInscriptionsPdf } from '@/hooks/mutations/useAdminEventMutations'
import { EventSelect } from '@/components/operacao/EventSelect'
import { EVENT_OPS_PERMISSIONS } from '@/shared/constants'

export default function RelatoriosPage() {
  const { isAdmin, permissions, loading, profileLoading, user } = useAuth()
  const router = useRouter()
  const canAccess = isAdmin || permissions.some((g) => EVENT_OPS_PERMISSIONS.includes(g.key))

  useEffect(() => {
    if (loading || profileLoading) return
    if (!user) { router.push('/login'); return }
    if (!user.profile) return
    if (!canAccess) router.push('/minha-conta')
  }, [loading, profileLoading, user, canAccess, router])

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['operacao', 'events'],
    queryFn: () => operacaoService.listEvents(),
    enabled: canAccess,
    staleTime: 5 * 60 * 1000,
  })

  const [eventId, setEventId] = useState('')
  const downloadPdf = useDownloadInscriptionsPdf()
  const [lastDownload, setLastDownload] = useState<{ filename: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (!eventId) return
    setError(null)
    setLastDownload(null)
    try {
      const result = await downloadPdf.mutateAsync(eventId)
      setLastDownload(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar PDF')
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <p className="text-text-secondary">Carregando...</p>
      </div>
    )
  }
  if (!canAccess) return null

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <Link
          href="/minha-conta/operacao"
          className="text-sm text-text-secondary hover:text-gold transition-colors no-underline inline-flex items-center gap-1"
        >
          ← Voltar para Operação
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gold">Relatórios</h1>
        <p className="text-sm text-text-muted mt-1">
          Documentos gerados sob demanda a partir dos dados atuais do evento.
        </p>
      </div>

      <div className="bg-bg-secondary border border-gold/20 rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Inscrições por cidade (PDF)</h2>
          <p className="text-sm text-text-muted mt-1">
            Lista detalhada de todas as inscrições agrupadas por cidade, com Redenção primeiro. Inclui avulsas e participantes de lotes coletivos.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider">Evento</label>
          <EventSelect events={events} value={eventId} onChange={setEventId} loading={eventsLoading} />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!eventId || downloadPdf.isPending}
          className="w-full sm:w-auto px-6 py-3 bg-gold text-bg-primary font-bold rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {downloadPdf.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />
              Gerando PDF...
            </>
          ) : (
            <>📄 Gerar e baixar PDF</>
          )}
        </button>

        {lastDownload && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-sm font-medium text-green-400 mb-1">✅ PDF gerado</p>
            <p className="text-xs text-text-secondary break-words">
              Arquivo: <code className="text-green-400 font-mono">{lastDownload.filename}</code>
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-sm font-medium text-red-400">Erro ao gerar PDF</p>
            <p className="text-xs text-text-secondary mt-1 break-words">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
