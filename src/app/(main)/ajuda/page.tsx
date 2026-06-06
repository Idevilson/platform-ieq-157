'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WhatsAppSupport } from '@/components/common/WhatsAppSupport'

interface FaqItem {
  q: string
  a: string
}

interface FaqSection {
  title: string
  items: FaqItem[]
}

const FAQ: FaqSection[] = [
  {
    title: 'Inscrição Individual',
    items: [
      { q: 'Qual é o preço?', a: 'Até 07/06/2026: R$ 120 para moradores de Redenção e R$ 200 para outras localidades (inclui almoço e janta). A partir de 08/06 os valores sobem para R$ 150 e R$ 250.' },
      { q: 'O que vem incluso na inscrição?', a: 'Camiseta Follow Me, Pulseira Holográfica Dourada, Pulseira Holográfica Azul, Garrafinha exclusiva — e pulseira LED para as primeiras 600 inscrições confirmadas.' },
      { q: 'As pulseiras LED já acabaram?', a: 'A página do evento exibe uma barra de progresso em tempo real. Só garante quem tiver a inscrição confirmada (paga).' },
      { q: 'Precisa criar conta para se inscrever?', a: 'Não. Você pode se inscrever como convidado informando seus dados manualmente.' },
      { q: 'Por que está pedindo CPF se já tenho conta?', a: 'Seu perfil está incompleto. Acesse "Minha Conta → Perfil" para completar os dados, ou preencha diretamente no formulário de inscrição.' },
      { q: 'O campo de idade é a idade atual ou o ano de nascimento?', a: 'É a sua idade atual. Ex: 25.' },
      { q: 'O tamanho da camiseta é obrigatório?', a: 'Sim.' },
      { q: 'O que significa minha inscrição estar "Pendente"?', a: 'A inscrição foi criada mas o pagamento ainda não foi confirmado. Você está no sistema, mas não conta como inscrito confirmado para fins de kit e pulseiras.' },
      { q: 'Como ganho a pulseira de brinde?', a: 'Automaticamente ao ter sua inscrição confirmada (paga), se ainda houver vagas nas 600 primeiras.' },
      { q: 'Fiz inscrição como convidado e criei conta depois — minha inscrição aparece?', a: 'Sim, desde que o CPF do perfil seja o mesmo da inscrição.' },
      { q: 'Meu CPF já tem inscrição — posso fazer outra?', a: 'Não. O sistema bloqueia CPF duplicado no mesmo evento.' },
      { q: 'Como cancelo minha inscrição?', a: 'Apenas inscrições ainda não pagas podem ser canceladas pela plataforma. Para inscrições já confirmadas, contate o suporte.' },
      { q: 'Tem reembolso se não puder ir?', a: 'Contate o suporte.' },
    ],
  },
  {
    title: 'Pagamento Individual',
    items: [
      { q: 'Por que o valor total é diferente do preço da categoria?', a: 'Dependendo da forma de pagamento, há uma taxa de processamento adicionada ao valor da inscrição.' },
      { q: 'Qual a taxa do PIX?', a: 'R$ 1,99 fixo por inscrição.' },
      { q: 'Qual a taxa do cartão de crédito?', a: '2,99% sobre o total + R$ 0,49.' },
      { q: 'Tem taxa pagando em dinheiro?', a: 'Não. O valor é exatamente o da categoria, sem taxas.' },
      { q: 'A taxa vai para a organização do evento?', a: 'Não — é cobrada pelo processador de pagamento.' },
      { q: 'O QR code PIX tem prazo para vencer?', a: 'Sim — 3 dias a partir da criação da inscrição.' },
      { q: 'Paguei o PIX mas não confirmou, o que faço?', a: 'Contate o suporte.' },
      { q: 'O comprovante do PIX é suficiente ou preciso avisar alguém?', a: 'Não precisa avisar — a confirmação é automática. Guarde o comprovante.' },
      { q: 'Onde pago presencialmente (dinheiro)?', a: 'Na secretaria da Igreja. Consulte a organização para horários de atendimento.' },
      { q: 'Minha inscrição fica garantida antes de pagar no dinheiro?', a: 'Sim, fica reservada. Mas a pulseira LED só é garantida após a confirmação do pagamento.' },
      { q: 'Como vou saber quando minha inscrição em dinheiro for confirmada?', a: 'Acompanhe o status em "Minha Conta → Minhas Inscrições".' },
    ],
  },
  {
    title: 'Inscrição Coletiva',
    items: [
      { q: 'Qual o mínimo e máximo de pessoas por lote?', a: 'Mínimo 2, máximo 50 participantes.' },
      { q: 'O responsável precisa estar incluído como participante?', a: 'Não é automático. Se for participar do evento, adicione-se manualmente na lista.' },
      { q: 'Posso editar a lista de participantes depois de criar o lote?', a: 'Não. Se precisar ajustar, contate o suporte.' },
      { q: 'O tamanho da camiseta de cada participante é obrigatório?', a: 'Não — apenas nome e sexo são obrigatórios por participante.' },
      { q: 'Por que está pedindo CPF e nome completo do responsável?', a: 'Esses dados são obrigatórios para identificar o responsável pelo lote. Acesse "Minha Conta → Perfil" para completar.' },
      { q: 'Onde consulto o status do meu lote depois?', a: 'Acesse a página de inscrição coletiva logado, ou informe o CPF do responsável sem login.' },
      { q: 'Os participantes recebem confirmação individual?', a: 'Não. Apenas o responsável acompanha o status pelo sistema.' },
      { q: 'Posso cancelar uma inscrição individual dentro do lote?', a: 'Não. Contate o suporte.' },
    ],
  },
  {
    title: 'Pagamento Coletivo',
    items: [
      { q: 'O PIX é num valor único para todos os participantes?', a: 'Sim — um único PIX cobre todos os participantes do lote.' },
      { q: 'Qual a taxa do PIX no lote?', a: 'R$ 1,99 fixo, independente da quantidade de participantes.' },
      { q: 'Qual a taxa do cartão no lote?', a: '2,99% sobre o valor total + R$ 0,49.' },
      { q: 'Tem taxa pagando em dinheiro no lote?', a: 'Não. O valor é exatamente o número de participantes × preço da categoria.' },
      { q: 'Exemplo de valores com 10 participantes de Redenção (R$ 120 cada):', a: 'PIX: R$ 1.200,00 + R$ 1,99 = R$ 1.201,99\nCartão: R$ 1.200,00 + R$ 36,29 = R$ 1.236,29\nDinheiro: R$ 1.200,00' },
      { q: 'O PIX do lote tem prazo?', a: 'Sim — 3 dias a partir da criação.' },
      { q: 'Paguei o PIX do lote mas está pendente. O que faço?', a: 'Contate o suporte.' },
      { q: 'Para pagar em dinheiro, preciso ir pessoalmente?', a: 'Sim — dirija-se à secretaria da Igreja, informe o nome do responsável e efetue o pagamento. Todos os participantes são confirmados na hora.' },
      { q: 'As inscrições ficam reservadas até eu pagar?', a: 'Sim, ficam como "Pendente" sem prazo de cancelamento automático.' },
    ],
  },
]

