'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQ4NewsById } from '@/hooks/queries/useQ4News'

function formatDate(date: string | Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}`
}

export default function Q4NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: post, isLoading, error } = useQ4NewsById(id)

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="spinner" />
            <p className="text-text-secondary">Carregando noticia...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error || !post) {
    return (
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/q4-news" className="text-sm text-text-secondary hover:text-gold transition-colors no-underline">
            &larr; Voltar para Q4-News
          </Link>
          <div className="card text-center py-12 mt-6">
            <p className="text-red-400">Noticia nao encontrada.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/q4-news" className="text-sm text-text-secondary hover:text-gold transition-colors no-underline">
          &larr; Voltar para Q4-News
        </Link>

        <div className="mt-6">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-bg-secondary">
            <iframe
              src={getYouTubeEmbedUrl(post.youtubeVideoId)}
              title={post.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <h1 className="text-3xl font-bold text-text-primary mt-6">{post.titulo}</h1>

          <div className="flex items-center gap-3 mt-3 text-sm text-text-muted">
            <span>{post.autorNome}</span>
            <span className="w-1 h-1 rounded-full bg-text-muted" />
            <span>{formatDate(post.publicadoEm)}</span>
          </div>

          <hr className="border-gold/10 my-6" />

          <div className="text-text-secondary whitespace-pre-line leading-relaxed">
            {post.conteudo}
          </div>
        </div>
      </div>
    </section>
  )
}
