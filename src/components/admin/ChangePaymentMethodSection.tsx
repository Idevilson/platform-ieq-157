"use client"

import { useState } from 'react'
import { InscriptionWithDetails } from '@/lib/services/adminService'
import { InscriptionPaymentMethod, INSCRIPTION_PAYMENT_METHODS, INSCRIPTION_PAYMENT_METHOD_LABELS } from '@/shared/constants'
import { useChangeInscriptionPaymentMethod } from '@/hooks/mutations/useInscriptionUpgrade'

interface Props {
  eventId: string
  inscription: InscriptionWithDetails
  onChanged: () => void
}

/**
 * Troca o meio de pagamento de uma inscrição PENDENTE (ex.: dinheiro → PIX) e
 * regenera a cobrança. Visível apenas enquanto a inscrição está pendente.
 */
export function ChangePaymentMethodSection({ eventId, inscription, onChanged }: Props) {
  const options = INSCRIPTION_PAYMENT_METHODS.filter(m => m !== inscription.preferredPaymentMethod)
  const [metodo, setMetodo] = useState<InscriptionPaymentMethod>(options[0] ?? 'PIX')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const change = useChangeInscriptionPaymentMethod()

  if (inscription.status !== 'pendente') return null

  const handle = async () => {
    setError('')
    // Abre a aba ANTES do await (gesto do usuário) para não ser bloqueada por popup blocker.
    const newTab = metodo !== 'CASH' ? window.open('', '_blank') : null
    try {
      await change.mutateAsync({ eventId, inscriptionId: inscription.id, metodo })
      setDone(true)
      if (newTab) {
        const params = new URLSearchParams({ inscriptionId: inscription.id, eventId, metodo })
        newTab.location.href = `/eventos/${eventId}/confirmado?${params.toString()}`
      }
      onChanged()
    } catch (err) {
      newTab?.close()
      setError(err instanceof Error ? err.message : 'Erro ao trocar o meio de pagamento')
    }
  }

  return (
    <div className="pt-4 border-t border-gold/10">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-3">
        <p className="text-sm text-purple-400 font-medium mb-1">Trocar meio de pagamento</p>
        <p className="text-xs text-text-secondary">
          Atual: <strong>{INSCRIPTION_PAYMENT_METHOD_LABELS[inscription.preferredPaymentMethod]}</strong>.
          Ao trocar para PIX ou Cartão, uma cobrança online é gerada para o participante.
        </p>
      </div>

      {done ? (
        <p className="text-sm text-green-400 text-center py-2">
          Meio de pagamento alterado para {INSCRIPTION_PAYMENT_METHOD_LABELS[metodo]}.
          {metodo !== 'CASH' && ' A cobrança foi gerada.'}
        </p>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            {options.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodo(m)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  metodo === m ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-bg-tertiary text-text-secondary border-transparent'
                }`}
              >
                {INSCRIPTION_PAYMENT_METHOD_LABELS[m]}
              </button>
            ))}
          </div>

          <button
            onClick={handle}
            disabled={change.isPending}
            className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold rounded-lg transition-colors disabled:opacity-50 border border-purple-500/30"
          >
            {change.isPending
              ? 'Alterando...'
              : metodo === 'CASH'
                ? 'Alterar para dinheiro'
                : 'Alterar e gerar cobrança'}
          </button>
          {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
        </>
      )}
    </div>
  )
}
