import Link from 'next/link'
import Image from 'next/image'
import cruzImg from '@/assets/images/cruz.png'
import pombaImg from '@/assets/images/pomba.png'
import caliceImg from '@/assets/images/calice.png'
import coroaImg from '@/assets/images/coroa.png'
import logoIEQ from '@/assets/images/logoIEQ.png'
import onlyLogo from '@/assets/images/only-logo.png'
import pastoresImg from '@/assets/images/pr-heitor-e-pra-val.png'

export default function EncontroComDeus() {
  const pilares = [
    { img: cruzImg, titulo: 'Jesus Salvador', descricao: 'Que salva do pecado' },
    { img: pombaImg, titulo: 'Batizador no Espirito Santo', descricao: 'Que empodera os crentes' },
    { img: caliceImg, titulo: 'Jesus Curador', descricao: 'Que restaura corpo e alma' },
    { img: coroaImg, titulo: 'Rei Vindouro', descricao: 'Que promete retorno' },
  ]

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="relative py-16 bg-gradient-to-b from-bg-secondary to-bg-primary text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,215,0,0.1),transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-4 mb-6">
            {[cruzImg, pombaImg, caliceImg, coroaImg].map((img, i) => (
              <Image key={i} src={img} alt="" className="w-10 h-10 md:w-14 md:h-14 drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]" width={60} height={60} />
            ))}
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold/80 mb-2">IEQ SEDE CAMPO 157</p>
          <h1 className="text-4xl md:text-6xl font-black text-gold text-glow mb-3">ENCONTRO COM DEUS</h1>
          <p className="text-text-secondary">REDENCAO - PA CAPITAL DO AVIVAMENTO</p>
        </div>
      </header>

      <main>
        {/* Banner de Evento Finalizado */}
        <section className="py-16 bg-gradient-to-b from-green-900/20 to-bg-primary">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-bold mb-4">EVENTO REALIZADO</span>
            <h2 className="text-4xl md:text-5xl font-black text-gold text-glow mb-2">FOI TREMENDO!</h2>
            <p className="text-lg text-text-secondary mb-6">28 a 30 de Novembro de 2025</p>
            <div className="space-y-4 text-text-secondary mb-8">
              <p>
                Gloria a Deus! O Encontro com Deus 2025 foi uma experiencia transformadora!
                Vidas foram tocadas, curadas e restauradas pelo poder do Espirito Santo.
              </p>
              <p>
                Agradecemos a todos que participaram e fizeram deste encontro um momento
                inesquecivel na presenca do Senhor.
              </p>
            </div>
            <blockquote className="card inline-block text-left">
              <p className="text-lg italic text-text-secondary mb-2">
                &quot;O Senhor fez grandes coisas por nos, e por isso estamos alegres.&quot;
              </p>
              <cite className="text-gold text-sm font-medium">Salmos 126:3</cite>
            </blockquote>
          </div>
        </section>

        {/* Sobre o Evento */}
        <section className="py-16 bg-bg-secondary">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gold text-center mb-8">O Que Foi o Encontro com Deus?</h2>
            <p className="text-center text-text-secondary max-w-3xl mx-auto mb-10">
              O <strong className="text-gold">Encontro com Deus</strong> foi um retiro espiritual intensivo promovido pela Igreja do Evangelho Quadrangular,
              uma experiencia transformadora que ajudou os participantes a aprofundarem o relacionamento pessoal com Deus,
              longe das rotinas diarias, por meio de imersao em oracao, louvor e ensino biblico.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {[
                { icon: '✝️', titulo: 'Renovacao Espiritual', desc: 'Reflexao profunda sobre pecados, perdao e restauracao da alma atraves da Palavra de Deus.' },
                { icon: '🌱', titulo: 'Crescimento Pessoal', desc: 'Meditacao nas verdades do Evangelho, inspirado no exemplo de Jesus buscando lugares solitarios para orar.' },
                { icon: '🤝', titulo: 'Comunidade e Discipulado', desc: 'Fortalecer lacos entre participantes e incentivar o servico na igreja local.' },
                { icon: '🔥', titulo: 'Experiencia Carismatica', desc: 'Momentos de batismo no Espirito Santo, curas e profecias, comuns no pentecostalismo quadrangular.' },
              ].map((item, i) => (
                <div key={i} className="card text-center hover:-translate-y-1 transition-all">
                  <span className="text-4xl mb-3 block">{item.icon}</span>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{item.titulo}</h3>
                  <p className="text-sm text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="card mb-12">
              <h3 className="text-xl font-bold text-gold text-center mb-6">O Evangelho Quadrangular</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pilares.map((pilar, i) => (
                  <div key={i} className="text-center">
                    <Image src={pilar.img} alt={pilar.titulo} className="mx-auto mb-3 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]" width={50} height={50} />
                    <h4 className="text-sm font-semibold text-text-primary">{pilar.titulo}</h4>
                    <p className="text-xs text-text-secondary">{pilar.descricao}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-gold/10 to-transparent border-gold/30 text-center">
              <h3 className="text-xl font-bold text-gold mb-4">Uma Jornada de Transformacao</h3>
              <p className="text-text-secondary mb-4">
                Muitos participantes relataram <strong className="text-gold">transformacoes duradouras</strong>, como superacao de vicios,
                reconciliacoes familiares e maior compromisso com a fe. Foi uma oportunidade unica de escapar das
                distracoes do mundo e se reconectar com o divino.
              </p>
              <blockquote className="text-lg italic text-text-secondary">
                &quot;Jesus e o mesmo ontem, hoje e para sempre&quot; - Hebreus 13:8
              </blockquote>
            </div>
          </div>
        </section>

        {/* Organizadores */}
        <section className="py-16 bg-bg-primary">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gold text-center mb-8">Organizadores</h2>
            <div className="card flex flex-col md:flex-row items-center gap-8">
              <Image src={onlyLogo} alt="Logo IEQ" className="w-24 h-24 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" width={100} height={100} />
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Image src={pastoresImg} alt="Pr. Heitor Alexandre e Pra. Val Nery" className="rounded-xl shadow-dark" width={200} height={150} />
                <div className="text-center sm:text-left">
                  <p className="font-bold text-text-primary">Pr. Heitor Alexandre</p>
                  <p className="text-sm text-text-secondary mb-3">Diretor do Campo 157</p>
                  <p className="font-bold text-text-primary">Pra. Val Nery</p>
                  <p className="text-sm text-text-secondary">Ministra do Evangelho e Coordenadora de Celulas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA para proximos eventos */}
        <section className="py-16 bg-gradient-to-b from-bg-secondary to-bg-primary">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gold mb-4">Fique Ligado!</h2>
            <p className="text-text-secondary mb-8">Acompanhe nossos proximos eventos e nao perca as novidades da IEQ 157.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/eventos" className="btn-primary">
                Ver Proximos Eventos
              </Link>
              <Link href="/" className="btn-secondary">
                Voltar para Inicio
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 bg-bg-tertiary text-center">
        <Image src={logoIEQ} alt="Logo IEQ" className="mx-auto mb-4" width={80} height={80} />
        <p className="text-text-primary font-semibold">Igreja Do Evangelho Quadrangular</p>
        <p className="text-gold">Campo 157 - Redencao - PA</p>
        <p className="text-text-muted text-sm">Capital do Avivamento</p>
      </footer>
    </div>
  )
}
