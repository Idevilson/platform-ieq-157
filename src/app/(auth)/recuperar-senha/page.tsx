'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth'
import { useAuth } from '@/hooks'
import logoIEQ from '@/assets/images/only-logo.png'

export default function RecuperarSenhaPage() {
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
        <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary items-center justify-center p-12">
          <div className="text-center space-y-6">
            <Image src={logoIEQ} alt="IEQ 157" className="mx-auto animate-pulse-slow" width={120} height={120} />
            <h2 className="text-3xl font-bold text-gold">IEQ 157</h2>
            <h3 className="text-xl text-text-secondary">Capital do Avivamento</h3>
          </div>
        </div>
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
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
        <div className="relative text-center space-y-6 max-w-md">
          <Image src={logoIEQ} alt="IEQ 157" className="mx-auto animate-pulse-slow" width={120} height={120} />
          <h2 className="text-3xl font-bold text-gold text-glow">IEQ 157</h2>
          <h3 className="text-xl text-text-secondary">Capital do Avivamento</h3>
          <div className="mt-8 p-6 bg-bg-primary/50 rounded-xl border border-gold/10">
            <p className="text-text-secondary italic text-sm leading-relaxed">
              &ldquo;O Senhor e o meu pastor; nada me faltara.&rdquo;
            </p>
            <span className="block mt-3 text-gold text-xs font-medium">Salmos 23:1</span>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center bg-bg-primary p-6 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors no-underline">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Voltar ao login
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 py-4">
            <Image src={logoIEQ} alt="IEQ 157" width={50} height={50} />
            <span className="text-xl font-semibold text-gold">IEQ 157</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">Recuperar senha</h1>
            <p className="text-text-secondary">Vamos enviar um link para redefinir sua senha</p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
