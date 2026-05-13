'use client'

import { BatchConfirmationPage } from '@/components/inscription/BatchConfirmationPage'

export default function GeracaoForteBatchConfirmado() {
  return (
    <BatchConfirmationPage
      eventId="geracao-forte"
      eventName="Geração Forte"
      eventNameLong="Congresso Setorizado da Geração Forte"
      eventDates="03 a 05 de Julho de 2026"
      eventLocation="IEQ Sede Campo 157 - Redenção/PA"
      eventDetailPath="/eventos/geracao-forte"
    />
  )
}
