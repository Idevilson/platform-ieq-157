"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useEventsList } from '@/hooks/queries/useEvents'
import { EventStatus, EVENT_STATUS_LABELS } from '@/shared/constants'
import { EventSummaryDTO } from '@/shared/types'

type StatusFiltro = 'todos' | EventStatus

function formatarDataEvento(dataInicio: string | Date) {
  const inicio = new Date(dataInicio)
  const opcoes: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
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

export default function Eventos() {
  const [filtro, setFiltro] = useState<StatusFiltro>('todos')
  const { data: eventos, isLoading, error } = useEventsList()

  const eventosFiltrados = filtro === 'todos'
    ? eventos || []
    : (eventos || []).filter((e: EventSummaryDTO) => e.status === filtro)

  const filtros = [
    { value: 'todos', label: 'Todos' },
    { value: 'aberto', label: 'Inscricoes Abertas' },
    { value: 'fechado', label: 'Inscricoes Fechadas' },
    { value: 'encerrado', label: 'Encerrados' },
  ]

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Eventos</h1>
            <p className="text-text-secondary">Confira todos os eventos da nossa igreja</p>
          </div>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="spinner" />
            <p className="text-text-secondary">Carregando eventos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Eventos</h1>
            <p className="text-text-secondary">Confira todos os eventos da nossa igreja</p>
          </div>
          <div className="card text-center py-12">
            <p className="text-red-400">Erro ao carregar eventos. Tente novamente mais tarde.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Eventos</h1>
          <p className="text-text-secondary">Confira todos os eventos da nossa igreja</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filtros.map(f => (
            <button
              key={f.value}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filtro === f.value
                  ? 'bg-gold text-bg-primary'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
              onClick={() => setFiltro(f.value as StatusFiltro)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {eventosFiltrados.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">Nenhum evento encontrado com esse filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((evento: EventSummaryDTO) => (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}`}
                className="card flex flex-col hover:-translate-y-1 hover:border-gold/30 transition-all no-underline group"
              >
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusClass(evento.status)}`}>
                    {EVENT_STATUS_LABELS[evento.status]}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-text-primary mb-2 group-hover:text-gold transition-colors">
                    {evento.titulo}
                  </h2>
                  {evento.subtitulo && (
                    <p className="text-sm text-gold mb-3">{evento.subtitulo}</p>
                  )}
                  <div className="space-y-2 mb-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatarDataEvento(evento.dataInicio)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{evento.local}</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-3">{evento.descricao}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gold/10">
                  <span className="text-gold font-medium text-sm group-hover:text-gold-light transition-colors">
                    {evento.status === 'aberto' ? 'Fazer Inscricao →' : 'Saiba Mais →'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
