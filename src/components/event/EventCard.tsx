'use client'

import Link from 'next/link'
import Image from 'next/image'
import { EventStatus, EVENT_STATUS_LABELS } from '@/shared/constants'

interface EventCardProps {
  id: string
  titulo: string
  descricao: string
  dataInicio: string | Date
  dataFim?: string | Date
  local: string
  imagemUrl?: string
  status: EventStatus
  categoriasCount?: number
}

export function EventCard({
  id,
  titulo,
  descricao,
  dataInicio,
  dataFim,
  local,
  imagemUrl,
  status,
  categoriasCount,
}: EventCardProps) {
  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateRange = () => {
    const start = formatDate(dataInicio)
    if (dataFim) {
      const end = formatDate(dataFim)
      return `${start} - ${end}`
    }
    return start
  }

  const isOpen = status === 'aberto'

  return (
    <div className={`event-card ${isOpen ? 'event-card--open' : ''}`}>
      {imagemUrl && (
        <div className="event-card__image">
          <Image
            src={imagemUrl}
            alt={titulo}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="event-card__content">
        <div className="event-card__status">
          <span className={`status-badge status-badge--${status}`}>
            {EVENT_STATUS_LABELS[status]}
          </span>
        </div>

        <h3 className="event-card__title">{titulo}</h3>

        <p className="event-card__description">
          {descricao.length > 150 ? `${descricao.substring(0, 150)}...` : descricao}
        </p>

        <div className="event-card__details">
          <div className="event-card__detail">
            <span className="event-card__icon">📅</span>
            <span>{formatDateRange()}</span>
          </div>
          <div className="event-card__detail">
            <span className="event-card__icon">📍</span>
            <span>{local}</span>
          </div>
          {categoriasCount !== undefined && (
            <div className="event-card__detail">
              <span className="event-card__icon">🏷️</span>
              <span>{categoriasCount} categoria{categoriasCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="event-card__actions">
          <Link href={`/eventos/${id}`} className="btn-primary">
            {isOpen ? 'Ver e Inscrever-se' : 'Ver detalhes'}
          </Link>
        </div>
      </div>
    </div>
  )
}
