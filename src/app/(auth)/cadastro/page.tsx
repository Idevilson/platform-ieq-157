'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { RegisterForm, GoogleLoginButton } from '@/components/auth'
import { useAuth } from '@/hooks'
import logoIEQ from '@/assets/images/only-logo.png'

export default function CadastroPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/minha-conta')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <span className="text-text-secondary">Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      <div className="w-full max-w-xl bg-bg-secondary/50 border border-gold/10 rounded-2xl p-6 md:p-8 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors no-underline">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar ao inicio
        </Link>

        <div className="flex items-center justify-center gap-3">
          <Image src={logoIEQ} alt="IEQ 157" width={50} height={50} />
          <span className="text-xl font-semibold text-gold">IEQ 157</span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">Criar sua conta</h1>
          <p className="text-text-secondary text-sm">Cadastre-se para se inscrever nos eventos</p>
        </div>

        <RegisterForm />

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gold/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-bg-secondary/50 text-sm text-text-muted">ou cadastre-se com</span>
          </div>
        </div>

        <GoogleLoginButton />
      </div>
    </div>
  )
}
