'use client'

import { useState } from 'react'
import { BatchLookupResult } from '@/shared/types/inscription'
import { INSCRIPTION_PAYMENT_METHOD_LABELS } from '@/shared/constants'

function batchStatusLabel(status: string) {
  if (status === 'confirmado') return { label: 'Confirmado', className: 'bg-green-500/20 text-green-400' }
  if (status === 'cancelado') return { label: 'Cancelado', className: 'bg-red-500/20 text-red-400' }
  return { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400' }
}

const GENDER_LABEL: Record<string, string> = {
  masculino: 'M',
  feminino: 'F',
}

interface Props {
  batch: BatchLookupResult
  onViewPayment: () => void
}

export function BatchInscriptionCard({ batch, onViewPayment }: Props) {
  const { label, className } = batchStatusLabel(batch.status)
  const [showParticipants, setShowParticipants] = useState(false)

  return (
    <div className="bg-bg-secondary border border-gold/20 rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>{label}</span>
              <span className="text-xs text-text-muted">
                {INSCRIPTION_PAYMENT_METHOD_LABELS[batch.preferredPaymentMethod]}
              </span>
            </div>
            <p className="text-sm text-text-secondary">{batch.totalParticipantes} participantes · {batch.cidade}</p>
          </div>
          <p className="text-gold font-bold text-lg whitespace-nowrap">{batch.valorTotalFormatado}</p>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowParticipants(v => !v)}
            className="flex-1 py-2.5 text-sm border border-gold/20 rounded-lg text-text-secondary hover:text-gold hover:border-gold/40 transition-colors"
          >
            {showParticipants ? 'Ocultar participantes' : 'Ver participantes'}
          </button>
          <button
            onClick={onViewPayment}
            className="flex-1 btn-primary py-2.5 text-sm"
          >
            Ver detalhes do pagamento
          </button>
        </div>
      </div>

      {showParticipants && (
        <div className="border-t border-gold/10 px-5 py-4">
          <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            Participantes ({batch.participantes.length})
          </h4>
          <ul className="space-y-2">
            {batch.participantes.map((p, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{p.nome}</span>
                <span className="text-text-muted text-xs">{GENDER_LABEL[p.sexo] ?? p.sexo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
