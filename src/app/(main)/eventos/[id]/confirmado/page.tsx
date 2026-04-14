'use client'

import { use } from 'react'
import { useEventById } from '@/hooks/queries/useEvents'
import { EventConfirmationPage } from '@/components/eventos/EventConfirmationPage'

interface Props {
  params: Promise<{ id: string }>
}

function ConfirmadoContent({ id }: { id: string }) {
  const { data: evento } = useEventById(id)

  return (
    <EventConfirmationPage
      eventId={id}
      eventName={evento?.titulo || 'Evento'}
      eventNameLong={evento?.subtitulo ? `${evento.titulo} - ${evento.subtitulo}` : evento?.titulo || 'Evento'}
      eventDates=""
      eventLocation={evento?.local || ''}
      eventDetailPath={`/eventos/${id}`}
    />
  )
}

export default function ConfirmadoPage({ params }: Props) {
  const { id } = use(params)
  return <ConfirmadoContent id={id} />
}
