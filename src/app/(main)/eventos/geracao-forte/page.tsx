"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEventById } from '@/hooks/queries/useEvents'
import { usePerkSummary } from '@/hooks/queries/usePerkSummary'
import { useAuth } from '@/hooks'
import { SmartInscriptionForm } from '@/components/inscription'
import { AccountBenefitsCard } from '@/components/inscription/AccountBenefitsCard'
import { PerkCounter } from '@/components/eventos/PerkCounter'
import { DeadlineExtensionBanner } from '@/components/eventos/DeadlineExtensionBanner'
import { WhatsAppSupport } from '@/components/common/WhatsAppSupport'
import followMeLogo from '@/assets/images/geracao-forte/follow-me-logo.png'
import imgBengtson from '@/assets/images/geracao-forte/palestrantes/paulo bengtson ESTILOSO.jpg'
import imgCarmona from '@/assets/images/geracao-forte/palestrantes/Martinho Carmona.jpg'
import imgJunior from '@/assets/images/geracao-forte/palestrantes/Pr Junhao.jpg'
import imgHeitor from '@/assets/images/geracao-forte/palestrantes/Pr Heitor Alexandre.jpg'
import imgEvando from '@/assets/images/geracao-forte/palestrantes/Evando Filho.jpg'
import imgOrganizadores from '@/assets/images/geracao-forte/pr-heitor-e-pra-val.jpg'
import imgMyllaPortrait from '@/assets/images/geracao-forte/mylla-carvalho-portrait.jpg'
import imgMyllaBanda from '@/assets/images/geracao-forte/mylla-carvalho-banda.jpg'
import imgRamalho from '@/assets/images/geracao-forte/j-ramalho.jpg'
import imgPlanetaMusic from '@/assets/images/geracao-forte/patrocinadores/planeta-music.png'
import imgCentroContabil from '@/assets/images/geracao-forte/patrocinadores/centro-contabil.png'
import imgAcquaPark from '@/assets/images/geracao-forte/patrocinadores/acqua-park.png'
import imgClubeDescoladao from '@/assets/images/geracao-forte/patrocinadores/clube-descoladao.png'
import imgArenaOcBurguer from '@/assets/images/geracao-forte/patrocinadores/arena-oc-burguer.png'
import imgNorteSulCosmeticos from '@/assets/images/geracao-forte/patrocinadores/norte-e-sul-cosmeticos.png'
import imgAcaiteriaMilgraus from '@/assets/images/geracao-forte/patrocinadores/acaiteria-milgraus.png'
import imgCamisetaFrente from '@/assets/images/geracao-forte/kit/camiseta-frente.jpeg'
import imgCamisetaCostas from '@/assets/images/geracao-forte/kit/camiseta-costas.jpeg'
import imgPulseiraDourada from '@/assets/images/geracao-forte/kit/pulseira-dourada.jpeg'
import imgPulseiraAzul from '@/assets/images/geracao-forte/kit/pulseira-azul.jpeg'
import imgPulseirasLed from '@/assets/images/geracao-forte/kit/pulseiras-led.png'

const EVENT_ID = 'geracao-forte'


const SPEAKERS = [
  { name: 'PR. PAULO BENGTSON',   photo: imgBengtson },
  { name: 'PR. MARTINHO CARMONA', photo: imgCarmona  },
  { name: 'PR. JUNIOR FERNANDES', photo: imgJunior   },
  { name: 'PR. HEITOR ALEXANDRE', photo: imgHeitor   },
  { name: 'PR. EVANDO MARTINS',   photo: imgEvando  },
]

type ScheduleItem = { time: string; activity: string; icon: string; detail?: string }
type ScheduleBlock = { heading?: string; items: ScheduleItem[] }

