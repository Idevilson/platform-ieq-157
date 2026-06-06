'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEventCategories } from '@/hooks/queries/useEvents'
import { useAuth } from '@/hooks/useAuth'
import { useMyBatches, useBatchLookup } from '@/hooks/queries/useInscriptions'
import { BatchInscriptionForm } from '@/components/inscription/BatchInscriptionForm'
import { BatchInscriptionCard } from '@/components/inscription/BatchInscriptionCard'
import { BatchInscriptionDTO } from '@/shared/types/inscription'
import { AuthModal } from '@/components/auth'
import { WhatsAppSupport } from '@/components/common/WhatsAppSupport'

const EVENT_ID = 'geracao-forte'
const DETAIL_BASE = '/eventos/geracao-forte/inscricao-coletiva/confirmado'

function CPFLookupSection({ onResult }: { onResult: (cpf: string) => void }) {
  const [cpf, setCpf] = useState('')

  function formatCPF(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3')
      .replace(/(\d{3})(\d{3})/, '$1.$2')
      .replace(/(\d{3})/, '$1')
  }

  return (
    <div className="bg-bg-secondary rounded-2xl border border-gold/10 p-6">
      <h3 className="text-base font-semibold text-text-primary mb-1">Consultar inscrição coletiva</h3>
      <p className="text-sm text-text-secondary mb-4">Informe o CPF do responsável pelo lote.</p>
      <div className="flex gap-3">
        <input
          type="text"
          value={cpf}
          onChange={(e) => setCpf(formatCPF(e.target.value))}
          placeholder="000.000.000-00"
          className="flex-1 bg-bg-primary border border-gold/20 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 text-sm"
        />
        <button
          onClick={() => cpf.replace(/\D/g, '').length === 11 && onResult(cpf.replace(/\D/g, ''))}
          disabled={cpf.replace(/\D/g, '').length !== 11}
          className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buscar
        </button>
      </div>
    </div>
  )
}

