'use client'

import { useState, useEffect } from 'react'

const DEADLINE = new Date('2026-06-14T23:59:59-03:00')

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const update = () => {
      const diff = DEADLINE.getTime() - Date.now()
      if (diff <= 0) {
        setExpired(true)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      })
    }
    update()
    const id = setInterval(update, 1_000)
    return () => clearInterval(id)
  }, [])

  return { timeLeft, expired }
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/40 border border-gold/30 rounded-xl font-mono font-bold text-xl sm:text-2xl text-gold tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] text-text-muted uppercase tracking-widest mt-1">{label}</span>
    </div>
  )
}

export function DeadlineExtensionBanner() {
  const { timeLeft, expired } = useCountdown()

  if (expired) return null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-amber-900/10 to-bg-secondary mb-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-amber-600/10 rounded-full blur-2xl" />
      </div>

      <div className="relative px-5 py-6 sm:px-8 sm:py-7 text-center">
        <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/40 rounded-full px-4 py-1 mb-4">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-gold text-xs font-bold uppercase tracking-widest">Prazo Prorrogado</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 leading-snug">
          Grande notícia para quem ainda não se inscreveu!
        </h3>
        <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
          Atendendo aos inúmeros pedidos da nossa comunidade, a organização do{' '}
          <strong className="text-text-primary">congresso</strong> decidiu estender o prazo do preço
          especial de acesso antecipado. Você tem até o dia{' '}
          <strong className="text-gold">14 de junho</strong> para garantir sua inscrição com desconto.
          Não perca essa última chance!
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <TimeUnit value={timeLeft.days} label="dias" />
          <span className="text-gold/60 font-bold text-2xl mb-4">:</span>
          <TimeUnit value={timeLeft.hours} label="horas" />
          <span className="text-gold/60 font-bold text-2xl mb-4">:</span>
          <TimeUnit value={timeLeft.minutes} label="min" />
          <span className="text-gold/60 font-bold text-2xl mb-4">:</span>
          <TimeUnit value={timeLeft.seconds} label="seg" />
        </div>

        <p className="text-xs text-text-muted">
          Preço especial válido até <strong className="text-gold">14/06/2026</strong> às 23h59. Após esse prazo, os valores sobem e não há nova prorrogação.
        </p>
      </div>
    </div>
  )
}
