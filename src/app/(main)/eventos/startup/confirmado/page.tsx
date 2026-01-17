"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function StartupConfirmado() {
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-200px)]">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gold mb-4">Inscricao Confirmada!</h1>

        <p className="text-text-secondary mb-8">
          Sua inscricao para o <strong className="text-gold">STARTUP</strong> foi realizada com sucesso!
        </p>

        <div className="card text-left mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Detalhes do Evento</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gold/10">
              <span className="text-sm text-text-muted">Evento:</span>
              <span className="text-sm text-text-primary">STARTUP - A Uncao dos Quatro Seres</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gold/10">
              <span className="text-sm text-text-muted">Datas:</span>
              <span className="text-sm text-text-primary">30 e 31 de Janeiro | 01 de Fevereiro de 2026</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Local:</span>
              <span className="text-sm text-text-primary">IEQ Campo 157 - Redencao/PA</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg text-sm text-text-secondary mb-8">
          <p>
            Guarde este comprovante. Voce tambem recebera mais informacoes
            por WhatsApp sobre o evento.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="btn-secondary"
            onClick={() => router.push('/')}
          >
            Voltar ao Inicio
          </button>
          <button
            className="btn-primary"
            onClick={() => router.push('/eventos/startup')}
          >
            Ver Detalhes do Evento
          </button>
        </div>
      </div>
    </div>
  )
}
