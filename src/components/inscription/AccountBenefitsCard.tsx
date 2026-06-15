"use client"

import Link from 'next/link'

const BENEFITS = [
  { icon: '⚡', title: 'Inscrição mais rápida', desc: 'Seus dados já vêm preenchidos nos próximos eventos.' },
  { icon: '📋', title: 'Tudo em um só lugar', desc: 'Acompanhe inscrições, pagamentos e QR Code.' },
  { icon: '🔔', title: 'Fique por dentro', desc: 'Avisos, calendário e Q4-News da igreja.' },
  { icon: '🎟️', title: 'Histórico sempre à mão', desc: 'Comprovantes e status quando quiser.' },
]

export function AccountBenefitsCard({ redirectTo }: { redirectTo?: string }) {
  const query = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-bg-secondary mb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(212,160,23,0.18) 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 70% at 0% 100%, rgba(123,63,181,0.14) 0%, transparent 60%)',
        }}
      />
      <div className="relative p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-gold uppercase tracking-[0.25em] px-3 py-1.5 rounded-full bg-gold/10 border border-gold/25">
          ✨ Vantagens de ter conta
        </span>

        <h3 className="mt-4 text-2xl md:text-3xl font-black text-white leading-tight">
          Crie sua conta e <span style={{ background: 'linear-gradient(90deg,#FFD700,#DAA520)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ganhe tempo</span>
        </h3>
        <p className="mt-2 text-text-secondary text-sm md:text-base max-w-xl">
          Faça parte da plataforma da IEQ 157 e não preencha seus dados de novo a cada evento. Quem se inscreveu só com CPF também pode criar a conta e centralizar tudo.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 my-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-3 rounded-xl bg-bg-primary/50 border border-gold/10 px-4 py-3">
              <span className="text-xl shrink-0">{b.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{b.title}</p>
                <p className="text-xs text-text-muted leading-relaxed mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/cadastro${query}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-gold-dark text-bg-primary font-bold rounded-xl shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 transition-all no-underline"
          >
            Criar conta grátis
          </Link>
          <Link
            href={`/login${query}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gold/30 text-gold bg-gold/5 rounded-xl font-semibold hover:bg-gold/15 transition-colors no-underline"
          >
            Já tenho conta
          </Link>
        </div>

        <p className="text-xs text-text-muted mt-4 text-center sm:text-left">
          Prefere não criar conta agora? É só se inscrever logo abaixo. 👇
        </p>
      </div>
    </div>
  )
}
