'use client'

import { useEffect, useRef, useState } from 'react'
import { OperableEvent } from '@/lib/services/operacaoService'

interface Props {
  events: OperableEvent[]
  value: string
  onChange: (id: string) => void
  loading?: boolean
  placeholder?: string
}

const STATUS_LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
}

export function EventSelect({ events, value, onChange, loading = false, placeholder = 'Selecione o evento...' }: Props) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = events.find((e) => e.id === value)

  const latest = useRef({ events, onChange, highlight })
  latest.current = { events, onChange, highlight }

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      const { events, onChange, highlight } = latest.current
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, events.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)) }
      if (e.key === 'Enter' && highlight >= 0) { e.preventDefault(); onChange(events[highlight].id); setOpen(false) }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const select = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  const toggle = () => {
    setHighlight(events.findIndex((e) => e.id === value))
    setOpen((o) => !o)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-busy={loading}
        className={`w-full flex items-center justify-between gap-3 bg-bg-secondary border rounded-xl px-4 py-3.5 text-left transition-colors ${loading ? 'cursor-wait opacity-80' : ''} ${open ? 'border-gold/60 ring-2 ring-gold/20' : 'border-gold/20 hover:border-gold/40'}`}
      >
        <span className={`truncate ${selected ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
          {loading && !selected ? 'Carregando eventos...' : selected ? selected.titulo : placeholder}
        </span>
        {loading ? (
          <svg className="w-5 h-5 shrink-0 text-gold animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <svg
            className={`w-5 h-5 shrink-0 text-gold transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M6 8l4 4 4-4" />
          </svg>
        )}
      </button>

      <div
        role="listbox"
        className={`absolute z-30 mt-2 w-full origin-top rounded-xl border border-gold/20 bg-bg-secondary shadow-2xl shadow-black/40 overflow-hidden transition-all duration-150 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
      >
        <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
          {events.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-muted">Nenhum evento disponível.</p>
          ) : (
            events.map((event, index) => {
              const isSelected = event.id === value
              const isHighlight = index === highlight
              return (
                <button
                  type="button"
                  key={event.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => select(event.id)}
                  onMouseEnter={() => setHighlight(index)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors ${isHighlight ? 'bg-gold/10' : ''} ${isSelected ? 'text-gold' : 'text-text-primary'}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{event.titulo}</span>
                    {STATUS_LABEL[event.status] && (
                      <span className="block text-xs text-text-muted">{STATUS_LABEL[event.status]}</span>
                    )}
                  </span>
                  {isSelected && (
                    <svg className="w-5 h-5 shrink-0 text-gold" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 10l3.5 3.5L15 6" />
                    </svg>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