const SCHEDULE: { label: string; date: string; color: string; blocks: ScheduleBlock[] }[] = [
  {
    label: 'SEXTA-FEIRA',
    date: '03 de Julho',
    color: '#F5B800',
    blocks: [
      {
        items: [
          { time: '19h30', activity: 'Boas-vindas', detail: 'Pr. Lee Maracaipe — Coord. Regional', icon: '🎤' },
          { time: '19h35', activity: 'Louvor', detail: 'Equipe Campo de Redenção', icon: '🎵' },
          { time: '20h00', activity: 'Coreografia de Abertura', detail: 'Campo de Redenção', icon: '💃' },
          { time: '20h20', activity: 'Palavra', detail: 'Pr. Heitor Alexandre — Diretor do Campo de Redenção', icon: '📖' },
          { time: '20h30', activity: 'Palavra', detail: 'Pr. Paulo Bengtson — Coord. Estadual de Jovens', icon: '📖' },
          { time: '20h40', activity: 'Mensagem', detail: 'Pr. Jota Ramalho', icon: '📖' },
          { time: '22h00', activity: 'Avisos / Jantar', icon: '🍽️' },
        ],
      },
    ],
  },
  {
    label: 'SÁBADO',
    date: '04 de Julho',
    color: '#00AADD',
    blocks: [
      {
        heading: 'Manhã',
        items: [
          { time: '07h30', activity: 'Café da manhã', icon: '☕' },
          { time: '08h30', activity: 'Louvor', detail: '1ª Região de Parauapebas', icon: '🎵' },
          { time: '09h00', activity: 'Mensagem', detail: 'Pr. Martinho Carmona', icon: '📖' },
          { time: '09h45', activity: 'Intervalo', icon: '⏸️' },
          { time: '10h00', activity: 'Louvor', detail: 'Equipe de Xinguara', icon: '🎵' },
          { time: '10h30', activity: 'Mensagem', detail: 'Pr. Júnior Fernandes', icon: '📖' },
          { time: '11h45', activity: 'Avisos / Encerramento', icon: '📢' },
          { time: '12h00', activity: 'Almoço', icon: '🍽️' },
        ],
      },
      {
        heading: 'Noite',
        items: [
          { time: '17h30', activity: 'Amostra de Artes', detail: 'Coord. Campo de Redenção', icon: '🎨' },
          { time: '19h30', activity: 'Louvor', detail: 'Campo de Redenção', icon: '🎵' },
          { time: '20h00', activity: 'Mensagem', detail: 'Pr. Evando Martins', icon: '📖' },
          { time: '21h00', activity: 'Avisos / Jantar', icon: '🍽️' },
          { time: '22h00', activity: 'Show', detail: 'Milla Carvalho e Banda', icon: '🎤' },
        ],
      },
    ],
  },
  {
    label: 'DOMINGO',
    date: '05 de Julho',
    color: '#7B3FB5',
    blocks: [
      {
        items: [
          { time: '07h30', activity: 'Café da manhã', icon: '☕' },
          { time: '08h30', activity: 'Louvor', detail: 'Campo de Redenção', icon: '🎵' },
          { time: '09h00', activity: 'Mensagem', detail: 'Pr. Heitor Alexandre', icon: '📖' },
          { time: '10h00', activity: 'Premiação / Caravanas', icon: '🏆' },
          { time: '10h20', activity: 'Ministração da Santa Ceia', detail: 'Pastora Val', icon: '✝️' },
          { time: '11h00', activity: 'Agradecimentos e considerações finais', icon: '🙏' },
          { time: '11h30', activity: 'Encerramento', icon: '🏁' },
          { time: '12h00', activity: 'Almoço', icon: '🍽️' },
        ],
      },
    ],
  },
]

