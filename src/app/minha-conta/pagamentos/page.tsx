'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRequireAuth } from '@/hooks'

interface Pagamento {
  id: string
  inscricaoId: string
  eventoTitulo: string
  valor: number
  metodo: 'pix' | 'boleto' | 'cartao'
  status: 'pendente' | 'processando' | 'pago' | 'cancelado' | 'expirado'
  criadoEm: string
  pagoEm?: string
  pixCopiaECola?: string
  boletoUrl?: string
}

export default function MeusPagamentosPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPagamentos = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      setPagamentos([])
      setLoading(false)
    }

    if (user) {
      fetchPagamentos()
    }
  }, [user])

  const copyPixCode = async (pagamento: Pagamento) => {
    if (pagamento.pixCopiaECola) {
      await navigator.clipboard.writeText(pagamento.pixCopiaECola)
      setCopiedId(pagamento.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Meus Pagamentos</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="spinner" />
          <p className="text-text-secondary">Carregando pagamentos...</p>
        </div>
      </div>
    )
  }

  const getStatusConfig = (status: Pagamento['status']) => {
    const config = {
      pendente: { label: 'Pendente', class: 'badge-warning', icon: '⏳' },
      processando: { label: 'Processando', class: 'badge-info', icon: '🔄' },
      pago: { label: 'Pago', class: 'badge-success', icon: '✓' },
      cancelado: { label: 'Cancelado', class: 'badge-danger', icon: '✕' },
      expirado: { label: 'Expirado', class: 'badge-muted', icon: '⌛' }
    }
    return config[status]
  }

  const getMetodoLabel = (metodo: Pagamento['metodo']) => {
    const labels = { pix: 'PIX', boleto: 'Boleto', cartao: 'Cartão' }
    return labels[metodo]
  }

  const getMetodoIcon = (metodo: Pagamento['metodo']) => {
    const icons = { pix: '⚡', boleto: '📄', cartao: '💳' }
    return icons[metodo]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Meus Pagamentos</h1>
        <p className="text-text-secondary">Acompanhe o status dos seus pagamentos</p>
      </div>

      {pagamentos.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-12">
          <div className="text-5xl mb-4 opacity-60">💳</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Nenhum pagamento encontrado</h2>
          <p className="text-text-secondary mb-6">Você ainda não realizou nenhum pagamento.</p>
          <Link href="/eventos" className="btn-primary">
            Ver eventos disponíveis
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pagamentos.map(pagamento => {
            const statusConfig = getStatusConfig(pagamento.status)

            return (
              <div key={pagamento.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 pb-4 border-b border-gold/10">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{pagamento.eventoTitulo}</h3>
                    <span className="text-xs text-text-muted font-mono">#{pagamento.id.slice(-8)}</span>
                  </div>
                  <span className={`badge ${statusConfig.class} flex items-center gap-1.5`}>
                    <span>{statusConfig.icon}</span>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="block text-xs text-text-muted uppercase tracking-wide mb-1">Valor</span>
                    <span className="text-lg font-semibold text-gold">{formatCurrency(pagamento.valor)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted uppercase tracking-wide mb-1">Método</span>
                    <span className="text-sm text-text-primary flex items-center gap-1.5">
                      <span>{getMetodoIcon(pagamento.metodo)}</span>
                      {getMetodoLabel(pagamento.metodo)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-text-muted uppercase tracking-wide mb-1">Criado em</span>
                    <span className="text-sm text-text-primary">{formatDate(pagamento.criadoEm)}</span>
                  </div>
                  {pagamento.pagoEm && (
                    <div>
                      <span className="block text-xs text-text-muted uppercase tracking-wide mb-1">Pago em</span>
                      <span className="text-sm text-text-primary">{formatDate(pagamento.pagoEm)}</span>
                    </div>
                  )}
                </div>

                {(pagamento.status === 'pendente' || pagamento.status === 'processando') && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gold/10">
                    {pagamento.metodo === 'pix' && pagamento.pixCopiaECola && (
                      <button
                        onClick={() => copyPixCode(pagamento)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-sm rounded-lg hover:-translate-y-0.5 hover:shadow-lg transition-all"
                      >
                        <span>{copiedId === pagamento.id ? '✓' : '⚡'}</span>
                        {copiedId === pagamento.id ? 'Código copiado!' : 'Copiar código PIX'}
                      </button>
                    )}
                    {pagamento.metodo === 'boleto' && pagamento.boletoUrl && (
                      <a
                        href={pagamento.boletoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <span>📄</span>
                        Ver boleto
                      </a>
                    )}
                    <Link href={`/minha-conta/pagamentos/${pagamento.id}`} className="btn-secondary">
                      Ver detalhes
                    </Link>
                  </div>
                )}

                {pagamento.status === 'pago' && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-green-500/10 border border-green-500/25 rounded-lg text-green-500 text-sm">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    Pagamento confirmado
                  </div>
                )}

                {pagamento.status === 'expirado' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 p-3 bg-gray-500/10 border border-gray-500/25 rounded-lg text-text-secondary text-sm">
                    <span>Este pagamento expirou.</span>
                    <Link href="/eventos" className="text-gold hover:text-gold-light transition-colors no-underline">
                      Fazer nova inscrição
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
