import type { Metadata } from 'next'

const SITE_URL = 'https://www.ieqredencaopa157.com'
const EVENT_URL = `${SITE_URL}/eventos/geracao-forte`

const TITLE =
  'Congresso Geração Forte 2026 · Follow Me · 03 a 05 de Julho · IEQ 157 Redenção-PA'
const DESCRIPTION =
  'Congresso Setorizado da Geração Forte 2026 em Redenção-PA: 3 dias de louvor, palavra e comunhão na IEQ Sede Campo 157. De 03 a 05 de julho com Pr. Paulo Bengtson, Pr. Martinho Carmona, Pr. Junior Fernandes, Pr. Heitor Alexandre, Pr. Evando Martins, Mylla Carvalho e J. Ramalho. Inscrições abertas.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    'Congresso Geração Forte 2026',
    'Follow Me Marcos 8:34',
    'Congresso de Jovens Redenção PA',
    'Congresso Setorizado IEQ',
    'IEQ 157 Redenção',
    'Mylla Carvalho Redenção',
    'J. Ramalho Redenção',
    'Pr. Paulo Bengtson',
    'Pr. Martinho Carmona',
    'evento jovens IEQ',
    'congresso julho 2026 Redenção',
  ],
  alternates: {
    canonical: '/eventos/geracao-forte',
  },
  openGraph: {
    type: 'website',
    url: EVENT_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'IEQ 157 Redenção-PA',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Congresso Geração Forte 2026 · Follow Me · 03 a 05 de Julho',
    description:
      'Congresso da Geração Forte 2026 em Redenção-PA. Pr. Paulo Bengtson, Pr. Martinho Carmona, Mylla Carvalho e J. Ramalho. Inscrições abertas.',
  },
}

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  '@id': `${EVENT_URL}#event`,
  name: 'Congresso Setorizado da Geração Forte 2026',
  alternateName: ['Geração Forte 2026', 'Follow Me · Geração Forte', 'Congresso Geração Forte'],
  description: DESCRIPTION,
  startDate: '2026-07-03T19:00:00-03:00',
  endDate: '2026-07-05T13:00:00-03:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  url: EVENT_URL,
  image: [`${EVENT_URL}/opengraph-image`],
  location: {
    '@type': 'Place',
    name: 'IEQ Sede Campo 157',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Redenção',
      addressRegion: 'PA',
      addressCountry: 'BR',
    },
  },
  organizer: {
    '@type': 'Church',
    name: 'Igreja do Evangelho Quadrangular - Sede Campo 157',
    url: SITE_URL,
  },
  performer: [
    { '@type': 'Person', name: 'Pr. Paulo Bengtson' },
    { '@type': 'Person', name: 'Pr. Martinho Carmona' },
    { '@type': 'Person', name: 'Pr. Junior Fernandes' },
    { '@type': 'Person', name: 'Pr. Heitor Alexandre' },
    { '@type': 'Person', name: 'Pr. Evando Martins' },
    { '@type': 'MusicGroup', name: 'Mylla Carvalho & Banda' },
    { '@type': 'Person', name: 'J. Ramalho' },
  ],
  offers: {
    '@type': 'Offer',
    url: `${EVENT_URL}#inscricao`,
    availability: 'https://schema.org/InStock',
    validFrom: '2026-01-01T00:00:00-03:00',
    priceCurrency: 'BRL',
    category: 'Inscrição promocional até 07/06/2026',
  },
  inLanguage: 'pt-BR',
}

export default function GeracaoForteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
    </>
  )
}
