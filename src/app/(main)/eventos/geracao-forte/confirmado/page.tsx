"use client"

import { EventConfirmationPage } from '@/components/eventos/EventConfirmationPage'

export default function GeracaoForteConfirmado() {
  return (
    <EventConfirmationPage
      eventId="geracao-forte"
      eventName="Geração Forte"
      eventNameLong="Congresso Setorizado da Geração Forte"
      eventDates="03 a 05 de Julho de 2026"
      eventLocation="IEQ Sede Campo 157 - Redenção/PA"
      eventDetailPath="/eventos/geracao-forte"
      eventLogoUrl="/images/geracao-forte/follow-me-logo.png"
    />
  )
}
