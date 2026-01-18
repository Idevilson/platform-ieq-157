import Image from 'next/image'
import logoIEQ from '@/assets/images/only-logo.png'
import pastoresImg from '@/assets/images/pr-heitor-e-pra-val.png'
import cruzImg from '@/assets/images/cruz.png'
import pombaImg from '@/assets/images/pomba.png'
import caliceImg from '@/assets/images/calice.png'
import coroaImg from '@/assets/images/coroa.png'

export default function Sobre() {
  const pilares = [
    { img: cruzImg, titulo: 'Jesus Salva', descricao: 'A Cruz representa a salvacao que Jesus oferece a todos atraves de Seu sacrificio.' },
    { img: pombaImg, titulo: 'Jesus Batiza', descricao: 'A Pomba simboliza o batismo no Espirito Santo, que capacita os crentes para o servico.' },
    { img: caliceImg, titulo: 'Jesus Cura', descricao: 'O Calice representa a cura divina, disponivel para todos que creem.' },
    { img: coroaImg, titulo: 'Jesus Voltara', descricao: 'A Coroa simboliza a segunda vinda de Cristo, nossa bendita esperanca.' },
  ]

  const horarios = [
    { dia: 'Domingo', hora: '09h00', tipo: 'Escola Biblica Dominical' },
    { dia: 'Domingo', hora: '18h00', tipo: 'Culto de Celebracao' },
    { dia: 'Quarta', hora: '19h30', tipo: 'Culto de Ensino' },
    { dia: 'Sexta', hora: '19h30', tipo: 'Culto de Libertacao' },
  ]

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <Image
            src={logoIEQ}
            alt="Logo IEQ"
            className="mx-auto mb-4 animate-pulse-slow"
            width={100}
            height={100}
          />
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-2">
            Igreja do Evangelho Quadrangular
          </h1>
          <p className="text-text-secondary">IEQ 157 - Redencao, PA</p>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gold mb-4">Nossa Historia</h2>
          <div className="space-y-4 text-text-secondary leading-relaxed">
            <p>
              A Igreja do Evangelho Quadrangular 157 de Redencao-PA e uma comunidade
              de fe comprometida com a proclamacao do Evangelho de Jesus Cristo.
              Fazemos parte da Igreja do Evangelho Quadrangular, uma denominacao
              evangelica pentecostal fundada em 1923 por Aimee Semple McPherson.
            </p>
            <p>
              Nossa missao e levar a mensagem de salvacao, cura, batismo no
              Espirito Santo e a esperanca da volta de Jesus a todas as pessoas,
              transformando vidas e familias atraves do poder do Evangelho.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gold mb-6 text-center">
            Os Quatro Pilares do Evangelho
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pilares.map((pilar, index) => (
              <div
                key={index}
                className="card text-center p-6 hover:-translate-y-1 hover:border-gold/30 transition-all"
              >
                <Image
                  src={pilar.img}
                  alt={pilar.titulo}
                  className="mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]"
                  width={60}
                  height={60}
                />
                <h3 className="text-lg font-semibold text-gold mb-2">{pilar.titulo}</h3>
                <p className="text-sm text-text-secondary">{pilar.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gold mb-6">Nossos Pastores</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <Image
              src={pastoresImg}
              alt="Pr. Heitor Alexandre e Pra. Val Nery"
              className="rounded-xl shadow-dark"
              width={280}
              height={200}
            />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                Pr. Heitor Alexandre e Pra. Val Nery
              </h3>
              <div className="space-y-3 text-text-secondary text-sm leading-relaxed">
                <p>
                  Nossos pastores lideram a IEQ 157 com amor, dedicacao e visao.
                  Com anos de ministerio, eles tem sido instrumentos de Deus para
                  edificar vidas e familias em nossa comunidade.
                </p>
                <p>
                  Sob sua lideranca, a igreja tem crescido e impactado a cidade
                  de Redencao com o Evangelho de Jesus Cristo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gold mb-6 text-center">Horarios de Culto</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {horarios.map((horario, index) => (
              <div key={index} className="card text-center p-5">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {horario.dia}
                </span>
                <span className="block text-2xl font-bold text-gold my-2">{horario.hora}</span>
                <span className="text-sm text-text-secondary">{horario.tipo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gold mb-6">Localizacao</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📍</span>
                <div>
                  <strong className="text-text-primary">Endereco</strong>
                  <p className="text-text-secondary">Redencao - PA</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-2xl">📞</span>
                <div>
                  <strong className="text-text-primary">Telefone</strong>
                  <p className="text-text-secondary">(94) 99999-9999</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-tertiary rounded-xl h-48 flex items-center justify-center border border-gold/10">
              <p className="text-text-muted">Mapa da localizacao</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
