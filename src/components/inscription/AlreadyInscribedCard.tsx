'use client'

import { useState } from 'react'
import Link from 'next/link'
import { InscriptionDTO } from '@/shared/types'
import { INSCRIPTION_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/shared/constants'
import { useUpdateCampoMissionario } from '@/hooks/mutations/useInscriptionMutations'

interface AlreadyInscribedCardProps {
  inscription: InscriptionDTO
  eventId: string
  eventTitle?: string
  categoryName?: string
}

export function AlreadyInscribedCard({
  inscription,
  eventId,
  eventTitle,
  categoryName,
}: AlreadyInscribedCardProps) {
  const statusClass = getStatusClass(inscription.status)
  const paymentStatusClass = getPaymentStatusClass(inscription.paymentStatus)
  const [campoInput, setCampoInput] = useState('')
  const [campoError, setCampoError] = useState('')
  const [campoSaved, setCampoSaved] = useState(false)
  const updateCampo = useUpdateCampoMissionario()

  const handleSaveCampo = async () => {
    if (!campoInput.trim()) {
      setCampoError('Informe o número do campo missionário')
      return
    }
    setCampoError('')
    updateCampo.mutate(
      { inscriptionId: inscription.id, eventId, campoMissionario: campoInput.trim() },
      {
        onSuccess: () => setCampoSaved(true),
        onError: (err) => setCampoError(err instanceof Error ? err.message : 'Erro ao salvar'),
      }
    )
  }

  return (
    <div className="bg-bg-secondary rounded-2xl border border-gold/20 p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gold mb-2">Voce ja esta inscrito!</h3>
      <p className="text-text-secondary mb-4">
        Sua inscricao para {eventTitle || 'este evento'} foi realizada com sucesso.
      </p>

      <div className="bg-bg-primary rounded-xl p-4 mb-6 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-sm text-text-muted">Status da Inscricao</span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusClass}`}>
            {INSCRIPTION_STATUS_LABELS[inscription.status]}
          </span>
        </div>

        {inscription.paymentStatus && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-sm text-text-muted">Status do Pagamento</span>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${paymentStatusClass}`}>
              {PAYMENT_STATUS_LABELS[inscription.paymentStatus]}
            </span>
          </div>
        )}

        {categoryName && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-sm text-text-muted">Categoria</span>
            <span className="text-sm text-text-primary font-medium">{categoryName}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-text-muted">Valor</span>
          <span className="text-lg font-bold text-gold">{inscription.valorFormatado}</span>
        </div>

        {inscription.campoMissionario ? (
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gold/10">
            <span className="text-sm text-text-muted">Campo Missionário</span>
            <span className="text-sm text-text-primary font-medium">{inscription.campoMissionario}</span>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-gold/10">
            {campoSaved ? (
              <p className="text-sm text-green-400 text-center">Campo missionário salvo com sucesso!</p>
            ) : (
              <>
                <p className="text-sm text-yellow-400 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Informe seu número do campo missionário
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={campoInput}
                    onChange={(e) => { setCampoInput(e.target.value.replace(/\D/g, '')); setCampoError('') }}
                    placeholder="Ex: 157"
                    className="flex-1 bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 text-sm"
                  />
                  <button
                    onClick={handleSaveCampo}
                    disabled={updateCampo.isPending}
                    className="px-4 py-2 bg-gold text-bg-primary text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
                  >
                    {updateCampo.isPending ? '...' : 'Salvar'}
                  </button>
                </div>
                {campoError && <p className="text-red-400 text-xs mt-1">{campoError}</p>}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/eventos/${eventId}/confirmado?inscriptionId=${inscription.id}&eventId=${eventId}`}
          className="px-6 py-3 bg-gold text-bg-primary font-bold rounded-xl hover:bg-gold-light transition-colors"
        >
          Ver Detalhes da Inscricao
        </Link>
        <Link
          href="/minha-conta/inscricoes"
          className="px-6 py-3 bg-bg-tertiary text-text-primary font-medium rounded-xl hover:bg-bg-primary transition-colors border border-gold/20"
        >
          Minhas Inscricoes
        </Link>
      </div>
    </div>
  )
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    pendente: 'bg-yellow-500/20 text-yellow-400',
    confirmado: 'bg-green-500/20 text-green-400',
    cancelado: 'bg-red-500/20 text-red-400',
  }
  return classes[status] || classes.pendente
}

function getPaymentStatusClass(status?: string): string {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    RECEIVED: 'bg-green-500/20 text-green-400',
    CONFIRMED: 'bg-green-500/20 text-green-400',
    OVERDUE: 'bg-red-500/20 text-red-400',
    REFUNDED: 'bg-gray-500/20 text-gray-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
  }
  return status ? classes[status] || classes.PENDING : classes.PENDING
}
