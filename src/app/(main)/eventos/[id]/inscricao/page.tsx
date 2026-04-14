'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter, notFound } from 'next/navigation'
import { useEventById, useEventCategories } from '@/hooks/queries/useEvents'
import { SmartInscriptionForm } from '@/components/inscription'

interface Props {
  params: Promise<{ id: string }>
}

function InscricaoContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: evento, isLoading, error } = useEventById(id)
  const { data: categorias } = useEventCategories(id)

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center py-16 gap-4">
          <div className="spinner" />
          <p className="text-text-secondary">Carregando...</p>
        </div>
      </section>
    )
  }

  if (error || !evento) {
    notFound()
  }

  if (evento.status !== 'aberto') {
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="card py-12">
            <p className="text-2xl mb-4">🔒</p>
            <h2 className="text-xl font-bold text-text-primary mb-2">Inscrições encerradas</h2>
            <p className="text-text-secondary mb-6">As inscrições para este evento não estão disponíveis no momento.</p>
            <Link href={`/eventos/${id}`} className="text-gold hover:underline">
              ← Voltar para o evento
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const eventCategorias = categorias || evento.categorias || []

  const handleSuccess = (inscriptionId: string) => {
    router.push(`/eventos/${id}/confirmado?inscriptionId=${inscriptionId}&eventId=${id}`)
  }

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href={`/eventos/${id}`}
          className="text-sm text-text-secondary hover:text-gold transition-colors no-underline mb-8 inline-block"
        >
          ← Voltar para {evento.titulo}
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">{evento.titulo}</h1>
          {evento.subtitulo && (
            <p className="text-lg text-gold mb-4">{evento.subtitulo}</p>
          )}
          <p className="text-text-secondary">Preencha o formulário abaixo para garantir sua vaga.</p>
        </div>

        <SmartInscriptionForm
          eventId={id}
          eventTitle={evento.titulo}
          categories={eventCategorias}
          paymentMethods={evento.metodosPagamento}
          onSuccess={handleSuccess}
        />
      </div>
    </section>
  )
}

export default function InscricaoPage({ params }: Props) {
  const { id } = use(params)
  return <InscricaoContent id={id} />
}
