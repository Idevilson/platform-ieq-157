'use client'

import { useState } from 'react'
import { useSendDailyReport, useDownloadInscriptionsSnapshot } from '@/hooks/mutations/useAdminEventMutations'
import { SendDailyReportResponse } from '@/lib/services/adminService'

interface DailyReportCardProps {
  eventId: string
}

type ActionResult =
  | { kind: 'success'; data: SendDailyReportResponse }
  | { kind: 'error'; message: string }
  | { kind: 'snapshot'; filename: string }

export function DailyReportCard({ eventId }: DailyReportCardProps) {
  const sendReport = useSendDailyReport()
  const downloadSnapshot = useDownloadInscriptionsSnapshot()
  const [result, setResult] = useState<ActionResult | null>(null)
  const [lastAction, setLastAction] = useState<'preview' | 'send' | 'snapshot' | null>(null)

  const isLoading = sendReport.isPending || downloadSnapshot.isPending

  const handleAction = async (dryRun: boolean) => {
    setLastAction(dryRun ? 'preview' : 'send')
    setResult(null)
    try {
      const data = await sendReport.mutateAsync({ eventId, dryRun })
      setResult({ kind: 'success', data })
    } catch (error) {
      setResult({ kind: 'error', message: error instanceof Error ? error.message : 'Erro' })
    }
  }

  const handleSnapshot = async () => {
    setLastAction('snapshot')
    setResult(null)
    try {
      const { filename } = await downloadSnapshot.mutateAsync(eventId)
      setResult({ kind: 'snapshot', filename })
    } catch (error) {
      setResult({ kind: 'error', message: error instanceof Error ? error.message : 'Erro' })
    }
  }

  return (
    <div className="bg-bg-secondary border border-gold/10 rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <span>📊</span> Relatório no WhatsApp
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Envia o resumo de inscrições no grupo configurado. O cron já dispara automaticamente todo dia às 08h.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleSnapshot}
            disabled={isLoading}
            title="Baixa um JSON com todos os dados do evento pra testar layout de PDF offline"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && lastAction === 'snapshot' ? 'Baixando...' : '📥 Snapshot JSON'}
          </button>
          <button
            type="button"
            onClick={() => handleAction(true)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && lastAction === 'preview' ? 'Carregando...' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => handleAction(false)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-gold text-bg-primary hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && lastAction === 'send' ? 'Enviando...' : 'Enviar agora'}
          </button>
        </div>
      </div>

      {result && <ResultBlock result={result} />}
    </div>
  )
}

function ResultBlock({ result }: { result: ActionResult }) {
  if (result.kind === 'error') {
    return (
      <div className="mt-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <p className="text-sm font-medium text-red-400">Erro ao executar</p>
        <p className="text-xs text-text-secondary mt-1 break-words">{result.message}</p>
      </div>
    )
  }

  if (result.kind === 'snapshot') {
    return (
      <div className="mt-2 p-4 rounded-lg bg-sky-500/10 border border-sky-500/30">
        <p className="text-sm font-medium text-sky-400 mb-1">📥 Snapshot baixado</p>
        <p className="text-xs text-text-secondary break-words">
          Arquivo: <code className="text-sky-400 font-mono">{result.filename}</code>
        </p>
        <p className="text-xs text-text-muted mt-2">
          Contém CPF e telefone das inscrições — não commite no git.
        </p>
      </div>
    )
  }

  const { data } = result

  if (data.skipped === 'event-ended') {
    return (
      <div className="mt-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <p className="text-sm font-medium text-yellow-400">Relatório não enviado</p>
        <p className="text-xs text-text-secondary mt-1">
          O evento já terminou (`dataFim` no passado). Para reativar, troque o `REPORT_EVENT_ID` no Vercel.
        </p>
      </div>
    )
  }

  if (data.dryRun && data.preview) {
    return (
      <div className="mt-2 p-4 rounded-lg bg-bg-tertiary border border-gold/20">
        <p className="text-sm font-medium text-gold mb-2">Preview (mensagem montada — não enviada)</p>
        <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono leading-relaxed">{data.preview}</pre>
      </div>
    )
  }

  if (data.sent) {
    return (
      <div className="mt-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
        <p className="text-sm font-medium text-green-400 mb-1">✅ Mensagem enviada</p>
        <p className="text-xs text-text-muted font-mono">
          status: {data.sent.status} · id: {data.sent.messageId}
        </p>
      </div>
    )
  }

  return null
}
