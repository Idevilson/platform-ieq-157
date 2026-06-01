'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useAdminChurches } from '@/hooks/queries/useAdminChurches'
import { EditChurchModal } from '@/components/admin/EditChurchModal'
import { ChurchMembersList } from '@/components/admin/ChurchMembersList'

interface PageProps {
  params: Promise<{ churchId: string }>
}

export default function AdminChurchDetailPage({ params }: PageProps) {
  const { churchId } = use(params)
  const { data: churches = [], isLoading } = useAdminChurches()
  const church = churches.find((c) => c.id === churchId) ?? null
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) {
    return <p className="text-text-muted">Carregando…</p>
  }

  if (!church) {
    return (
      <div className="space-y-3">
        <p className="text-text-secondary">Igreja não encontrada.</p>
        <Link
          href="/minha-conta/admin/igrejas"
          className="text-sm text-gold hover:underline"
        >
          ← Voltar para listagem
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/minha-conta/admin/igrejas"
          className="text-xs text-text-muted hover:text-text-secondary"
        >
          ← Igrejas
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{church.nome}</h2>
            <p className="text-sm text-text-muted mt-1">
              {[church.cidade, church.estado].filter(Boolean).join(' · ') || '—'} ·
              <span className={church.ativo ? ' text-emerald-400' : ' text-text-muted'}>
                {church.ativo ? ' Ativa' : ' Inativa'}
              </span>
            </p>
            <p className="text-xs text-text-muted mt-1 font-mono">{church.slug}</p>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-gold/30 text-xs text-gold hover:bg-gold/5 transition-colors"
          >
            Editar igreja
          </button>
        </div>
      </div>

      <ChurchMembersList churchId={churchId} />

      <EditChurchModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        church={church}
      />
    </div>
  )
}
