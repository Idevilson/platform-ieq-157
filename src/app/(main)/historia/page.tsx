'use client'

import { useState } from 'react'
import Image, { StaticImageData } from 'next/image'

import img01 from '@/assets/images/fotos_historia/01-grupo-inicio.jpg'
import img02 from '@/assets/images/fotos_historia/02-pregacao-inicio.jpg'
import img03 from '@/assets/images/fotos_historia/03-pulpito-1995.jpg'
import img04 from '@/assets/images/fotos_historia/04-pastora-val-bandeira.jpg'
import img05 from '@/assets/images/fotos_historia/05-familia.jpg'
import img06 from '@/assets/images/fotos_historia/06-casal-formal.jpg'
import img07 from '@/assets/images/fotos_historia/07-grupo-homens.jpg'
import img08 from '@/assets/images/fotos_historia/08-casal-abraco.jpg'
import img08b from '@/assets/images/fotos_historia/08-casamento.jpg'
import img09 from '@/assets/images/fotos_historia/09-pastores-culto.jpg'
import img10 from '@/assets/images/fotos_historia/10-congregacao-bandeiras.jpg'
import img11 from '@/assets/images/fotos_historia/11-reencontro.jpg'
import img12 from '@/assets/images/fotos_historia/12-evento-moderno.jpg'
import img13 from '@/assets/images/fotos_historia/13-acidente-carro-1.jpg'
import img14 from '@/assets/images/fotos_historia/14-acidente-carro-2.jpg'
import img16 from '@/assets/images/fotos_historia/16-foto.jpg'
import img17 from '@/assets/images/fotos_historia/17-foto.jpg'
import img18 from '@/assets/images/fotos_historia/18-foto.jpg'
import img19 from '@/assets/images/fotos_historia/19-foto.jpg'
import img20 from '@/assets/images/fotos_historia/20-foto.jpg'
import img21 from '@/assets/images/fotos_historia/21-foto.jpg'
import img22 from '@/assets/images/fotos_historia/22-foto.jpg'
import img23 from '@/assets/images/fotos_historia/23-foto.jpg'
import img24 from '@/assets/images/fotos_historia/24-foto.jpg'
import img25 from '@/assets/images/fotos_historia/25-foto.jpg'
import img26 from '@/assets/images/fotos_historia/26-foto.jpg'
import img27 from '@/assets/images/fotos_historia/27-foto.jpg'
import img28 from '@/assets/images/fotos_historia/28-foto.jpg'
import img29 from '@/assets/images/fotos_historia/29-foto.jpg'
import img30 from '@/assets/images/fotos_historia/30-foto.jpg'
import img31 from '@/assets/images/fotos_historia/31-foto.jpg'
import img32 from '@/assets/images/fotos_historia/32-foto.jpg'
import img33 from '@/assets/images/fotos_historia/33-foto.jpg'
import img34 from '@/assets/images/fotos_historia/34-foto.jpg'
import img35 from '@/assets/images/fotos_historia/35-foto.jpg'
import img36 from '@/assets/images/fotos_historia/36-foto.jpg'
import img37 from '@/assets/images/fotos_historia/37-foto.jpg'
import img38 from '@/assets/images/fotos_historia/38-foto.jpg'
import img39 from '@/assets/images/fotos_historia/39-foto.jpg'
import img40 from '@/assets/images/fotos_historia/40-foto.jpg'
import img41 from '@/assets/images/fotos_historia/41-foto.jpg'
import img42 from '@/assets/images/fotos_historia/42-foto.jpg'
import img43 from '@/assets/images/fotos_historia/43-foto.jpg'
import img44 from '@/assets/images/fotos_historia/44-foto.jpg'
import img45 from '@/assets/images/fotos_historia/45-foto.jpg'
import img46 from '@/assets/images/fotos_historia/46-foto.jpg'
import img47 from '@/assets/images/fotos_historia/47-foto.jpg'
import img48 from '@/assets/images/fotos_historia/48-foto.jpg'
import img49 from '@/assets/images/fotos_historia/49-foto.jpg'
import img50 from '@/assets/images/fotos_historia/50-foto.jpg'
import img51 from '@/assets/images/fotos_historia/51-foto.jpg'
import img52 from '@/assets/images/fotos_historia/52-foto.jpg'
import img53 from '@/assets/images/fotos_historia/53-foto.jpg'
import img54 from '@/assets/images/fotos_historia/54-foto.jpg'
import img55 from '@/assets/images/fotos_historia/55-foto.jpg'
import img56 from '@/assets/images/fotos_historia/56-foto.jpg'
import img57 from '@/assets/images/fotos_historia/57-foto.jpg'
import img58 from '@/assets/images/fotos_historia/58-foto.jpg'
import img59 from '@/assets/images/fotos_historia/59-foto.jpg'
import img60 from '@/assets/images/fotos_historia/60-foto.jpg'
import img61 from '@/assets/images/fotos_historia/61-foto.jpg'
import img62 from '@/assets/images/fotos_historia/62-foto.jpg'
import img63 from '@/assets/images/fotos_historia/63-foto.jpg'
import img64 from '@/assets/images/fotos_historia/64-foto.jpg'
import img65 from '@/assets/images/fotos_historia/65-foto.jpg'
import img66 from '@/assets/images/fotos_historia/66-foto.jpg'
import img67 from '@/assets/images/fotos_historia/67-foto.jpg'