function AccordionItem({ q, a }: FaqItem) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gold/10 last:border-0">
      <button
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium text-text-primary hover:text-gold transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-gold transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
          {a}
        </p>
      )}
    </div>
  )
}

export default function AjudaPage() {
  return (
    <main className="min-h-screen bg-bg-primary pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gold mb-3">Central de Ajuda</h1>
          <p className="text-text-secondary">Dúvidas sobre a inscrição no Congresso Geração Forte</p>
        </div>

        <div className="space-y-6 mb-12">
          {FAQ.map((section) => (
            <div key={section.title} className="bg-bg-secondary border border-gold/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gold/10 bg-gold/5">
                <h2 className="text-sm font-semibold text-gold uppercase tracking-wider">{section.title}</h2>
              </div>
              <div className="px-6">
                {section.items.map((item) => (
                  <AccordionItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-bg-secondary border border-gold/10 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.428a.5.5 0 00.609.61l5.627-1.476A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.742-.518-5.293-1.42l-.38-.225-3.938 1.032 1.049-3.826-.247-.393A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Não encontrou sua dúvida?</h3>
          <p className="text-sm text-text-secondary mb-6">
            Fale diretamente com o suporte pelo WhatsApp.
          </p>
          <WhatsAppSupport label="Falar com o suporte" />
        </div>

        <div className="mt-8 text-center">
          <Link href="/eventos/geracao-forte" className="text-sm text-text-muted hover:text-gold transition-colors no-underline">
            ← Voltar para a página do evento
          </Link>
        </div>
      </div>
    </main>
  )
}
