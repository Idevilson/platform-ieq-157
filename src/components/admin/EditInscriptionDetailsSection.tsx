"use client"

import { useState } from 'react'
import { InscriptionWithDetails } from '@/lib/services/adminService'
import { ShirtSize, SHIRT_SIZES } from '@/shared/constants'
import { useUpdateInscriptionDetails } from '@/hooks/mutations/useInscriptionUpgrade'

interface Props {
  eventId: string
  inscription: InscriptionWithDetails
  onSaved: (updates: { tamanho?: string; campoMissionario?: string }) => void
}

export function EditInscriptionDetailsSection({ eventId, inscription, onSaved }: Props) {
  const [tamanho, setTamanho] = useState<ShirtSize | ''>((inscription.tamanho as ShirtSize) ?? '')
  const [campoMissionario, setCampoMissionario] = useState(inscription.campoMissionario ?? '')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const update = useUpdateInscriptionDetails()

  const dirty = tamanho !== (inscription.tamanho ?? '') || campoMissionario !== (inscription.campoMissionario ?? '')

  const handle = async () => {
    setError('')
    setDone(false)
    try {
      await update.mutateAsync({
        eventId,
        inscriptionId: inscription.id,
        tamanho: tamanho || null,
        campoMissionario: campoMissionario.trim() || null,
      })
      setDone(true)
      onSaved({ tamanho: tamanho || undefined, campoMissionario: campoMissionario.trim() || undefined })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  return (
    <div className="pt-4 border-t border-gold/10">
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 mb-3">
        <p className="text-sm text-sky-400 font-medium mb-1">Editar dados da inscrição</p>
        <p className="text-xs text-text-secondary">
          Complete ou corrija o tamanho da camiseta e o número do campo missionário.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-text-muted">Tamanho Camiseta</label>
          <select
            value={tamanho}
            onChange={(e) => { setTamanho(e.target.value as ShirtSize | ''); setDone(false) }}
            className="w-full mt-1 bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold/50"
          >
            <option value="">Não informado</option>
            {SHIRT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted">Campo Missionário</label>
          <input
            type="text"
            inputMode="numeric"
            value={campoMissionario}
            onChange={(e) => { setCampoMissionario(e.target.value.replace(/\D/g, '')); setDone(false) }}
            placeholder="Somente números"
            className="w-full mt-1 bg-bg-primary border border-gold/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      <button
        onClick={handle}
        disabled={update.isPending || !dirty}
        className="w-full py-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold rounded-lg transition-colors disabled:opacity-50 border border-sky-500/30"
      >
        {update.isPending ? 'Salvando...' : 'Salvar dados'}
      </button>
      {done && !dirty && <p className="text-green-400 text-xs mt-2 text-center">Dados atualizados.</p>}
      {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
    </div>
  )
}
