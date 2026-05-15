'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks'
import { LoginForm } from './LoginForm'
import { GoogleLoginButton } from './GoogleLoginButton'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}

export function AuthModal({
  isOpen,
  onClose,
  title = 'Entrar para continuar',
  description,
}: AuthModalProps) {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (isOpen && isAuthenticated && !loading) {
      onClose()
    }
  }, [isOpen, isAuthenticated, loading, onClose])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-bg-secondary border border-gold/15 rounded-2xl shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6 pr-8">
            <h2 id="auth-modal-title" className="text-xl font-bold text-text-primary">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-text-secondary mt-1.5">{description}</p>
            )}
          </div>

          <div className="space-y-4">
            <GoogleLoginButton />
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-text-muted">
              <span className="flex-1 h-px bg-white/10" />
              ou
              <span className="flex-1 h-px bg-white/10" />
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