const allImages: StaticImageData[] = [
  img01, img02, img03, img04, img05, img06, img07, img08, img08b, img09,
  img10, img11, img12, img13, img14, img16, img17, img18, img19,
  img20, img21, img22, img23, img24, img25, img26, img27, img28, img29,
  img30, img31, img32, img33, img34, img35, img36, img37, img38, img39,
  img40, img41, img42, img43, img44, img45, img46, img47, img48, img49,
  img50, img51, img52, img53, img54, img55, img56, img57, img58, img59,
  img60, img61, img62, img63, img64, img65, img66, img67
]

export default function HistoriaPage() {
  const [selectedImage, setSelectedImage] = useState<StaticImageData | null>(null)

  return (
    <section className="pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">Nossa História</h1>
          <p className="text-text-secondary text-lg">A Geração que Honra</p>
        </div>

        <article className="space-y-12">
          <section className="bg-bg-secondary rounded-2xl p-8 border border-gold/10">
            <h2 className="text-2xl font-semibold text-gold mb-6">O Início de Uma Jornada</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image src={img01} alt="Grupo no início do ministério" fill className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image src={img02} alt="Pregação no início do ministério" fill className="object-cover" />
              </div>
            </div>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                No ano de <strong className="text-text-primary">1981</strong>, em Belém do Pará, na Igreja do Evangelho
                Quadrangular da Cremação, em um dia de culto, estava ali um jovem que mal podia imaginar que esse dia
                iria mudar a sua vida. Escutando a palavra de Deus e sendo tocado profundamente,
                <strong className="text-text-primary"> Heitor Alexandre da Silva Rodrigues</strong> aceitou Jesus como
                seu salvador e decidiu seguir a sua vida com Cristo.
              </p>
              <p>
                Anos mais tarde, nessa mesma igreja, uma bela jovem chamada <strong className="text-text-primary">Valdeci Aneri</strong> se
                entregava a Jesus com apenas 14 anos de idade. Mesmo jovens, eles decidiram mudar suas vidas e serem
                novas criaturas, atendendo ao chamado do Senhor Jesus.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={img06} alt="Casal pastoral" fill className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={img08} alt="Casal pastoral abraçados" fill className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image src={img04} alt="Pastora Val com bandeira" fill className="object-cover" />
              </div>
            </div>

            <p className="text-text-secondary leading-relaxed mt-6">
              Ambos sendo da mesma igreja, se conheceram, se apaixonaram e decidiram seguir a vida juntos, tanto
              familiar como ministerial, seguindo o mesmo caminho, entendendo o chamado do Senhor para a vida deles
              e se tornando pastores da Igreja do Evangelho Quadrangular.
            </p>
          </section>

          <section className="bg-bg-secondary rounded-2xl p-8 border border-gold/10">
            <h2 className="text-2xl font-semibold text-gold mb-6">Primeiros Passos no Ministério</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image src={img03} alt="Pastor Heitor no púlpito em 1995" fill className="object-cover" />
              </div>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                <Image src={img09} alt="Pastores no culto" fill className="object-cover" />
              </div>
            </div>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Seguindo a vida no ministério, Pastor Heitor e Pastora Val se tornaram pastores titulares da sua
                primeira igreja, sendo ela a <strong className="text-text-primary">Igreja do Evangelho Quadrangular da
                Rua da Providência</strong>, em Ananindeua, Pará, onde ficaram por cerca de <strong className="text-text-primary">7 anos</strong>.
              </p>
              <p>
                Como sempre, a obra do Senhor tem suas necessidades e eles foram transferidos para outra igreja,
                a <strong className="text-text-primary">Meia Meia</strong>, onde ficaram por <strong className="text-text-primary">2 anos</strong>.
              </p>
            </div>
          </section>

          <section className="bg-bg-secondary rounded-2xl p-8 border border-gold/10">
            <h2 className="text-2xl font-semibold text-gold mb-6">O Grande Chamado: Redenção</h2>

            <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
              <Image src={img05} alt="Família pastoral" fill className="object-cover" />
            </div>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Até que chegou o dia do Senhor em que eles receberiam um dos maiores desafios ministeriais: ser
                pastores de um campo em uma cidade onde os desafios eram muitos. Porém, a fé que eles possuem em
                Deus fez com que os medos ficassem de lado para atender o chamado do Senhor.
              </p>
              <p>
                Pastor Heitor e Pastora Val saíram com sua família da sua cidade natal e foram para uma terra
                desconhecida, <strong className="text-text-primary">Redenção, Pará</strong>. E em
                <strong className="text-text-primary"> 17 de julho de 2002</strong> tomaram posse da igreja sede e do campo 157.
              </p>
            </div>
          </section>

          <section className="bg-bg-secondary rounded-2xl p-8 border border-gold/10">
            <h2 className="text-2xl font-semibold text-gold mb-6">Tempos de Desafios</h2>

            <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
              <Image src={img10} alt="Congregação com bandeiras" fill className="object-cover" />
            </div>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Redenção, terra de muitos desafios. A igreja passava por um período muito difícil e o campo 157
                estava com muitas igrejas fechadas, membros afastados e desmotivados. A igreja sem recursos
                financeiros e sem credibilidade na cidade.
              </p>
              <p>
                Pastor Heitor e Pastora Val se viram em uma situação inimaginável. Porém, eles viam pelos olhos
                da fé que aquela situação mudaria.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-8 border border-gold/20">
            <h2 className="text-2xl font-semibold text-gold mb-6">A Profecia dos Cinco Centavos</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Em um belo dia, a tesoureira da igreja chegou para o Pastor Heitor e disse:
                <em className="text-text-primary">&ldquo;O caixa da igreja só possui isso&rdquo;</em> — e era uma simples moeda
                de cinco centavos.
              </p>
              <blockquote className="border-l-4 border-gold pl-6 my-6 text-lg italic text-text-primary">
                &ldquo;Com esses cinco centavos eu vou prosperar nessa cidade e ela, a partir de hoje, será chamada
                Redenção, a Capital do Avivamento.&rdquo;
                <footer className="text-sm text-text-secondary mt-2 not-italic">— Pastor Heitor</footer>
              </blockquote>
            </div>
          </section>

          <section className="bg-bg-secondary rounded-2xl p-8 border border-gold/10">
            <h2 className="text-2xl font-semibold text-gold mb-6">Provações e Livramentos</h2>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Em meio às tempestades que os nossos pastores enfrentavam, eles nunca deixaram a sua fé se abalar.
                Com apenas <strong className="text-text-primary">quatro meses</strong> que estavam em Redenção, em uma
                das suas viagens missionárias, Pastor Heitor sofreu um grave acidente de carro. Acidente esse que
                Deus o livrou da morte e só houve danos materiais.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image src={img13} alt="Acidente de carro - foto 1" fill className="object-cover" />
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image src={img14} alt="Acidente de carro - foto 2" fill className="object-cover" />
              </div>
            </div>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Nem as estradas longas e perigosas que eles enfrentavam para chegar até Belém os fizeram desistir
                da obra que o Senhor havia traçado para se cumprir no campo de Redenção.
              </p>
              <p>
                Mesmo tristes e preocupados e sem recursos para ter outro carro para se locomover para as cidades
                que fazem parte do campo, eles não deixaram de fazer a obra. Pastor Heitor pegou uma Kombi muito
                antiga que a igreja sede tinha e com ela viajava pelas cidades vizinhas, abrindo novas obras e
                reativando as igrejas fechadas.
              </p>
              <p>
                Foram tempos difíceis, porém, jamais eles irão esquecer dos momentos de baixo, de sol ou chuva,
                que precisavam empurrar a Kombi para ela funcionar — a saudosa <strong className="text-text-primary">Pocotó</strong>.
              </p>
              <p>
                E durante todos esses anos, os milagres e livramentos nunca pararam de acontecer. Em
                <strong className="text-text-primary"> 2014</strong>, mais uma vez o Pastor Heitor sofreu um grave
                acidente de carro onde o Senhor o livrou, deixando claro mais uma vez que a sua vida é um milagre.
              </p>
            </div>
          </section>

          <section className="bg-bg-secondary rounded-2xl p-8 border border-gold/10">
            <h2 className="text-2xl font-semibold text-gold mb-6">22 Anos de Frutos</h2>

            <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
              <Image src={img11} alt="Evento Reencontro" fill className="object-cover" />
            </div>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                22 anos se passaram e o campo 157 cresceu, passando de apenas <strong className="text-text-primary">5 igrejas
                abertas</strong> em Redenção para <strong className="text-text-primary">31</strong>.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
                <div className="bg-bg-primary rounded-xl p-4 text-center border border-gold/10">
                  <span className="text-3xl font-bold text-gold">60+</span>
                  <p className="text-sm text-text-muted mt-1">Igrejas no Campo</p>
                </div>
                <div className="bg-bg-primary rounded-xl p-4 text-center border border-gold/10">
                  <span className="text-3xl font-bold text-gold">3.000+</span>
                  <p className="text-sm text-text-muted mt-1">Membros</p>
                </div>
                <div className="bg-bg-primary rounded-xl p-4 text-center border border-gold/10">
                  <span className="text-3xl font-bold text-gold">100</span>
                  <p className="text-sm text-text-muted mt-1">Pastores</p>
                </div>
                <div className="bg-bg-primary rounded-xl p-4 text-center border border-gold/10">
                  <span className="text-3xl font-bold text-gold">22</span>
                  <p className="text-sm text-text-muted mt-1">Anos de História</p>
                </div>
              </div>

              <p>
                Com muito trabalho e oração, hoje podemos contar com as coordenadorias de:
              </p>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 my-4">
                {[
                  'Jovens e Adolescentes',
                  'Homens',
                  'Mulheres',
                  'Crianças',
                  'Casais',
                  'Células',
                  'Louvor e Dança',
                  'Escola Bíblica',
                  'Instituto Teológico'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-text-primary">
                    <span className="w-2 h-2 rounded-full bg-gold"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                E em todos esses anos, vimos a colheita de um plantio fértil e próspero nas nossas igrejas.
              </p>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden mt-6">
              <Image src={img12} alt="Evento moderno" fill className="object-cover" />
            </div>
          </section>

          <section className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl p-8 border border-gold/20 text-center">
            <h2 className="text-2xl font-semibold text-gold mb-6">Uma Profecia Cumprida</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              E hoje, através da vida dos nossos pastores, Deus pode fazer sua obra, porque eles jamais desistiram.
              Aquela palavra profética dita há mais de 22 anos atrás se cumpriu:
            </p>
            <blockquote className="text-2xl md:text-3xl font-bold text-gold">
              &ldquo;Redenção, Pará é a Capital do Avivamento&rdquo;
            </blockquote>
            <p className="text-text-muted mt-6 text-sm">
              Que o legado de vitória passe de geração em geração.
            </p>
          </section>

          <section className="bg-bg-secondary rounded-2xl p-8 border border-gold/10">
            <h2 className="text-2xl font-semibold text-gold mb-6 text-center">Galeria de Fotos</h2>
            <p className="text-text-secondary text-center mb-8">
              Momentos marcantes da nossa história
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-gold transition-all hover:scale-[1.02]"
                >
                  <Image
                    src={img}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                </button>
              ))}
            </div>
          </section>
        </article>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gold transition-colors"
          >
            &times;
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt="Foto ampliada"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </section>
  )
}
