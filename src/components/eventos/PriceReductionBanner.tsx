export function PriceReductionBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/15 via-teal-700/10 to-slate-900 mb-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative px-5 py-6 sm:px-8 sm:py-7 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-400/15 border border-emerald-400/40 rounded-full px-4 py-1 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Preço reduzido</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 leading-snug">
          Aproveite agora: ouvindo os inúmeros pedidos, a organização reduziu o valor — sem nova data limite.
        </h3>

        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          O novo valor passa a ser o preço oficial do{' '}
          <strong className="text-text-primary">Congresso da Geração Forte</strong>.
        </p>
      </div>
    </div>
  )
}
