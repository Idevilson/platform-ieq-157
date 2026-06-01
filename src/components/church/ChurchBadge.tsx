'use client'

import type { ChurchBadgeVariant, ChurchSummaryDTO } from '@/shared/types'

interface ChurchBadgeProps {
  church: ChurchSummaryDTO | null
  variant: ChurchBadgeVariant
  loading?: boolean
  onSelectClick?: () => void
}

function ChurchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2L13.5 5H10.5L12 2Z" fill="currentColor" />
      <path d="M12 5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M4 22V12L12 7L20 12V22H4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 22V17H14V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 9V13M12 17H12.01M5.07 19H18.93C20.47 19 21.44 17.33 20.66 16L13.73 4C12.96 2.67 11.04 2.67 10.27 4L3.34 16C2.56 17.33 3.53 19 5.07 19Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChurchBadge({ church, variant, loading, onSelectClick }: ChurchBadgeProps) {
  if (loading) {
    return <span className="inline-block h-6 w-32 rounded-full bg-bg-tertiary animate-pulse" />
  }

  const hasChurch = church !== null

  if (variant === 'header') {
    if (!hasChurch) {
      return (
        <button
          type="button"
          onClick={onSelectClick}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-400 text-xs hover:bg-amber-500/10 transition-colors"
          title="Você ainda não declarou sua igreja"
        >
          <AlertIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sem vínculo</span>
        </button>
      )
    }
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gold/20 text-gold/90 text-xs"
        title={`${church.nome}${church.cidade ? ` · ${church.cidade}` : ''}`}
      >
        <ChurchIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline max-w-[160px] truncate">{church.nome}</span>
      </span>
    )
  }

  if (variant === 'compact') {
    if (!hasChurch) {
      return (
        <button
          type="button"
          onClick={onSelectClick}
          className="inline-flex items-center gap-1 text-amber-400 text-xs hover:underline"
        >
          <AlertIcon className="w-3.5 h-3.5" />
          Sem vínculo
        </button>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-text-secondary text-xs">
        <ChurchIcon className="w-3.5 h-3.5" />
        <span className="truncate max-w-[120px]">{church.nome}</span>
      </span>
    )
  }

  if (variant === 'account') {
    if (!hasChurch) {
      return (
        <div className="flex items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-2">
            <AlertIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-text-secondary">Igreja: <span className="text-amber-400">sem vínculo</span></span>
          </div>
          <button
            type="button"
            onClick={onSelectClick}
            className="text-xs text-gold hover:underline"
          >
            Vincular →
          </button>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 py-2">
        <ChurchIcon className="w-4 h-4 text-gold" />
        <span className="text-sm text-text-secondary">
          Igreja: <span className="text-text-primary font-medium">{church.nome}</span>
        </span>
      </div>
    )
  }

  // variant === 'home'
  if (!hasChurch) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertIcon className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Você ainda não declarou sua igreja</p>
            <p className="text-xs text-text-muted mt-1">
              Vincule-se para que seu perfil reflita a comunidade a que pertence.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSelectClick}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors"
        >
          Selecionar →
        </button>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-gold/20 bg-bg-tertiary p-4">
      <p className="text-xs text-text-muted mb-1">Você é membro de</p>
      <div className="flex items-center gap-2">
        <ChurchIcon className="w-5 h-5 text-gold" />
        <span className="text-base font-semibold text-text-primary">{church.nome}</span>
      </div>
      {(church.cidade || church.estado) && (
        <p className="text-xs text-text-muted mt-1">
          {[church.cidade, church.estado].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  )
}
