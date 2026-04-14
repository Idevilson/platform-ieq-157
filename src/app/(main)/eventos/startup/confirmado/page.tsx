"use client"

import { EventConfirmationPage } from '@/components/eventos/EventConfirmationPage'

export default function StartupConfirmado() {
  return (
    <EventConfirmationPage
      eventId="startup"
      eventName="STARTUP"
      eventNameLong="STARTUP - A Unção dos Quatro Seres"
      eventDates="30 e 31 de Janeiro | 01 de Fevereiro de 2026"
      eventLocation="IEQ Campo 157 - Redenção/PA"
      eventDetailPath="/eventos/startup"
    />
  )
}