export default function GeracaoForte() {
  const router = useRouter()
  const { data: evento } = useEventById(EVENT_ID)
  const { data: perk } = usePerkSummary(EVENT_ID)
  const { isAuthenticated, loading: authLoading } = useAuth()

  const handleInscricao = () => {
    document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInscriptionSuccess = (inscriptionId: string) => {
    router.push(`/eventos/${EVENT_ID}/confirmado?inscriptionId=${inscriptionId}&eventId=${EVENT_ID}`)
  }

  const eventCategorias = evento?.categorias ?? []

  return (
    <div className="relative">
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none bg-event-ambient" />
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-[70px] pt-[70px]">
        <div className="absolute inset-0 bg-bg-primary" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 18%, rgba(82,39,255,0.28) 0%, transparent 60%),' +
              'radial-gradient(ellipse 80% 60% at 50% 95%, rgba(212,160,23,0.22) 0%, transparent 65%),' +
              'radial-gradient(circle at 85% 12%, rgba(255,215,0,0.10) 0%, transparent 40%),' +
              'radial-gradient(circle at 12% 78%, rgba(123,63,181,0.16) 0%, transparent 42%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary" />
        <div className="relative z-10 text-center px-4 py-16 max-w-4xl mx-auto animate-fade-in">
          <p className="text-sm md:text-base uppercase tracking-[0.3em] text-gold/80 mb-4">
            Geração Forte · IEQ Sede Campo 157
          </p>

          <div className="relative mx-auto mb-8 max-w-2xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -m-10"
              style={{
                background:
                  'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0.06) 40%, transparent 72%)',
              }}
            />
            <Image
              src={followMeLogo}
              alt="Follow Me - Marcos 8:34"
              className="relative w-full h-auto"
              priority
            />
          </div>

          <h1 className="text-xl md:text-2xl text-gold font-semibold mb-4">
            Congresso Setorizado da Geração Forte 2026 · Follow Me · Redenção-PA
          </h1>
          <p className="text-lg text-text-secondary mb-6">03 a 05 de Julho de 2026</p>

          <div className="max-w-2xl mx-auto mb-8 flex items-center gap-4">
            <span aria-hidden className="hidden md:block h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
            <div className="text-center px-2 max-w-[440px] mx-auto">
              <p className="text-sm md:text-base text-text-secondary italic leading-relaxed">
                &ldquo;Se alguém quer vir após mim, negue-se a si mesmo, tome a sua cruz e siga-me.&rdquo;
              </p>
              <p className="mt-2 text-[10px] tracking-[0.3em] uppercase text-gold/70 font-semibold">
                Marcos 8:34
              </p>
            </div>
            <span aria-hidden className="hidden md:block h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
          </div>

          <button
            className="px-10 py-4 bg-gradient-to-r from-gold to-gold-dark text-bg-primary font-black text-lg rounded-full shadow-gold ring-1 ring-gold/40 hover:shadow-gold-lg hover:ring-gold/70 hover:-translate-y-1 transition-all"
            onClick={handleInscricao}
          >
            INSCREVA-SE AGORA
          </button>
        </div>
      </header>

      <div className="relative z-10 py-3 bg-[#D4A017]">
        <p className="text-[#0D0D0D] font-black text-xs uppercase tracking-widest text-center px-4">
          GERAÇÃO FORTE · 03 A 05 DE JULHO · IEQ SEDE CAMPO 157 · FOLLOW ME
        </p>
      </div>

      {/* Sobre o Evento */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">

          {/* Coluna esquerda */}
          <div className="relative flex-1 min-w-0">
            <span
              aria-hidden
              className="absolute select-none font-black text-gold leading-none pointer-events-none"
              style={{ fontSize: '280px', opacity: 0.06, top: '50%', left: '-20px', transform: 'translateY(-50%)', zIndex: 0 }}
            >
              3
            </span>
            <div className="relative z-10">
              <div className="mb-5">
                <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-gold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full bg-gold/10 border border-gold/25">
                  ✝ Follow Me · Marcos 8:34
                </span>
              </div>
              <p className="text-[48px] md:text-[52px] font-black text-white leading-[1.05] uppercase">3 DIAS.</p>
              <p className="text-[48px] md:text-[52px] font-black text-white leading-[1.05] uppercase">1 CHAMADO.</p>
              <p
                className="text-[48px] md:text-[52px] font-black leading-[1.05] uppercase"
                style={{ background: 'linear-gradient(90deg, #FFD700, #DAA520)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                1 DECISÃO.
              </p>

              <p className="mt-8 text-text-secondary text-base leading-relaxed max-w-[420px]">
                Um chamado para uma geração que decide seguir Cristo de verdade — sem negociação, sem meio-termo, sem máscaras.
              </p>

              <button
                onClick={handleInscricao}
                className="mt-6 text-gold font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
              >
                INSCREVA-SE <span>→</span>
              </button>
            </div>
          </div>

          {/* Coluna direita — pilares */}
          <div className="flex flex-col gap-4 w-full md:w-[380px] flex-shrink-0">
            <div className="card-hover flex items-center gap-4 bg-bg-secondary rounded-xl px-6 py-5 border-l-[3px] border-[#E02020]" style={{ '--glow-color': 'rgba(224,32,32,0.3)' } as React.CSSProperties}>
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-bold text-white text-sm uppercase tracking-wide">Ministração</p>
                <p className="text-text-muted text-xs mt-0.5">Palavra que transforma</p>
              </div>
            </div>
            <div className="card-hover flex items-center gap-4 bg-bg-secondary rounded-xl px-6 py-5 border-l-[3px] border-[#F5B800]" style={{ '--glow-color': 'rgba(245,184,0,0.3)' } as React.CSSProperties}>
              <span className="text-2xl">🎵</span>
              <div>
                <p className="font-bold text-white text-sm uppercase tracking-wide">Louvor</p>
                <p className="text-text-muted text-xs mt-0.5">Adoração que liberta</p>
              </div>
            </div>
            <div className="card-hover flex items-center gap-4 bg-bg-secondary rounded-xl px-6 py-5 border-l-[3px] border-[#00AADD]" style={{ '--glow-color': 'rgba(0,170,221,0.3)' } as React.CSSProperties}>
              <span className="text-2xl">🤝</span>
              <div>
                <p className="font-bold text-white text-sm uppercase tracking-wide">Comunhão</p>
                <p className="text-text-muted text-xs mt-0.5">Rede que fortalece</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="relative z-10 py-20 overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 -left-20 w-[460px] h-[460px] rounded-full blur-3xl opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(245,184,0,0.10), transparent 70%)' }}
          />
          <div
            className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(0,170,221,0.09), transparent 70%)' }}
          />
          <div
            className="absolute -bottom-32 left-1/4 w-[480px] h-[480px] rounded-full blur-3xl opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(123,63,181,0.10), transparent 70%)' }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">

          <div className="flex justify-center mb-5">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-gold/70">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/40" />
              Três dias de imersão
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/40" />
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white text-center uppercase tracking-tight mb-4 text-glow">
            Cronograma
          </h2>

          <p className="text-center text-text-muted text-sm md:text-base max-w-md mx-auto mb-4">
            Programação completa do Congresso Estadual Setorizado 2026.
          </p>

          <div className="flex justify-center mb-14">
            <span className="text-[10px] text-text-muted/80 border border-white/10 rounded-full px-3.5 py-1 uppercase tracking-[0.22em]">
              Sujeito a ajustes
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {SCHEDULE.map((day, dayIdx) => (
              <div
                key={day.label}
                className="card-hover relative rounded-3xl overflow-hidden bg-bg-secondary/70 backdrop-blur-sm border border-white/5"
                style={{ '--glow-color': `${day.color}55` } as React.CSSProperties}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${day.color}, transparent)` }}
                />

                <div className="relative px-6 pt-7 pb-6 overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none opacity-60"
                    style={{ background: `radial-gradient(ellipse 90% 100% at 0% 0%, ${day.color}1F, transparent 65%)` }}
                  />
                  <div className="relative flex items-center gap-4">
                    <span
                      className="text-[56px] leading-none font-black tracking-tighter"
                      style={{ color: day.color, textShadow: `0 0 24px ${day.color}40` }}
                    >
                      {String(dayIdx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.28em] text-text-muted">
                        Dia {dayIdx + 1}
                      </span>
                      <h3 className="text-base font-black uppercase tracking-wider" style={{ color: day.color }}>
                        {day.label}
                      </h3>
                      <p className="text-text-muted text-xs mt-0.5">{day.date}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-7 space-y-6">
                  {day.blocks.map((block, blockIdx) => (
                    <div key={blockIdx}>
                      {block.heading && (
                        <div className="flex items-center gap-3 mb-4">
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.28em]"
                            style={{ color: day.color }}
                          >
                            {block.heading}
                          </span>
                          <span
                            className="flex-1 h-px"
                            style={{ background: `linear-gradient(to right, ${day.color}55, transparent)` }}
                          />
                        </div>
                      )}
                      <ol className="relative space-y-4">
                        <span
                          aria-hidden
                          className="absolute left-4 top-3 bottom-3 w-px"
                          style={{ background: `linear-gradient(to bottom, ${day.color}55, ${day.color}10)` }}
                        />
                        {block.items.map((item, idx) => (
                          <li key={idx} className="relative flex items-start gap-3.5">
                            <div
                              className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm z-10 bg-bg-secondary"
                              style={{
                                border: `1px solid ${day.color}55`,
                                boxShadow: `0 0 0 4px var(--color-bg-secondary, #1a1a1a), 0 0 12px ${day.color}30`,
                              }}
                            >
                              {item.icon}
                            </div>
                            <div className="min-w-0 pt-0.5">
                              <p
                                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                                style={{ color: day.color }}
                              >
                                {item.time}
                              </p>
                              <p className="text-white text-sm font-semibold leading-snug mt-0.5">
                                {item.activity}
                              </p>
                              {item.detail && (
                                <p className="text-text-muted text-xs mt-1 leading-snug">{item.detail}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria dos Palestrantes */}
      <section className="relative z-10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tight mb-14">
            Galeria dos Palestrantes
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {SPEAKERS.map((speaker) => (
              <div
                key={speaker.name}
                className="card-hover rounded-2xl overflow-hidden bg-[#141414] flex flex-col w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] max-w-[280px]"
                style={{
                  border: '1px solid rgba(212,160,23,0.25)',
                  '--glow-color': 'rgba(212,160,23,0.35)',
                } as React.CSSProperties}
              >
                {/* Foto */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <Image
                    src={speaker.photo}
                    alt={speaker.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 280px"
                    className="object-cover object-top"
                  />
                  {/* Gradient fade bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                </div>

                {/* Info */}
                <div className="px-5 py-4 flex flex-col items-center gap-2 -mt-6 relative z-10">
                  <p className="font-black text-white text-sm md:text-base uppercase tracking-wide text-center">
                    {speaker.name}
                  </p>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: 'rgba(212,160,23,0.15)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}
                  >
                    Palestrante
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kit do Participante */}
      <section className="relative z-10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <span className="text-xs text-text-muted border border-white/10 rounded-full px-4 py-1.5 uppercase tracking-widest">
              Incluso na inscrição pagante
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tight mb-4">
            Kit do Congressista
          </h2>
          <p className="text-text-secondary text-center mb-14 max-w-xl mx-auto">
            Cada congressista pagante recebe um kit exclusivo Follow Me para levar pra casa.
          </p>

          {/* Linha 1: Camiseta + Pulseiras de controle */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
            {/* Camiseta Frente */}
            <div
              className="card-hover rounded-2xl overflow-hidden bg-[#141414] flex flex-col"
              style={{ border: '1px solid rgba(212,160,23,0.2)', '--glow-color': 'rgba(212,160,23,0.3)' } as React.CSSProperties}
            >
              <div className="relative w-full aspect-square overflow-hidden">
                <Image src={imgCamisetaFrente} alt="Camiseta Follow Me — frente" fill sizes="(max-width: 768px) 50vw, 256px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              </div>
              <div className="px-4 py-4 flex flex-col items-center gap-1.5 -mt-4 relative z-10">
                <p className="font-black text-white text-xs uppercase tracking-wide text-center">Camiseta</p>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.25)' }}>
                  Frente
                </span>
              </div>
            </div>

            {/* Camiseta Costas */}
            <div
              className="card-hover rounded-2xl overflow-hidden bg-[#141414] flex flex-col"
              style={{ border: '1px solid rgba(212,160,23,0.2)', '--glow-color': 'rgba(212,160,23,0.3)' } as React.CSSProperties}
            >
              <div className="relative w-full aspect-square overflow-hidden">
                <Image src={imgCamisetaCostas} alt="Camiseta Follow Me — costas" fill sizes="(max-width: 768px) 50vw, 256px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              </div>
              <div className="px-4 py-4 flex flex-col items-center gap-1.5 -mt-4 relative z-10">
                <p className="font-black text-white text-xs uppercase tracking-wide text-center">Camiseta</p>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.25)' }}>
                  Costas
                </span>
              </div>
            </div>

            {/* Pulseira Dourada */}
            <div
              className="card-hover rounded-2xl overflow-hidden bg-[#141414] flex flex-col"
              style={{ border: '1px solid rgba(245,184,0,0.2)', '--glow-color': 'rgba(245,184,0,0.3)' } as React.CSSProperties}
            >
              <div className="relative w-full aspect-square overflow-hidden">
                <Image src={imgPulseiraDourada} alt="Pulseira dourada do evento" fill sizes="(max-width: 768px) 50vw, 256px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              </div>
              <div className="px-4 py-4 flex flex-col items-center gap-1.5 -mt-4 relative z-10">
                <p className="font-black text-white text-xs uppercase tracking-wide text-center">Pulseira Holográfica</p>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,184,0,0.12)', color: '#F5B800', border: '1px solid rgba(245,184,0,0.25)' }}>
                  Identificação
                </span>
              </div>
            </div>

            {/* Pulseira Azul */}
            <div
              className="card-hover rounded-2xl overflow-hidden bg-[#141414] flex flex-col"
              style={{ border: '1px solid rgba(0,170,221,0.2)', '--glow-color': 'rgba(0,170,221,0.3)' } as React.CSSProperties}
            >
              <div className="relative w-full aspect-square overflow-hidden">
                <Image src={imgPulseiraAzul} alt="Pulseira azul do evento" fill sizes="(max-width: 768px) 50vw, 256px" className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              </div>
              <div className="px-4 py-4 flex flex-col items-center gap-1.5 -mt-4 relative z-10">
                <p className="font-black text-white text-xs uppercase tracking-wide text-center">Pulseira Holográfica</p>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,170,221,0.12)', color: '#00AADD', border: '1px solid rgba(0,170,221,0.25)' }}>
                  Identificação
                </span>
              </div>
            </div>
          </div>

          {/* Linha 2: Pulseiras LED — brinde primeiras 600 */}
          <div className="rounded-2xl overflow-hidden bg-[#0D0D0D] flex flex-col md:flex-row card-hover"
            style={{ border: '1px solid rgba(123,63,181,0.3)', '--glow-color': 'rgba(123,63,181,0.4)' } as React.CSSProperties}
          >
            <div className="relative w-full md:w-72 aspect-video md:aspect-auto overflow-hidden flex-shrink-0">
              <Image src={imgPulseirasLed} alt="Pulseiras LED coloridas" fill sizes="(max-width: 768px) 100vw, 288px" className="object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0D0D] hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent md:hidden" />
            </div>
            <div className="flex-1 px-6 py-6 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'rgba(212,160,23,0.15)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.35)' }}>
                  ⚡ Primeiras 600 inscrições
                </span>
              </div>
              <p className="font-black text-white text-lg uppercase tracking-wide">Pulseiras de LED para o Show</p>
              <p className="text-text-muted text-sm leading-relaxed">
                Os primeiros 600 inscritos pagantes confirmados ganham pulseiras LED coloridas exclusivas do congresso — acendem no ritmo da música durante o louvor.
              </p>
              {perk && (
                <div className="mt-1">
                  {perk.disponivel ? (
                    <>
                      <p className="text-2xl font-black text-gold">
                        {perk.quantidadeRestante} <span className="text-text-muted font-normal text-base">/ {perk.limiteEstoque} restantes</span>
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden w-full max-w-[240px]">
                        <div
                          className="h-full bg-gold transition-all duration-500"
                          style={{ width: `${Math.round((1 - perk.quantidadeRestante / perk.limiteEstoque) * 100)}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-red-400 uppercase tracking-wide">Pulseiras esgotadas</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Item extra — garrafinha */}
          <div className="mt-5">
            <div className="card-hover flex items-center gap-4 bg-bg-secondary rounded-xl px-6 py-5 border-l-[3px] border-[#00AADD]"
              style={{ '--glow-color': 'rgba(0,170,221,0.3)' } as React.CSSProperties}>
              <span className="text-3xl">💧</span>
              <div>
                <p className="font-bold text-white text-sm uppercase tracking-wide">Garrafinha de Água</p>
                <p className="text-text-muted text-xs mt-0.5">Exclusiva Follow Me</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Atrações Musicais */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">

          {/* Header */}
          <div className="flex justify-center mb-6">
            <span className="text-xs text-text-muted border border-white/10 rounded-full px-4 py-1.5 uppercase tracking-widest">
              Atrações Musicais
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tight mb-2">
            Shows Confirmados
          </h2>
          <p
            className="text-3xl md:text-4xl font-black text-center uppercase tracking-tight mb-14"
            style={{ background: 'linear-gradient(90deg, #D4A017, #F5B800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Mylla Carvalho &amp; J. Ramalho
          </p>

          {/* Layout: portrait esquerda + landscape direita */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

            {/* Portrait */}
            <div
              className="card-hover rounded-2xl overflow-hidden bg-[#141414]"
              style={{ border: '1px solid rgba(212,160,23,0.2)', '--glow-color': 'rgba(212,160,23,0.35)' } as React.CSSProperties}
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <Image
                  src={imgMyllaPortrait}
                  alt="Mylla Carvalho"
                  fill
                  sizes="(max-width: 768px) 100vw, 512px"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-10">
                  <p className="font-black text-white text-xl uppercase tracking-wide">Mylla Carvalho</p>
                  <p className="text-gold text-sm font-medium mt-0.5">Cantora Gospel</p>
                </div>
              </div>
            </div>

            {/* Landscape + texto */}
            <div className="flex flex-col gap-5 h-full">
              <div
                className="card-hover rounded-2xl overflow-hidden bg-[#141414] flex-1 flex flex-col"
                style={{ border: '1px solid rgba(212,160,23,0.2)', '--glow-color': 'rgba(212,160,23,0.35)' } as React.CSSProperties}
              >
                <div className="relative w-full flex-1 min-h-[180px] overflow-hidden">
                  <Image
                    src={imgMyllaBanda}
                    alt="Mylla Carvalho e Banda"
                    fill
                    sizes="(max-width: 768px) 100vw, 512px"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 z-10">
                    <p className="text-white text-sm font-bold uppercase tracking-wide">Mylla Carvalho &amp; Banda</p>
                  </div>
                </div>
              </div>

              {/* Texto de destaque */}
              <div
                className="rounded-2xl px-6 py-6 bg-bg-secondary"
                style={{ border: '1px solid rgba(212,160,23,0.12)' }}
              >
                <p className="text-gold font-black text-lg uppercase tracking-wide mb-2">Uma noite inesquecível</p>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Mylla Carvalho e sua banda sobem ao palco para uma noite de show que vai marcar a nossa Geração Forte Quadrangular.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                    🎤 Show ao Vivo
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                    🎵 Banda Completa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-14 border-t border-white/5" />

          {/* J. Ramalho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

            {/* Foto */}
            <div
              className="card-hover rounded-2xl overflow-hidden bg-[#141414]"
              style={{ border: '1px solid rgba(212,160,23,0.2)', '--glow-color': 'rgba(212,160,23,0.35)' } as React.CSSProperties}
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <Image
                  src={imgRamalho}
                  alt="J. Ramalho"
                  fill
                  sizes="(max-width: 768px) 100vw, 512px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-10">
                  <p className="font-black text-white text-xl uppercase tracking-wide">J. Ramalho</p>
                  <p className="text-gold text-sm font-medium mt-0.5">Louvor, Adoração e Palavra</p>
                </div>
              </div>
            </div>

            {/* Texto */}
            <div className="flex flex-col gap-5 h-full">
              <div
                className="rounded-2xl px-6 py-8 bg-bg-secondary flex-1 flex flex-col justify-between"
                style={{ border: '1px solid rgba(212,160,23,0.12)' }}
              >
                <div>
                  <p className="text-gold font-black text-lg uppercase tracking-wide mb-3">Momento Especial</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    Um momento único de louvor, adoração e palavra com J. Ramalho. Uma experiência que vai além do palco — uma entrega genuína à presença de Deus na Geração Forte Quadrangular.
                  </p>

                  {/* Versículo */}
                  <div className="mt-6 border-l-2 border-gold/40 pl-4">
                    <p className="text-text-primary text-sm italic leading-relaxed">
                      &ldquo;Cantai ao Senhor um cântico novo; cantai ao Senhor, todas as terras.&rdquo;
                    </p>
                    <p className="text-gold/60 text-xs mt-1 font-medium">Salmos 96:1</p>
                  </div>

                  {/* O que esperar */}
                  <div className="mt-6 space-y-3">
                    <p className="text-text-muted text-xs uppercase tracking-widest font-bold">O que esperar</p>
                    {[
                      { icon: '🙌', title: 'Louvor e Adoração', desc: 'Ministração intensa que conduz ao encontro com Deus' },
                      { icon: '📖', title: 'Palavra', desc: 'Uma mensagem que toca e transforma vidas' },
                      { icon: '🔥', title: 'Presença de Deus', desc: 'Um ambiente preparado para o mover do Espírito Santo' },
                    ].map(item => (
                      <div key={item.title} className="flex items-start gap-3">
                        <span className="text-base mt-0.5">{item.icon}</span>
                        <div>
                          <p className="text-text-primary text-xs font-bold uppercase tracking-wide">{item.title}</p>
                          <p className="text-text-muted text-xs leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                    🙌 Louvor &amp; Adoração
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                    📖 Palavra
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                    ✨ Momento Especial
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Organizadores e Anfitriões */}
      <section className="relative z-10 py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-[#0D0D0D]" style={{ border: '1px solid rgba(212,160,23,0.15)' }}>
            <div className="flex flex-col md:flex-row items-center md:items-stretch">

              {/* Foto */}
              <div className="relative w-full md:w-[420px] flex-shrink-0 min-h-[360px] md:min-h-0">
                {/* Golden halo behind photo */}
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    background: 'radial-gradient(ellipse 70% 70% at 50% 60%, rgba(212,160,23,0.35) 0%, rgba(123,58,0,0.15) 50%, transparent 75%)',
                  }}
                />
                <Image
                  src={imgOrganizadores}
                  alt="Pr. Heitor Alexandre e Pra. Val Nery"
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover object-top relative z-10"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-transparent to-[#0D0D0D] hidden md:block" />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent md:hidden" />
              </div>

              {/* Texto */}
              <div className="flex-1 px-8 py-10 flex flex-col justify-center gap-5 relative z-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold/70 mb-4">Realização</p>
                  <h2 className="text-2xl md:text-3xl font-black leading-tight uppercase"
                    style={{ background: 'linear-gradient(90deg, #D4A017, #F5B800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Igreja do Evangelho<br />Quadrangular
                  </h2>
                  <p className="text-xl md:text-2xl font-black text-white uppercase mt-1">
                    Campo 157
                  </p>
                  <p className="text-sm font-bold text-text-muted uppercase tracking-widest mt-1">
                    Redenção – PA · Capital do Avivamento
                  </p>
                </div>

                <div className="border-t border-white/5 pt-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold/60 mb-2">Anfitriões</p>
                  <p className="text-base font-bold text-white">Pr. Heitor Alexandre &amp; Pra. Val Nery</p>
                  <p className="text-text-muted text-xs mt-0.5 italic">Pastores Titulares · IEQ 157 · Redenção – PA</p>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed max-w-md">
                  Com décadas de ministério e um coração voltado para a juventude, o Pastor Heitor e a Pastora Val abrem as portas da IEQ 157 para um fim de semana que vai transformar vidas.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                    Pastor Titular
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(212,160,23,0.12)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                    Anfitriã do Evento
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patrocinadores Especiais */}
      <section className="relative z-10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-center mb-6">
            <span className="text-xs text-text-muted border border-white/10 rounded-full px-4 py-1.5 uppercase tracking-widest">
              Apoio
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white text-center uppercase tracking-tight mb-14">
            Patrocinadores Especiais
          </h2>

          {/* Linha 1 — 3 logos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {/* Arena DC Burguer */}
            <div className="card-hover rounded-2xl overflow-hidden bg-[#0D0D0D] flex items-center justify-center p-6 aspect-video"
              style={{ border: '1px solid rgba(212,160,23,0.15)', '--glow-color': 'rgba(212,160,23,0.25)' } as React.CSSProperties}>
              <div className="relative w-full h-full">
                <Image src={imgArenaOcBurguer} alt="Arena DC Burguer" fill sizes="(max-width: 768px) 100vw, 340px" className="object-contain" />
              </div>
            </div>

            {/* Clube Descoladão */}
            <div className="card-hover rounded-2xl overflow-hidden bg-[#1a0d2e] flex items-center justify-center p-6 aspect-video"
              style={{ border: '1px solid rgba(123,63,181,0.2)', '--glow-color': 'rgba(123,63,181,0.25)' } as React.CSSProperties}>
              <div className="relative w-full h-full">
                <Image src={imgClubeDescoladao} alt="Clube Descoladão" fill sizes="(max-width: 768px) 100vw, 340px" className="object-contain" />
              </div>
            </div>

            {/* Planeta Music */}
            <div className="card-hover rounded-2xl overflow-hidden bg-[#1a1a1a] flex items-center justify-center p-6 aspect-video"
              style={{ border: '1px solid rgba(212,160,23,0.15)', '--glow-color': 'rgba(212,160,23,0.25)' } as React.CSSProperties}>
              <div className="relative w-full h-full">
                <Image src={imgPlanetaMusic} alt="Planeta Music" fill sizes="(max-width: 768px) 100vw, 340px" className="object-contain" />
              </div>
            </div>
          </div>

          {/* Linha 2 — 2 logos centralizados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:max-w-2xl md:mx-auto mb-5">
            {/* Centro Contábil */}
            <div className="card-hover rounded-2xl overflow-hidden bg-white flex items-center justify-center p-6 aspect-video"
              style={{ border: '1px solid rgba(255,255,255,0.1)', '--glow-color': 'rgba(255,255,255,0.15)' } as React.CSSProperties}>
              <div className="relative w-full h-full">
                <Image src={imgCentroContabil} alt="Centro Contábil" fill sizes="(max-width: 768px) 100vw, 340px" className="object-contain" />
              </div>
            </div>

            {/* Acqua Park */}
            <div className="card-hover rounded-2xl overflow-hidden bg-white flex items-center justify-center p-6 aspect-video"
              style={{ border: '1px solid rgba(255,255,255,0.1)', '--glow-color': 'rgba(255,255,255,0.15)' } as React.CSSProperties}>
              <div className="relative w-full h-full">
                <Image src={imgAcquaPark} alt="Acqua Park Redenção" fill sizes="(max-width: 768px) 100vw, 340px" className="object-contain" />
              </div>
            </div>
          </div>

          {/* Linha 3 — 2 novos patrocinadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:max-w-2xl md:mx-auto">
            {/* Norte & Sul Cosméticos */}
            <div className="card-hover rounded-2xl overflow-hidden bg-[#0D0D0D] flex items-center justify-center p-6 aspect-video"
              style={{ border: '1px solid rgba(212,160,23,0.2)', '--glow-color': 'rgba(212,160,23,0.3)' } as React.CSSProperties}>
              <div className="relative w-full h-full">
                <Image src={imgNorteSulCosmeticos} alt="Norte & Sul Cosméticos" fill sizes="(max-width: 768px) 100vw, 340px" className="object-contain" />
              </div>
            </div>

            {/* Açaíteria MilGraus */}
            <div className="card-hover rounded-2xl overflow-hidden bg-[#0d0520] flex items-center justify-center p-6 aspect-video"
              style={{ border: '1px solid rgba(160,40,220,0.25)', '--glow-color': 'rgba(160,40,220,0.3)' } as React.CSSProperties}>
              <div className="relative w-full h-full">
                <Image src={imgAcaiteriaMilgraus} alt="Açaíteria MilGraus" fill sizes="(max-width: 768px) 100vw, 340px" className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <PerkCounter
            eventId={EVENT_ID}
            description="Os primeiros 600 inscritos pagantes confirmados ganham pulseiras LED coloridas exclusivas do congresso."
          />
        </div>
      </section>

      <section id="inscricao" className="relative z-10 py-16">
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
              Garanta o valor promocional até <strong className="text-gold">14/06/2026</strong>. A partir do dia seguinte, o preço aumenta.
            </p>
          </div>

          <DeadlineExtensionBanner />

          {!authLoading && !isAuthenticated && <AccountBenefitsCard redirectTo={`/eventos/${EVENT_ID}#inscricao`} />}

          <SmartInscriptionForm
            eventId={EVENT_ID}
            eventTitle={evento?.titulo || 'Congresso Setorizado da Geração Forte'}
            categories={eventCategorias}
            paymentMethods={evento?.metodosPagamento}
            onSuccess={handleInscriptionSuccess}
          />

          <div className="mt-8 pt-8 border-t border-gold/10 text-center space-y-4">
            <div>
              <p className="text-text-secondary text-sm mb-3">Vindo com um grupo? Use a inscrição coletiva.</p>
              <a
                href={`/eventos/${EVENT_ID}/inscricao-coletiva`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold/10 text-gold border border-gold/30 rounded-xl font-medium hover:bg-gold/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Inscrição Coletiva (2–50 pessoas)
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/ajuda"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-gold/30 text-gold bg-gold/10 hover:bg-gold/20 transition-colors no-underline"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dúvidas frequentes
              </Link>
              <WhatsAppSupport label="Problemas? Fale conosco" />
            </div>
          </div>
        </div>
      </section>

      <Link
        href="/ajuda"
        className="fixed bottom-[88px] right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-bold shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl no-underline"
        style={{
          background: 'rgba(13,13,13,0.92)',
          border: '1px solid rgba(212,160,23,0.5)',
          color: '#D4A017',
          backdropFilter: 'blur(12px)',
        }}
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">Dúvidas Frequentes</span>
        <span className="sm:hidden">Dúvidas</span>
      </Link>

      <WhatsAppSupport variant="floating" />
    </div>
  )
}
