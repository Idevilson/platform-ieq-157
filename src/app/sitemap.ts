import type { MetadataRoute } from 'next'
import { eventos } from '@/data/eventos'

const SITE_URL = 'https://www.ieqredencaopa157.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/eventos`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/sobre`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/historia`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${SITE_URL}/avisos`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/calendario`, lastModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/q4-news`, lastModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/ajuda`, lastModified, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const eventRoutes: MetadataRoute.Sitemap = eventos
    .filter(e => e.status !== 'encerrado')
    .map(e => ({
      url: `${SITE_URL}/eventos/${e.id}`,
      lastModified: new Date(e.dataInicio),
      changeFrequency: 'weekly',
      priority: e.status === 'aberto' ? 0.95 : 0.7,
    }))

  return [...staticRoutes, ...eventRoutes]
}
