"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEventById, useEventCategories } from '@/hooks/queries/useEvents'
import { useCreateGuestInscription } from '@/hooks/mutations/useInscriptionMutations'
import temaImg from '@/assets/images/startup/tema.png'
import homemImg from '@/assets/images/startup/homem.jpeg'
import leaoImg from '@/assets/images/startup/leao.jpeg'
import boiImg from '@/assets/images/startup/boi.jpeg'
import aguiaImg from '@/assets/images/startup/aguia.jpeg'

const STARTUP_EVENT_ID = 'startup'

export default function Startup() {
  const router = useRouter()
  const { data: evento } = useEventById(STARTUP_EVENT_ID)
  const { data: categorias } = useEventCategories(STARTUP_EVENT_ID)
  const createInscription = useCreateGuestInscription()

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  })
  const [error, setError] = useState<string | null>(null)

  const handleInscricao = () => {
    document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoriaSelecionada) {
      setError('Selecione uma categoria')
      return
    }

    setError(null)

    try {
      await createInscription.mutateAsync({
        eventId: STARTUP_EVENT_ID,
        categoryId: categoriaSelecionada,
        guestData: {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone.replace(/\D/g, ''),
          cpf: formData.cpf.replace(/\D/g, ''),
        },
      })
      router.push('/eventos/startup/confirmado')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar inscricao. Tente novamente.'
      setError(message)
    }
  }

  const isLoading = createInscription.isPending
  const eventCategorias = categorias || evento?.categorias || []

  return (
    <>
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-[70px] pt-[70px]">
        <div className="absolute inset-0">
          <Image src={temaImg} alt="A Uncao dos Quatro Seres" fill style={{ objectFit: 'cover' }} priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-bg-primary" />
        </div>
        <div className="relative z-10 text-center px-4 py-16 max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-gold/80 mb-4">IEQ SEDE CAMPO 157</h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 tracking-tight text-glow">STARTUP</h1>
          <p className="text-xl md:text-2xl text-gold font-semibold mb-4">A UNCAO DOS QUATRO SERES</p>
          <p className="text-lg text-text-secondary mb-6">30 e 31 de Janeiro | 01 de Fevereiro de 2026</p>
          <p className="text-sm md:text-base text-text-secondary/80 italic max-w-2xl mx-auto mb-8">&quot;A forma de seus rostos era como o de homem; a direita, os quatro tinham rosto de leao; a esquerda, rosto de boi; e tambem rosto de aguia, todos os quatro.&quot; - Ezequiel 1:10</p>
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
            Quando o profeta Ezequiel contempla a gloria de Deus, ele ve quatro seres viventes,
            cada um com quatro rostos: <strong className="text-gold">homem, leao, boi e aguia</strong>.
          </p>
          <p className="text-lg text-text-secondary leading-relaxed">
            Esses rostos representam aspectos da atuacao divina e, profeticamente, apontam para
            dimensoes espirituais que o Senhor deseja derramar sobre Sua igreja e sobre Seus servos.
          </p>
        </div>
      </section>

      <section className="py-16 bg-bg-primary">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gold text-center mb-12">As Quatro Uncoes</h2>

          <div className="card mb-8 overflow-hidden border-red-500/30 hover:border-red-500/50 transition-all">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex-shrink-0">
                <Image src={homemImg} alt="Rosto de Homem - Uncao de Sabedoria" className="w-full h-64 md:h-full object-cover rounded-xl" width={300} height={400} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">❤️</span>
                  <div>
                    <h3 className="text-xl font-bold text-red-400">A UNCAO DE SABEDORIA</h3>
                    <span className="text-sm text-text-muted">O Rosto de Homem</span>
                  </div>
                </div>
                <blockquote className="text-sm italic text-text-secondary border-l-2 border-red-500/50 pl-4 mb-4">
                  &quot;Tenho ouvido dizer a teu respeito que o espirito dos deuses esta em ti, e que em ti se acham luz, inteligencia e excelente sabedoria.&quot; - Daniel 5:14
                </blockquote>
                <ul className="space-y-2 mb-4">
                  {['Compreender o tempo em que vivemos', 'Discernir decisoes complexas', 'Caminhar com equilibrio', 'Revelar maturidade diante das pressoes'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-text-secondary text-sm"><span className="text-red-400">✓</span>{item}</li>
                  ))}
                </ul>
                <p className="text-text-secondary text-sm">Quem tem essa uncao nao se perde no caos; <strong className="text-red-400">governa no meio dele</strong>.</p>
              </div>
            </div>
          </div>

          <div className="card mb-8 overflow-hidden border-gold/30 hover:border-gold/50 transition-all">
            <div className="flex flex-col md:flex-row-reverse gap-6">
              <div className="md:w-1/3 flex-shrink-0">
                <Image src={leaoImg} alt="Rosto de Leao - Uncao do Rei" className="w-full h-64 md:h-full object-cover rounded-xl" width={300} height={400} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">👑🦁</span>
                  <div>
                    <h3 className="text-xl font-bold text-gold">A UNCAO DO REI</h3>
                    <span className="text-sm text-text-muted">O Rosto de Leao</span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary mb-4">O leao representa <strong className="text-gold">autoridade, realeza, dominio e coragem</strong>. E impossivel falar de leao sem lembrar do titulo: &quot;O Leao da Tribo de Juda&quot;.</p>
                <ul className="space-y-2 mb-4">
                  {['Nao se intimida diante de gigantes', 'Nao recua diante da oposicao', 'Levanta a voz quando precisa', 'Sabe quem e em Deus'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-text-secondary text-sm"><span className="text-gold">✓</span>{item}</li>
                  ))}
                </ul>
                <p className="text-text-secondary text-sm">Onde um ungido como leao pisa, <strong className="text-gold">o inferno recua</strong>.</p>
              </div>
            </div>
          </div>

          <div className="card mb-8 overflow-hidden border-orange-500/30 hover:border-orange-500/50 transition-all">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex-shrink-0">
                <Image src={boiImg} alt="Rosto de Boi - Uncao da Forca" className="w-full h-64 md:h-full object-cover rounded-xl" width={300} height={400} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🐂🔥</span>
                  <div>
                    <h3 className="text-xl font-bold text-orange-400">A UNCAO DA FORCA</h3>
                    <span className="text-sm text-text-muted">O Rosto de Boi</span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary mb-4">O boi e simbolo de <strong className="text-orange-400">forca, trabalho, resistencia, sacrificio e produtividade</strong>. Nenhum animal suporta tanto peso quanto o boi.</p>
                <ul className="space-y-2 mb-4">
                  {['Persevera quando outros desistem', 'Suporta cargas espirituais', 'Serve sem reclamar', 'Trabalha para o Reino com constancia'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-text-secondary text-sm"><span className="text-orange-400">✓</span>{item}</li>
                  ))}
                </ul>
                <p className="text-text-secondary text-sm">A uncao do boi te faz <strong className="text-orange-400">inabalavel</strong> quando todo mundo ao seu redor desmorona.</p>
              </div>
            </div>
          </div>

          <div className="card mb-8 overflow-hidden border-sky-500/30 hover:border-sky-500/50 transition-all">
            <div className="flex flex-col md:flex-row-reverse gap-6">
              <div className="md:w-1/3 flex-shrink-0">
                <Image src={aguiaImg} alt="Rosto de Aguia - Uncao da Visao" className="w-full h-64 md:h-full object-cover rounded-xl" width={300} height={400} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🦅✨</span>
                  <div>
                    <h3 className="text-xl font-bold text-sky-400">A UNCAO DA VISAO</h3>
                    <span className="text-sm text-text-muted">O Rosto de Aguia</span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary mb-4">A aguia e o simbolo da <strong className="text-sky-400">visao elevada, sensibilidade espiritual</strong> e da capacidade de enxergar o futuro a distancia.</p>
                <ul className="space-y-2 mb-4">
                  {['Sobe para niveis espirituais mais altos', 'Ve alem do natural', 'Recebe revelacao', 'Enxerga estrategias que outros nao percebem'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-text-secondary text-sm"><span className="text-sky-400">✓</span>{item}</li>
                  ))}
                </ul>
                <p className="text-text-secondary text-sm">A aguia nao se abala com tempestades — ela <strong className="text-sky-400">usa o vento contrario para subir mais alto</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-bg-secondary to-bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gold mb-4">Uma Vida Cheia da Gloria de Deus</h2>
          <p className="text-text-secondary mb-6">Os quatro rostos sao quatro dimensoes da mesma gloria.</p>
          <div className="card inline-block text-left mb-6">
            <p className="text-text-secondary mb-4">Deus nao quer que voce tenha apenas um deles, mas:</p>
            <ul className="space-y-2">
              <li className="text-red-400 font-medium">❤️ Sabedoria do homem</li>
              <li className="text-gold font-medium">👑 Autoridade do leao</li>
              <li className="text-orange-400 font-medium">🐂 Forca do boi</li>
              <li className="text-sky-400 font-medium">🦅 Visao da aguia</li>
            </ul>
          </div>
          <blockquote className="text-lg text-text-secondary italic border-l-4 border-gold pl-4 text-left max-w-xl mx-auto mb-6">
            Voce foi chamado para manifestar essas quatro uncoes na sua vida espiritual, no seu ministerio e no seu proposito.
          </blockquote>
          <p className="text-4xl font-black text-gold text-glow animate-pulse-slow">ALELUIA!</p>
        </div>
      </section>

      <section id="inscricao" className="py-16 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gold text-center mb-8">Faça sua Inscrição</h2>
          <div className="text-center mb-10">
            <div className="flex justify-center gap-3 mb-4">
              <span className="px-4 py-2 bg-gold text-bg-primary font-bold rounded-lg">30 JAN</span>
              <span className="px-4 py-2 bg-gold text-bg-primary font-bold rounded-lg">31 JAN</span>
              <span className="px-4 py-2 bg-gold text-bg-primary font-bold rounded-lg">01 FEV</span>
            </div>
            <p className="text-text-secondary">
              Venha viver essa experiência única de transformação espiritual.
              Três dias de imersão na presença de Deus!
            </p>
          </div>

          {eventCategorias.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">Escolha sua categoria:</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventCategorias.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      categoriaSelecionada === cat.id
                        ? 'bg-gold/10 border-gold'
                        : 'bg-bg-tertiary border-transparent hover:border-gold/30'
                    }`}
                    onClick={() => setCategoriaSelecionada(cat.id)}
                  >
                    <h4 className="text-lg font-semibold text-text-primary mb-2">{cat.nome}</h4>
                    <p className="text-2xl font-bold text-gold mb-3">{cat.valorFormatado}</p>
                    {cat.descricao && (
                      <p className="text-sm text-text-secondary mb-3">{cat.descricao}</p>
                    )}
                    {categoriaSelecionada === cat.id && (
                      <span className="inline-block mt-3 px-3 py-1 bg-gold text-bg-primary text-xs font-bold rounded-full">✓ Selecionado</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card max-w-xl mx-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Seus dados:</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-sm font-medium text-text-secondary">Nome completo *</label>
                <input id="nome" type="text" required className="input" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder="Digite seu nome completo" disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary">E-mail *</label>
                <input id="email" type="email" required className="input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Digite seu e-mail" disabled={isLoading} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="telefone" className="block text-sm font-medium text-text-secondary">Telefone *</label>
                  <input id="telefone" type="tel" required className="input" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: formatTelefone(e.target.value)})} placeholder="(00) 00000-0000" maxLength={15} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cpf" className="block text-sm font-medium text-text-secondary">CPF *</label>
                  <input id="cpf" type="text" required className="input" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})} placeholder="000.000.000-00" maxLength={14} disabled={isLoading} />
                </div>
              </div>
            </div>

            {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">{error}</div>}

            <button type="submit" className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-gold to-gold-dark text-bg-primary font-bold text-lg rounded-xl hover:shadow-gold hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || !categoriaSelecionada}>
              {isLoading ? 'Processando...' : 'CONFIRMAR INSCRIÇÃO'}
            </button>

            <p className="mt-4 text-xs text-text-muted text-center">* Campos obrigatórios</p>
          </form>
        </div>
      </section>
    </>
  )
}
