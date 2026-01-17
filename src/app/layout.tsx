import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ieqredencaopa157.com'),
  title: 'IEQ Campo 157 | Redencao-PA | Capital do Avivamento',
  description: 'IEQ Sede Campo 157 Redencao-PA. Igreja do Evangelho Quadrangular - Capital do Avivamento. Eventos, avisos, calendario e informacoes da igreja.',
  keywords: 'IEQ Redencao PA, Igreja Quadrangular, Pr Heitor Alexandre, Pra Val Nery, Capital do Avivamento, Campo 157, eventos, igreja',
  openGraph: {
    type: 'website',
    url: 'https://www.ieqredencaopa157.com/',
    title: 'IEQ Campo 157 | Redencao-PA | Capital do Avivamento',
    description: 'Igreja do Evangelho Quadrangular - Sede Campo 157. Eventos, avisos, calendario e informacoes. Capital do Avivamento.',
    siteName: 'IEQ 157',
    locale: 'pt_BR',
    images: [
      {
        url: '/images/logoIEQ.png',
        width: 800,
        height: 600,
        alt: 'Logo IEQ 157',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IEQ Campo 157 | Redencao-PA | Capital do Avivamento',
    description: 'Igreja do Evangelho Quadrangular - Sede Campo 157. Eventos, avisos e informacoes.',
    images: ['/images/logoIEQ.png'],
  },
  icons: {
    icon: '/ieq.ico',
    apple: '/images/logoIEQ.png',
  },
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
      </body>
    </html>
  )
}
