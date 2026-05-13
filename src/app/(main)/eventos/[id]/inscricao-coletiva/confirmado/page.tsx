'use client'

import { use } from 'react'
import { useEventById } from '@/hooks/queries/useEvents'
import { BatchConfirmationPage } from '@/components/inscription/BatchConfirmationPage'

interface Props {
  params: Promise<{ id: string }>
}

function BatchConfirmadoContent({ id }: { id: string }) {
  const { data: evento } = useEventById(id)

  return (
    <BatchConfirmationPage
      eventId={id}
      eventName={evento?.titulo || 'Evento'}
      eventNameLong={evento?.subtitulo ? `${evento.titulo} - ${evento.subtitulo}` : evento?.titulo || 'Evento'}
      eventDates=""
      eventLocation={evento?.local || ''}
      eventDetailPath={`/eventos/${id}`}
    />
  )
}

export default function BatchConfirmadoPage({ params }: Props) {
  const { id } = use(params)
  return <BatchConfirmadoContent id={id} />
}
