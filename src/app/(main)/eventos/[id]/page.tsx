'use client'

import { useEffect } from 'react'
import { useRouter, notFound } from 'next/navigation'
import Link from 'next/link'
import { useEventById } from '@/hooks/queries/useEvents'
import { EventStatus, EVENT_STATUS_LABELS } from '@/shared/constants'
import { EventCategoryDTO } from '@/shared/types'

interface Props {
  params: Promise<{ id: string }>
}

function formatarDataEvento(dataInicio: string | Date, dataFim?: string | Date) {
  const inicio = new Date(dataInicio)
  const opcoes: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }

  if (dataFim) {
    const fim = new Date(dataFim)
    return `${inicio.toLocaleDateString('pt-BR', opcoes)} a ${fim.toLocaleDateString('pt-BR', opcoes)}`
  }
  return inicio.toLocaleDateString('pt-BR', opcoes)
}

function getStatusClass(status: EventStatus) {
  const classes: Record<string, string> = {
    aberto: 'bg-green-500/20 text-green-400 border-green-500/30',
    rascunho: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    fechado: 'bg-gold/20 text-gold border-gold/30',
    encerrado: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return classes[status] || classes.fechado
}

function EventoDetalheContent({ id }: { id: string }) {
  const router = useRouter()
  const { data: evento, isLoading, error } = useEventById(id)

  useEffect(() => {
    if (id === 'encontro-com-deus') {
      router.replace('/encontro-com-deus')
    }
  }, [id, router])

  if (id === 'encontro-com-deus') {
    return null
  }

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="spinner" />
            <p className="text-text-secondary">Carregando evento...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error || !evento) {
    notFound()
  }

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link
            href="/eventos"
            className="text-sm text-text-secondary hover:text-gold transition-colors no-underline"
          >
            ← Voltar para Eventos
          </Link>
          <span className={`inline-block px-4 py-1.5 text-sm font-medium rounded-full border ${getStatusClass(evento.status)}`}>
            {EVENT_STATUS_LABELS[evento.status]}
          </span>
        </div>

        <div className="card">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            {evento.titulo}
          </h1>
          {evento.subtitulo && (
            <p className="text-lg text-gold mb-6">{evento.subtitulo}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-8 p-4 bg-bg-tertiary/50 rounded-xl">
            <div className="flex items-start gap-4">
              <span className="text-2xl">📅</span>
              <div>
                <strong className="text-text-primary block mb-1">Data</strong>
                <p className="text-text-secondary">
                  {formatarDataEvento(evento.dataInicio, evento.dataFim)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-2xl">📍</span>
              <div>
                <strong className="text-text-primary block mb-1">Local</strong>
                <p className="text-text-secondary">{evento.local}</p>
                {evento.endereco && (
                  <p className="text-sm text-text-muted">{evento.endereco}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gold mb-4">Sobre o Evento</h2>
            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
              {evento.descricaoCompleta || evento.descricao}
            </p>
          </div>

          {evento.categorias && evento.categorias.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gold mb-4">Categorias de Inscricao</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {evento.categorias.map((cat: EventCategoryDTO) => (
                  <div
                    key={cat.id}
                    className="p-5 bg-bg-tertiary rounded-xl border border-gold/10 hover:border-gold/30 transition-all"
                  >
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{cat.nome}</h3>
                    <p className="text-2xl font-bold text-gold mb-3">
                      {cat.valorFormatado}
                    </p>
                    {cat.descricao && (
                      <p className="text-sm text-text-secondary mb-4">{cat.descricao}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {evento.status === 'aberto' && evento.categorias.length > 0 && (
            <div className="p-6 bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/30 rounded-xl text-center">
              <p className="text-text-secondary mb-4">
                As inscricoes estao abertas! Faca sua inscricao agora mesmo.
              </p>
              <Link href={`/eventos/${id}/inscricao`} className="btn-primary">
                Fazer Inscricao
              </Link>
            </div>
          )}

          {evento.status === 'fechado' && (
            <div className="p-6 bg-bg-tertiary border border-gold/10 rounded-xl text-center">
              <p className="text-text-secondary">
                As inscricoes para este evento estao encerradas.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

import { use } from 'react'

export default function EventoDetalhe({ params }: Props) {
  const { id } = use(params)
  return <EventoDetalheContent id={id} />
}
