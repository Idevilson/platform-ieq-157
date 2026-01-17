import Link from 'next/link'
import Image from 'next/image'
import { getProximoEvento, eventos } from '@/data/eventos'
import { getUltimosAvisos, formatarData } from '@/data/avisos'
import logoIEQ from '@/assets/images/only-logo.png'
import pastoresImg from '@/assets/images/pr-heitor-e-pra-val.png'

function formatarDataEvento(dataInicio: string, dataFim?: string) {
  const inicio = new Date(dataInicio)
  const opcoes: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }

  if (dataFim) {
    const fim = new Date(dataFim)
    return `${inicio.toLocaleDateString('pt-BR', opcoes)} - ${fim.toLocaleDateString('pt-BR', opcoes)}`
  }
  return inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getCategoriaClass(categoria: string) {
  const classes: Record<string, string> = {
    urgente: 'bg-red-500/20 text-red-400 border-red-500/30',
    evento: 'bg-gold/20 text-gold border-gold/30',
    geral: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }
  return classes[categoria] || classes.geral
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    aberto: 'bg-green-500/20 text-green-400 border-green-500/30',
    em_breve: 'bg-gold/20 text-gold border-gold/30',
    encerrado: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  return classes[status] || classes.em_breve
}

export default function Home() {
  const proximoEvento = getProximoEvento()
  const ultimosAvisos = getUltimosAvisos(3)

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary/95 to-bg-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,215,0,0.1),transparent_60%)]" />
        <div className="relative z-10 text-center px-4 py-16 animate-fade-in">
          <div className="mb-6">
            <Image
              src={logoIEQ}
              alt="Logo IEQ"
              className="mx-auto animate-pulse-slow drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gold text-glow mb-3">
            Igreja do Evangelho Quadrangular
          </h1>
          <h2 className="text-lg md:text-xl text-text-secondary mb-8">
            Redencao - PA: Capital do Avivamento
          </h2>
          <div className="mb-8">
            <Image
              src={pastoresImg}
              alt="Pr. Heitor Alexandre e Pra. Val Nery"
              className="mx-auto rounded-xl shadow-dark"
              width={300}
              height={200}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/eventos"
              className="px-8 py-3 bg-gold text-bg-primary font-semibold rounded-lg hover:bg-gold-light hover:-translate-y-0.5 hover:shadow-gold transition-all no-underline"
            >
              Ver Eventos
            </Link>
            <Link
              href="/sobre"
              className="px-8 py-3 border-2 border-gold text-gold font-semibold rounded-lg hover:bg-gold/10 hover:-translate-y-0.5 transition-all no-underline"
            >
              Conheca a Igreja
            </Link>
          </div>
        </div>
      </section>

      {/* Proximo Evento em Destaque */}
      {proximoEvento && (
        <section className="py-16 bg-bg-secondary">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gold text-center mb-8">
              Proximo Evento
            </h2>
            <div className="card p-8 text-center bg-gradient-to-br from-bg-tertiary to-bg-secondary border-gold/20">
              <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-gold/20 text-gold rounded-full mb-4">
                {proximoEvento.status === 'aberto' ? 'Inscricoes Abertas' : 'Em Breve'}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                {proximoEvento.titulo}
              </h3>
              {proximoEvento.subtitulo && (
                <p className="text-lg text-gold mb-4">{proximoEvento.subtitulo}</p>
              )}
              <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm text-text-secondary">
                <span className="flex items-center gap-2">
                  <span>📅</span>
                  {formatarDataEvento(proximoEvento.dataInicio, proximoEvento.dataFim)}
                </span>
                <span className="flex items-center gap-2">
                  <span>📍</span>
                  {proximoEvento.local}
                </span>
              </div>
              <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                {proximoEvento.descricao}
              </p>
              <Link href={`/eventos/${proximoEvento.id}`} className="btn-primary inline-block">
                {proximoEvento.temInscricao ? 'Fazer Inscricao' : 'Saiba Mais'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Horarios dos Cultos */}
      <section className="py-16 bg-bg-primary">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gold text-center mb-8">
            Horarios dos Cultos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { dia: 'Domingo', hora: '09h00', tipo: 'Escola Biblica' },
              { dia: 'Domingo', hora: '18h00', tipo: 'Culto de Celebracao' },
              { dia: 'Quarta', hora: '19h30', tipo: 'Culto de Ensino' },
              { dia: 'Sexta', hora: '19h30', tipo: 'Culto de Libertacao' },
            ].map((horario, index) => (
              <div
                key={index}
                className="card text-center p-6 hover:-translate-y-1 hover:border-gold/30 transition-all"
              >
                <div className="text-sm text-text-muted uppercase tracking-wider mb-1">
                  {horario.dia}
                </div>
                <div className="text-2xl font-bold text-gold mb-2">{horario.hora}</div>
                <div className="text-sm text-text-secondary">{horario.tipo}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ultimos Avisos */}
      <section className="py-16 bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gold">Ultimos Avisos</h2>
            <Link
              href="/avisos"
              className="text-sm text-gold hover:text-gold-light transition-colors no-underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ultimosAvisos.map(aviso => (
              <div key={aviso.id} className="card p-5 hover:-translate-y-1 transition-all">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full border mb-3 ${getCategoriaClass(aviso.categoria)}`}
                >
                  {aviso.categoria}
                </span>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{aviso.titulo}</h3>
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">{aviso.resumo}</p>
                <span className="text-xs text-text-muted">{formatarData(aviso.data)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eventos */}
      <section className="py-16 bg-bg-primary">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gold">Nossos Eventos</h2>
            <Link
              href="/eventos"
              className="text-sm text-gold hover:text-gold-light transition-colors no-underline"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eventos.slice(0, 3).map(evento => (
              <Link
                key={evento.id}
                href={`/eventos/${evento.id}`}
                className="card p-5 hover:-translate-y-1 hover:border-gold/30 transition-all no-underline group"
              >
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full border mb-3 ${getStatusClass(evento.status)}`}
                >
                  {evento.status === 'aberto' ? 'Aberto' : evento.status === 'em_breve' ? 'Em Breve' : 'Encerrado'}
                </span>
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-gold transition-colors">
                  {evento.titulo}
                </h3>
                <p className="text-sm text-gold mb-2">
                  {formatarDataEvento(evento.dataInicio, evento.dataFim)}
                </p>
                <p className="text-sm text-text-secondary line-clamp-2">{evento.descricao}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
