'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQ4NewsList } from '@/hooks/queries/useQ4News'

function formatDate(date: string | Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function LatestQ4NewsSection() {
  const { data: posts, isLoading } = useQ4NewsList()

  if (isLoading) return null
  if (!posts || posts.length === 0) return null

  const latest = posts[0]

  return (
    <section className="py-16 bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gold">Última do Q4-News</h2>
          <Link
            href="/q4-news"
            className="text-sm text-gold hover:text-gold-light transition-colors no-underline"
          >
            Ver todas →
          </Link>
        </div>

        <Link
          href={`/q4-news/${latest.id}`}
          className="block group no-underline"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-tertiary border border-gold/20 rounded-2xl overflow-hidden hover:border-gold/40 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,215,0,0.1)]">
            <div className="relative aspect-video md:aspect-auto bg-bg-secondary">
              {latest.youtubeVideoId && (
                <Image
                  src={`https://img.youtube.com/vi/${latest.youtubeVideoId}/maxresdefault.jpg`}
                  alt={latest.titulo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span className="inline-block w-fit px-3 py-1 text-xs font-medium rounded-full bg-gold/20 text-gold border border-gold/30 mb-3">
                Q4-News
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 group-hover:text-gold transition-colors">
                {latest.titulo}
              </h3>
              <p className="text-text-secondary mb-4 line-clamp-3">{latest.descricao}</p>
              <span className="text-xs text-text-muted">
                {formatDate(latest.publicadoEm ?? null)}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