export default function GeracaoForteBatchInscricao() {
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()
  const { data: categorias, isLoading: categoriasLoading, error: categoriasError, refetch: refetchCategorias } = useEventCategories(EVENT_ID)
  const [cpfInput, setCpfInput] = useState<string>()
  const [showForm, setShowForm] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const { data: myBatches, isLoading: myBatchesLoading } = useMyBatches(EVENT_ID, !!authUser)
  const { data: lookedUpBatches, isLoading: lookupLoading } = useBatchLookup(cpfInput, EVENT_ID)

  const backLink = (
    <Link
      href="/eventos/geracao-forte"
      className="text-sm text-text-secondary hover:text-gold transition-colors flex items-center gap-1 mb-4"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Voltar para o evento
    </Link>
  )

  if (authLoading) {
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center py-16 gap-4">
          <div className="spinner" />
          <p className="text-text-secondary">Carregando...</p>
        </div>
      </section>
    )
  }

  if (!authUser) {
    return (
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            {backLink}
            <h1 className="text-2xl font-bold text-text-primary">Geração Forte</h1>
            <p className="text-text-secondary mt-1">Inscrição Coletiva</p>
          </div>
          <CPFLookupSection onResult={(cpf) => setCpfInput(cpf)} />
          {lookupLoading && (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="spinner" />
              <span className="text-text-secondary text-sm">Buscando...</span>
            </div>
          )}
          {!lookupLoading && lookedUpBatches !== undefined && lookedUpBatches.length === 0 && (
            <div className="mt-4 p-4 bg-bg-secondary rounded-xl border border-gold/10 text-center text-sm text-text-secondary">
              Nenhuma inscrição coletiva encontrada para este CPF.
            </div>
          )}
          {!lookupLoading && lookedUpBatches?.map(batch => (
            <div key={batch.batchId} className="mt-4">
              <BatchInscriptionCard
                batch={batch}
                onViewPayment={() => router.push(`${DETAIL_BASE}?batchId=${batch.batchId}`)}
              />
            </div>
          ))}
          <p className="text-center text-sm text-text-muted mt-6">
            Para criar uma nova inscrição coletiva,{' '}
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="text-gold hover:underline cursor-pointer"
            >
              faça login
            </button>
            .
          </p>
        </div>
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          title="Entrar para continuar"
          description="Faça login para criar uma nova inscrição coletiva."
        />
      </section>
    )
  }

  if (categoriasLoading) {
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center py-16 gap-4">
          <div className="spinner" />
          <p className="text-text-secondary">Carregando categorias...</p>
        </div>
      </section>
    )
  }

  if (categoriasError || !categorias?.length) {
    return (
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="card py-12 text-center">
            <p className="text-3xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-text-primary mb-2">Não foi possível carregar as categorias</h2>
            <p className="text-text-secondary mb-6">Verifique sua conexão e tente novamente.</p>
            <button onClick={() => refetchCategorias()} className="btn-primary px-6 py-2">
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    )
  }

  const hasBatches = !myBatchesLoading && myBatches && myBatches.length > 0
  const lookupDone = !myBatchesLoading && myBatches !== undefined

  const mappedCategories = categorias.map((c: {
    id: string; nome: string; valor: number; valorFormatado: string
    descricao?: string; ordem?: number; beneficiosInclusos?: string[]
    earlyBirdValor?: number; earlyBirdValorFormatado?: string
    earlyBirdDeadline?: string; earlyBirdAtivo?: boolean
    valorAtual?: number; valorAtualFormatado?: string
  }) => ({
    id: c.id, nome: c.nome,
    valor: c.valorAtual ?? c.valor,
    valorFormatado: c.valorFormatado,
    descricao: c.descricao, ordem: c.ordem,
    beneficiosInclusos: c.beneficiosInclusos,
    earlyBirdValor: c.earlyBirdValor,
    earlyBirdValorFormatado: c.earlyBirdValorFormatado,
    earlyBirdDeadline: c.earlyBirdDeadline,
    earlyBirdAtivo: c.earlyBirdAtivo,
    valorAtual: c.valorAtual,
    valorAtualFormatado: c.valorAtualFormatado,
  }))

  return (
    <section className="py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          {backLink}
          <h1 className="text-2xl font-bold text-text-primary">Geração Forte</h1>
          <p className="text-text-secondary mt-1">Inscrição Coletiva — até 50 participantes</p>
        </div>

        {myBatchesLoading && (
          <div className="flex items-center justify-center py-8 gap-3">
            <div className="spinner" />
            <span className="text-text-secondary text-sm">Verificando inscrições existentes...</span>
          </div>
        )}

        {lookupDone && hasBatches && !showForm && (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Suas inscrições coletivas</h2>
            {myBatches!.map(batch => (
              <BatchInscriptionCard
                key={batch.batchId}
                batch={batch}
                onViewPayment={() => router.push(`${DETAIL_BASE}?batchId=${batch.batchId}`)}
              />
            ))}
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border border-gold/30 rounded-xl text-sm text-text-secondary hover:text-gold hover:border-gold/60 transition-colors"
            >
              + Fazer nova inscrição coletiva
            </button>
          </div>
        )}

        {lookupDone && !hasBatches && !showForm && (
          <div className="mb-6 p-4 bg-bg-secondary rounded-xl border border-gold/10 text-center text-sm text-text-secondary">
            Nenhuma inscrição coletiva encontrada.{' '}
            <button onClick={() => setShowForm(true)} className="text-gold hover:underline">
              Criar nova inscrição
            </button>
          </div>
        )}

        {(showForm || (!lookupDone && !myBatchesLoading)) && (
          <div className="bg-bg-secondary rounded-2xl border border-gold/10 p-6">
            {showForm && (
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-text-muted hover:text-gold transition-colors mb-4 flex items-center gap-1"
              >
                ← Voltar para minhas inscrições
              </button>
            )}
            <BatchInscriptionForm
              eventId={EVENT_ID}
              categories={mappedCategories}
              user={{ id: authUser.uid, email: authUser.email ?? '', nome: authUser.profile?.nome || authUser.displayName || '', cpf: authUser.profile?.cpf || '' } as Parameters<typeof BatchInscriptionForm>[0]['user']}
              onSuccess={(batch: BatchInscriptionDTO) =>
                router.push(`${DETAIL_BASE}?batchId=${batch.id}`)
              }
            />
          </div>
        )}
      </div>
      <WhatsAppSupport variant="floating" />
    </section>
  )
}
