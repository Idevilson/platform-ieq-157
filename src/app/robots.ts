import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.ieqredencaopa157.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/minha-conta',
          '/minha-conta/',
          '/login',
          '/cadastro',
          '/recuperar-senha',
          '/eventos/*/inscricao',
          '/eventos/*/inscricao-coletiva',
          '/eventos/*/confirmado',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
