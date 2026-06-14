'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { firebaseAuthService } from '@/lib/firebase'
import { useUpgradeSSE } from '@/hooks/useUpgradeSSE'
import { useConfirmUpgradeCash } from '@/hooks/mutations/useInscriptionUpgrade'

export default function InscriptionUpgradePage() {
  const params = useParams<{ id: string; inscriptionId: string }>()
  const searchParams = useSearchParams()
  const eventId = params.id
  const inscriptionId = params.inscriptionId
  const adjustmentPaymentId = searchParams.get('aid')

  const [token, setToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const confirmCash = useConfirmUpgradeCash()

  useEffect(() => {
    firebaseAuthService.getIdToken().then(setToken).catch(() => setToken(null))
  }, [])

  const { payment, connected, isPaid, isApplied } = useUpgradeSSE(eventId, inscriptionId, adjustmentPaymentId, token)

  if (!adjustmentPaymentId) {
    return <Centered><p className="text-red-400">Parâmetro da cobrança ausente.</p></Centered>
  }

  if (isApplied || isPaid) {
    return (
      <Centered>
        <div className="text-center space-y-3">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-text-primary">Upgrade confirmado!</h1>
          <p className="text-text-secondary">A categoria foi atualizada e o pagamento da diferença foi confirmado.</p>
          {payment?.valorFormatado && <p className="text-gold font-bold">Diferença paga: {payment.valorFormatado}</p>}
        </div>
      </Centered>
    )
  }

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Centered>
      <div className="w-full max-w-md space-y-5">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">Upgrade de categoria</h1>
          <p className="text-text-secondary text-sm mt-1">
            Emita ou compartilhe o pagamento da diferença. A categoria só será trocada após a confirmação.
          </p>
          {payment?.valorFormatado && (
            <p className="text-gold font-bold text-xl mt-2">Total: {payment.valorFormatado}</p>
          )}
        </header>

        {!payment && <p className="text-center text-text-muted">{connected ? 'Carregando cobrança...' : 'Conectando...'}</p>}

        {payment?.metodoPagamento === 'PIX' && (
          <div className="bg-bg-secondary border border-gold/20 rounded-2xl p-5 space-y-4">
            {payment.pixQrCode && (
              <img
                src={`data:image/png;base64,${payment.pixQrCode}`}
                alt="QR Code PIX"
                className="mx-auto w-56 h-56 rounded-lg bg-white p-2"
              />
            )}
            {payment.pixCopiaECola && (
              <div className="space-y-2">
                <p className="text-xs text-text-muted">PIX copia e cola</p>
                <div className="flex gap-2">
                  <input readOnly value={payment.pixCopiaECola} className="flex-1 bg-bg-tertiary rounded-lg px-3 py-2 text-xs text-text-secondary truncate" />
                  <button onClick={() => copy(payment.pixCopiaECola!)} className="px-4 py-2 bg-gold/20 text-gold font-medium rounded-lg hover:bg-gold/30">
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {payment?.metodoPagamento === 'CREDIT_CARD' && payment.checkoutUrl && (
          <div className="bg-bg-secondary border border-gold/20 rounded-2xl p-5 space-y-3 text-center">
            <a href={payment.checkoutUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-gold/20 text-gold font-bold rounded-lg hover:bg-gold/30">
              Abrir checkout do cartão
            </a>
            <button onClick={() => copy(payment.checkoutUrl!)} className="text-sm text-text-secondary hover:text-text-primary">
              {copied ? 'Link copiado!' : 'Copiar link para compartilhar'}
            </button>
          </div>
        )}

        {payment?.metodoPagamento === 'CASH' && (
          <div className="bg-bg-secondary border border-gold/20 rounded-2xl p-5 space-y-3 text-center">
            <p className="text-text-secondary text-sm">Recebimento em dinheiro. Ao receber, confirme abaixo para aplicar o upgrade.</p>
            <button
              onClick={async () => {
                try {
                  await confirmCash.mutateAsync({ eventId, inscriptionId })
                } catch (err) {
                  console.error('Erro ao confirmar dinheiro:', err)
                }
              }}
              disabled={confirmCash.isPending}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg disabled:opacity-50"
            >
              {confirmCash.isPending ? 'Confirmando...' : '✓ Confirmar recebimento em dinheiro'}
            </button>
          </div>
        )}

        <div className="text-center text-sm text-text-muted">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          {connected ? 'Aguardando pagamento ao vivo...' : 'Reconectando...'}
        </div>
      </div>
    </Centered>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[60vh] flex items-center justify-center p-6">{children}</div>
}
