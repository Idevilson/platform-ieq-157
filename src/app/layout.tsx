import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

const SITE_URL = 'https://www.ieqredencaopa157.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'IEQ 157 Redenção-PA | Igreja do Evangelho Quadrangular · Capital do Avivamento',
    template: '%s | IEQ 157 Redenção-PA',
  },
  description:
    'Igreja do Evangelho Quadrangular Sede Campo 157 em Redenção-PA. Conheça os horários de culto, eventos, congressos, avisos e a história da Capital do Avivamento. Pastores Heitor Alexandre e Val Nery.',
  keywords: [
    'IEQ Redenção PA',
    'IEQ 157',
    'Igreja Quadrangular Redenção',
    'Igreja do Evangelho Quadrangular',
    'Pr. Heitor Alexandre',
    'Pra. Val Nery',
    'Capital do Avivamento',
    'Campo 157',
    'igreja em Redenção PA',
    'cultos Redenção PA',
    'congresso de jovens Redenção',
    'Geração Forte',
    'Follow Me',
  ],
  authors: [{ name: 'IEQ Sede Campo 157' }],
  creator: 'IEQ Sede Campo 157',
  publisher: 'IEQ Sede Campo 157',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'IEQ 157 Redenção-PA | Capital do Avivamento',
    description:
      'Igreja do Evangelho Quadrangular Sede Campo 157 em Redenção-PA. Cultos, eventos e congressos. Pastores Heitor Alexandre e Val Nery.',
    siteName: 'IEQ 157 Redenção-PA',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IEQ 157 Redenção-PA | Capital do Avivamento',
    description:
      'Igreja do Evangelho Quadrangular Sede Campo 157. Cultos, eventos e congressos em Redenção-PA.',
  },
  icons: {
    icon: '/ieq.ico',
    apple: '/images/logoIEQ.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'religion',
}

export const viewport: Viewport = {
  themeColor: '#D4A017',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const churchJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Church',
  '@id': `${SITE_URL}/#church`,
  name: 'Igreja do Evangelho Quadrangular - Sede Campo 157',
  alternateName: ['IEQ 157', 'IEQ Redenção-PA', 'IEQ Sede Campo 157'],
  url: SITE_URL,
  logo: `${SITE_URL}/images/logoIEQ.png`,
  image: `${SITE_URL}/images/logoIEQ.png`,
  description:
    'Igreja do Evangelho Quadrangular Sede Campo 157 em Redenção-PA. Capital do Avivamento.',
  slogan: 'Capital do Avivamento',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Redenção',
    addressRegion: 'PA',
    addressCountry: 'BR',
  },
  areaServed: {
    '@type': 'City',
    name: 'Redenção',
  },
  founder: [
    { '@type': 'Person', name: 'Pr. Heitor Alexandre' },
    { '@type': 'Person', name: 'Pra. Val Nery' },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '09:00',
      closes: '11:00',
      description: 'Escola Bíblica',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '18:00',
      closes: '20:30',
      description: 'Culto de Celebração',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Wednesday',
      opens: '19:30',
      closes: '21:30',
      description: 'Culto de Ensino',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Friday',
      opens: '19:30',
      closes: '21:30',
      description: 'Culto de Libertação',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(churchJsonLd) }}
        />
      </body>
    </html>
  )
}
