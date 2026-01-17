"use client"

import { useState } from 'react'
import { avisos, formatarData } from '@/data/avisos'

type CategoriaFiltro = 'todos' | 'geral' | 'culto' | 'evento' | 'urgente'

function getCategoriaClass(categoria: string) {
  const classes: Record<string, string> = {
    urgente: 'bg-red-500/20 text-red-400 border-red-500/30',
    evento: 'bg-gold/20 text-gold border-gold/30',
    culto: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    geral: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return classes[categoria] || classes.geral
}

export default function Avisos() {
  const [filtro, setFiltro] = useState<CategoriaFiltro>('todos')
  const [avisoExpandido, setAvisoExpandido] = useState<number | null>(null)

  const avisosFiltrados = filtro === 'todos'
    ? avisos
    : avisos.filter(a => a.categoria === filtro)

  const avisosOrdenados = [...avisosFiltrados].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )

  const toggleAviso = (id: number) => {
    setAvisoExpandido(avisoExpandido === id ? null : id)
  }

  const filtros = [
    { value: 'todos', label: 'Todos' },
    { value: 'geral', label: 'Geral' },
    { value: 'culto', label: 'Cultos' },
    { value: 'evento', label: 'Eventos' },
    { value: 'urgente', label: 'Urgentes' },
  ]

  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Avisos</h1>
          <p className="text-text-secondary">Fique por dentro das novidades da nossa igreja</p>
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
              onClick={() => setFiltro(f.value as CategoriaFiltro)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {avisosOrdenados.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">Nenhum aviso encontrado com esse filtro.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {avisosOrdenados.map(aviso => (
              <div
                key={aviso.id}
                className={`card overflow-hidden transition-all ${
                  avisoExpandido === aviso.id ? 'border-gold/30' : ''
                }`}
              >
                <div
                  className="flex items-center justify-between gap-4 cursor-pointer"
                  onClick={() => toggleAviso(aviso.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border w-fit ${getCategoriaClass(aviso.categoria)}`}>
                      {aviso.categoria}
                    </span>
                    <h3 className="text-base font-semibold text-text-primary truncate">
                      {aviso.titulo}
                    </h3>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {formatarData(aviso.data)}
                    </span>
                  </div>
                  <span className="text-xl text-gold font-light flex-shrink-0">
                    {avisoExpandido === aviso.id ? '−' : '+'}
                  </span>
                </div>
                {avisoExpandido === aviso.id && (
                  <div className="mt-4 pt-4 border-t border-gold/10 animate-fade-in">
                    <p className="text-text-secondary text-sm leading-relaxed">{aviso.conteudo}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
