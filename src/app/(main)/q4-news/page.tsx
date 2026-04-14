'use client'

import { useQ4NewsList } from '@/hooks/queries/useQ4News'
import { NewsPostSummaryDTO } from '@/shared/types'
import Link from 'next/link'
import Image from 'next/image'

function formatDate(date: string | Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function Q4NewsPage() {
  const { data: posts, isLoading, error } = useQ4NewsList()

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Q4-News</h1>
            <p className="text-text-secondary">Fique por dentro das novidades</p>
          </div>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="spinner" />
            <p className="text-text-secondary">Carregando noticias...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Q4-News</h1>
            <p className="text-text-secondary">Fique por dentro das novidades</p>
          </div>
          <div className="card text-center py-12">
            <p className="text-red-400">Erro ao carregar noticias. Tente novamente mais tarde.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Q4-News</h1>
          <p className="text-text-secondary">Fique por dentro das novidades</p>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">Nenhuma noticia publicada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post: NewsPostSummaryDTO) => (
              <Link
                key={post.id}
                href={`/q4-news/${post.id}`}
                className="bg-bg-tertiary border border-gold/20 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-gold/40 transition-all no-underline group"
              >
                <div className="relative aspect-video w-full bg-bg-secondary">
                  <Image
                    src={`https://img.youtube.com/vi/${post.youtubeVideoId}/maxresdefault.jpg`}
                    alt={post.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-text-primary mb-2 group-hover:text-gold transition-colors">
                    {post.titulo}
                  </h2>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                    {post.descricao}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{post.autorNome}</span>
                    <span>{formatDate(post.publicadoEm)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
