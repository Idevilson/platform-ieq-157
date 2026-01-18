'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { ProfileForm } from '@/components/auth'
import { useRequireAuth } from '@/hooks'

export default function PerfilPage() {
  const { user, loading } = useRequireAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isCompletionFlow = searchParams.get('complete') === 'true'

  const handleSuccess = () => {
    if (isCompletionFlow) {
      router.push('/minha-conta')
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="spinner" />
          <p className="text-text-secondary">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {isCompletionFlow ? 'Complete seu perfil' : 'Meu perfil'}
        </h1>
        {!isCompletionFlow && (
          <p className="text-text-secondary">Gerencie suas informações pessoais</p>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gold/10">
          <span className="text-sm font-medium text-text-muted">Email:</span>
          <span className="text-sm text-text-primary">{user?.email}</span>
        </div>

        <ProfileForm
          onSuccess={handleSuccess}
          isCompletionFlow={isCompletionFlow}
        />
      </div>
    </div>
  )
}
