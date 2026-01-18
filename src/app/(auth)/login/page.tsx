'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { LoginForm, GoogleLoginButton } from '@/components/auth'
import { useAuth } from '@/hooks'
import logoIEQ from '@/assets/images/only-logo.png'

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/minha-conta')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex">
        {/* Left - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary items-center justify-center p-12">
          <div className="text-center space-y-6">
            <Image src={logoIEQ} alt="IEQ 157" className="mx-auto animate-pulse-slow" width={120} height={120} />
            <h2 className="text-3xl font-bold text-gold">IEQ 157</h2>
            <h3 className="text-xl text-text-secondary">Capital do Avivamento</h3>
          </div>
        </div>
        {/* Right - Loading */}
        <div className="flex-1 flex items-center justify-center bg-bg-primary p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="spinner" />
            <span className="text-text-secondary">Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
        <div className="relative text-center space-y-6 max-w-md">
          <Image src={logoIEQ} alt="IEQ 157" className="mx-auto animate-pulse-slow" width={120} height={120} />
          <h2 className="text-3xl font-bold text-gold text-glow">IEQ 157</h2>
          <h3 className="text-xl text-text-secondary">Capital do Avivamento</h3>
          <div className="mt-8 p-6 bg-bg-primary/50 rounded-xl border border-gold/10">
            <p className="text-text-secondary italic text-sm leading-relaxed">
              &ldquo;Porque onde estiverem dois ou tres reunidos em meu nome, ali estou no meio deles.&rdquo;
            </p>
            <span className="block mt-3 text-gold text-xs font-medium">Mateus 18:20</span>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center bg-bg-primary p-6 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors no-underline">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voltar ao inicio
          </Link>

          {/* Mobile logo (shown only on mobile) */}
          <div className="lg:hidden flex items-center justify-center gap-3 py-4">
            <Image src={logoIEQ} alt="IEQ 157" width={50} height={50} />
            <span className="text-xl font-semibold text-gold">IEQ 157</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Bem-vindo de volta</h1>
            <p className="text-text-secondary">Entre para acessar sua conta e inscricoes</p>
          </div>

          <LoginForm />

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-bg-primary text-sm text-text-muted">ou continue com</span>
            </div>
          </div>

          <GoogleLoginButton />

          <div className="pt-4 text-center">
            <p className="text-sm text-text-muted mb-3">Nao deseja fazer login agora?</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-transparent border border-gold/30 text-text-secondary hover:text-text-primary hover:border-gold/50 rounded-lg transition-all no-underline"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Continuar para o site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
