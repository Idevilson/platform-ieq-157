'use client'

import Link from 'next/link'
import { useRequireAuth } from '@/hooks'

export default function MinhaContaPage() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Minha conta</h1>
        <p className="text-text-secondary">
          Olá, {user?.profile?.nome || user?.displayName || 'Usuário'}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/minha-conta/perfil"
          className="card flex items-start gap-4 hover:-translate-y-1 hover:shadow-dark transition-all no-underline"
        >
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl flex-shrink-0">
            👤
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">Meu perfil</h3>
            <p className="text-sm text-text-secondary">Edite suas informações pessoais</p>
          </div>
        </Link>

        <Link
          href="/minha-conta/inscricoes"
          className="card flex items-start gap-4 hover:-translate-y-1 hover:shadow-dark transition-all no-underline"
        >
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl flex-shrink-0">
            📋
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">Minhas inscrições</h3>
            <p className="text-sm text-text-secondary">Veja e gerencie suas inscrições em eventos</p>
          </div>
        </Link>

        <Link
          href="/minha-conta/pagamentos"
          className="card flex items-start gap-4 hover:-translate-y-1 hover:shadow-dark transition-all no-underline"
        >
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl flex-shrink-0">
            💳
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary mb-1">Meus pagamentos</h3>
            <p className="text-sm text-text-secondary">Acompanhe o status dos seus pagamentos</p>
          </div>
        </Link>
      </div>

      {!user?.profile?.cpf && (
        <div className="p-6 bg-gold/10 border border-gold/30 rounded-xl text-center space-y-4">
          <p className="text-text-secondary">Complete seu perfil para poder se inscrever em eventos.</p>
          <Link href="/minha-conta/perfil?complete=true" className="btn-primary inline-block">
            Completar perfil
          </Link>
        </div>
      )}
    </div>
  )
}
