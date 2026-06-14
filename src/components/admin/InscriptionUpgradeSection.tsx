"use client"

import { useEffect, useState } from 'react'
import { InscriptionWithDetails, adminService, UpgradePreviewDTO } from '@/lib/services/adminService'
import { EventCategoryDTO } from '@/shared/types/event'
import { InscriptionPaymentMethod, INSCRIPTION_PAYMENT_METHODS, INSCRIPTION_PAYMENT_METHOD_LABELS } from '@/shared/constants'
import { useRequestInscriptionUpgrade, useCancelInscriptionUpgrade } from '@/hooks/mutations/useInscriptionUpgrade'

interface Props {
  eventId: string
  inscription: InscriptionWithDetails
  categories: EventCategoryDTO[]
  onChanged: () => void
}

function upgradePageUrl(eventId: string, inscriptionId: string, adjustmentPaymentId: string): string {
  const qs = new URLSearchParams({ aid: adjustmentPaymentId })
  return `/minha-conta/admin/eventos/${eventId}/inscricoes/${inscriptionId}/upgrade?${qs.toString()}`
}

export function InscriptionUpgradeSection({ eventId, inscription, categories, onChanged }: Props) {
  const pending = inscription.pendingUpgrade
  const cancelUpgrade = useCancelInscriptionUpgrade()

  // Estado: upgrade já pendente → bloco de acompanhamento.
  if (pending) {
    return (
      <div className="pt-4 border-t border-gold/10">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-3">
          <p className="text-sm text-amber-400 font-medium mb-1">⏳ Upgrade pendente</p>
          <p className="text-xs text-text-secondary">
            {inscription.categoryNome} → <strong>{pending.targetCategoryNome}</strong>. A troca de categoria só
            será aplicada após o pagamento da diferença ({INSCRIPTION_PAYMENT_METHOD_LABELS[pending.metodo]}).
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open(upgradePageUrl(eventId, inscription.id, pending.adjustmentPaymentId), '_blank')}
            className="flex-1 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold rounded-lg transition-colors border border-amber-500/30"
          >
            Abrir cobrança
          </button>
          <button
            onClick={async () => {
              try {
                await cancelUpgrade.mutateAsync({ eventId, inscriptionId: inscription.id })
                onChanged()
              } catch (err) {
                console.error('Erro ao cancelar upgrade:', err)
              }
            }}
            disabled={cancelUpgrade.isPending}
            className="flex-1 py-2.5 bg-bg-tertiary text-text-secondary font-medium rounded-lg hover:text-text-primary transition-colors disabled:opacity-50"
          >
            {cancelUpgrade.isPending ? 'Cancelando...' : 'Cancelar upgrade'}
          </button>
        </div>
      </div>
    )
  }

  // Só inscrições confirmadas (pagas) podem trocar de categoria.
  if (inscription.status !== 'confirmado') return null

  return (
    <UpgradeForm eventId={eventId} inscription={inscription} categories={categories} onChanged={onChanged} />
  )
}

function UpgradeForm({ eventId, inscription, categories, onChanged }: Props) {
  const otherCategories = categories.filter(c => c.id !== inscription.categoryId)
  const [newCategoryId, setNewCategoryId] = useState('')
  const [metodo, setMetodo] = useState<InscriptionPaymentMethod>('PIX')
  const [preview, setPreview] = useState<UpgradePreviewDTO | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const requestUpgrade = useRequestInscriptionUpgrade()

  useEffect(() => {
    if (!newCategoryId) {
      setPreview(null)
      setPreviewError('')
      return
    }
    let active = true
    setLoadingPreview(true)
    setPreviewError('')
    adminService
      .getUpgradePreview(eventId, inscription.id, newCategoryId, metodo)
      .then((p) => { if (active) setPreview(p) })
      .catch((err) => { if (active) { setPreview(null); setPreviewError(err instanceof Error ? err.message : 'Erro ao calcular') } })
      .finally(() => { if (active) setLoadingPreview(false) })
    return () => { active = false }
  }, [eventId, inscription.id, newCategoryId, metodo])

  const handleGenerate = async () => {
    if (!newCategoryId) return
    // Abre a aba ANTES do await (gesto do usuário) para não ser bloqueada por popup blocker.
    const willCharge = !!preview && !preview.isDowngrade
    const newTab = willCharge ? window.open('', '_blank') : null
    try {
      const res = await requestUpgrade.mutateAsync({ eventId, inscriptionId: inscription.id, newCategoryId, metodo })
      if (res.payment && !res.preview.isDowngrade && newTab) {
        newTab.location.href = upgradePageUrl(eventId, inscription.id, res.payment.id)
      } else {
        newTab?.close()
      }
      onChanged()
    } catch (err) {
      newTab?.close()
      setPreviewError(err instanceof Error ? err.message : 'Erro ao gerar o upgrade')
    }
  }

  if (otherCategories.length === 0) return null

  return (
    <div className="pt-4 border-t border-gold/10">
      <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-3">
        <p className="text-sm text-gold font-medium mb-1">Trocar categoria / cobrar diferença</p>
        <p className="text-xs text-text-secondary">
          A diferença respeita o preço da data da inscrição. A troca só vale após o pagamento confirmar.
        </p>
      </div>

      <label className="text-xs text-text-muted">Nova categoria</label>
      <select
        value={newCategoryId}
        onChange={(e) => setNewCategoryId(e.target.value)}
        className="w-full mt-1 mb-3 bg-bg-tertiary border border-gold/20 rounded-lg px-3 py-2 text-text-primary"
      >
        <option value="">Selecione...</option>
        {otherCategories.map(c => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>

      <label className="text-xs text-text-muted">Forma de pagamento da diferença</label>
      <div className="flex gap-2 mt-1 mb-3">
        {INSCRIPTION_PAYMENT_METHODS.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMetodo(m)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
              metodo === m ? 'bg-gold/20 text-gold border-gold/40' : 'bg-bg-tertiary text-text-secondary border-transparent'
            }`}
          >
            {INSCRIPTION_PAYMENT_METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {loadingPreview && <p className="text-xs text-text-muted py-2">Calculando diferença...</p>}
      {previewError && <p className="text-xs text-red-400 py-2">{previewError}</p>}

      {preview && !loadingPreview && (
        <div className="bg-bg-tertiary rounded-lg p-3 mb-3 text-sm space-y-1">
          {preview.isDowngrade ? (
            <p className="text-amber-400 text-xs">
              Categoria mais barata: troca direta sem cobrança. Eventual valor pago a mais deve ser
              estornado manualmente pela Asaas.
            </p>
          ) : (
            <>
              <div className="flex justify-between"><span className="text-text-muted">Diferença</span><span className="text-text-primary">{preview.diferencaBaseFormatado}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Taxa ({INSCRIPTION_PAYMENT_METHOD_LABELS[metodo]})</span><span className="text-text-primary">+ {(preview.taxaCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
              <div className="flex justify-between font-bold border-t border-gold/10 pt-1 mt-1"><span className="text-text-primary">Total a cobrar</span><span className="text-gold">{preview.totalFormatado}</span></div>
            </>
          )}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={!newCategoryId || loadingPreview || requestUpgrade.isPending || !!previewError}
        className="w-full py-3 bg-gold/20 hover:bg-gold/30 text-gold font-bold rounded-lg transition-colors disabled:opacity-50 border border-gold/30"
      >
        {requestUpgrade.isPending
          ? 'Gerando...'
          : preview?.isDowngrade
            ? 'Trocar categoria (sem cobrança)'
            : 'Gerar upgrade e abrir cobrança'}
      </button>
    </div>
  )
}
