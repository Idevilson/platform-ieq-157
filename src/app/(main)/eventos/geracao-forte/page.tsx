"use client"

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEventById, useEventCategories } from '@/hooks/queries/useEvents'
import { SmartInscriptionForm } from '@/components/inscription'
import { PerkCounter } from '@/components/eventos/PerkCounter'
import followMeLogo from '@/assets/images/geracao-forte/follow-me-logo.png'

const EVENT_ID = 'geracao-forte'

const DAY_CARDS = [
  {
    label: 'SEXTA-FEIRA',
    date: '03/07/2026',
    highlight: 'Abertura · Ministração',
  },
  {
    label: 'SÁBADO',
    date: '04/07/2026',
    highlight: 'Ministração · Louvor · Almoço · Janta',
  },
  {
    label: 'DOMINGO',
    date: '05/07/2026',
    highlight: 'Ministração · Santa Ceia · Encerramento',
  },
]

export default function GeracaoForte() {
  const router = useRouter()
  const { data: evento } = useEventById(EVENT_ID)
  const { data: categorias } = useEventCategories(EVENT_ID)

  const handleInscricao = () => {
    document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInscriptionSuccess = (inscriptionId: string) => {
    router.push(`/eventos/${EVENT_ID}/confirmado?inscriptionId=${inscriptionId}&eventId=${EVENT_ID}`)
  }

  const eventCategorias = categorias || evento?.categorias || []

  return (
    <>
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-[70px] pt-[70px]">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary" />
        <div className="relative z-10 text-center px-4 py-16 max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-gold/80 mb-4">
            Geração Forte · IEQ Sede Campo 157
          </h2>

          <div className="mx-auto mb-8 max-w-2xl">
            <Image
              src={followMeLogo}
              alt="Follow Me - Marcos 8:34"
              className="w-full h-auto"
              priority
            />
          </div>

          <p className="text-xl md:text-2xl text-gold font-semibold mb-4">
            Congresso Setorizado da Geração Forte
          </p>
          <p className="text-lg text-text-secondary mb-6">03 a 05 de Julho de 2026</p>
          <p className="text-sm md:text-base text-text-secondary/80 italic max-w-2xl mx-auto mb-8">
            &quot;Se alguém quer vir após mim, negue-se a si mesmo, tome a sua cruz e siga-me.&quot; — Marcos 8:34
          </p>
          <button
            className="px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-bg-primary font-bold text-lg rounded-full hover:shadow-gold hover:-translate-y-1 transition-all"
            onClick={handleInscricao}
          >
            INSCREVA-SE AGORA
          </button>
        </div>
      </header>

      <section className="py-16 bg-bg-secondary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-lg text-text-secondary leading-relaxed mb-4">
            Um chamado para uma geração que decide{' '}
            <strong className="text-gold">seguir Cristo de verdade</strong> — sem negociação, sem meio-termo,
            sem máscaras.
          </p>
          <p className="text-lg text-text-secondary leading-relaxed">
            Três dias de imersão, ministração, adoração e comunhão para fortalecer quem quer viver o que
            foi chamado a viver.
          </p>
        </div>
      </section>

      <section className="py-16 bg-bg-primary">
        <div className="max-w-5xl mx-auto px-4">
          <PerkCounter
            eventId={EVENT_ID}
            description="Os primeiros 500 inscritos pagantes confirmados ganham uma pulseira colorida exclusiva do congresso."
          />
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-bg-primary to-bg-secondary">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gold text-center mb-4">
            Programação do Encontro
          </h2>

          <div className="mb-10 max-w-2xl mx-auto text-center p-6 bg-gold/5 border border-gold/20 rounded-2xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gold font-semibold text-sm uppercase tracking-wide">Em breve</span>
            </div>
            <p className="text-text-secondary">
              Esta página será atualizada em breve com <strong className="text-text-primary">toda a programação, palestrantes e detalhes completos</strong> do evento.
              Fique de olho!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DAY_CARDS.map((day) => (
              <div key={day.date} className="card">
                <div className="bg-gold/10 -mx-6 -mt-6 px-6 py-4 mb-6 rounded-t-xl border-b border-gold/20">
                  <h3 className="text-xl font-bold text-gold">{day.label}</h3>
                  <p className="text-sm text-text-secondary">{day.date}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-text-secondary text-sm">{day.highlight}</p>
                  <p className="text-text-muted text-xs italic">Programação detalhada em breve</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="inscricao" className="py-16 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gold text-center mb-8">
            Faça sua Inscrição
          </h2>
          <div className="text-center mb-10">
            <div className="flex justify-center gap-3 mb-4">
              <span className="px-4 py-2 bg-gold text-bg-primary font-bold rounded-lg">03 JUL</span>
              <span className="px-4 py-2 bg-gold text-bg-primary font-bold rounded-lg">04 JUL</span>
              <span className="px-4 py-2 bg-gold text-bg-primary font-bold rounded-lg">05 JUL</span>
            </div>
            <p className="text-text-secondary">
              Early bird até <strong className="text-gold">31/05/2026</strong>. Depois dessa data, os valores sobem.
            </p>
          </div>

          <SmartInscriptionForm
            eventId={EVENT_ID}
            eventTitle={evento?.titulo || 'Congresso Setorizado da Geração Forte'}
            categories={eventCategorias}
            paymentMethods={evento?.metodosPagamento}
            onSuccess={handleInscriptionSuccess}
          />
        </div>
      </section>
    </>
  )
}
