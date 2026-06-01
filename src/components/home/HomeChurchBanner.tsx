'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks'
import { useUserChurch } from '@/hooks/queries/useUserChurch'
import { ChurchBadge } from '@/components/church/ChurchBadge'
import { CHURCH_MODAL_DISMISS_KEY } from '@/shared/types'

export function HomeChurchBanner() {
  const router = useRouter()
  const { isAuthenticated, profileLoading } = useAuth()
  const { data: userChurch, isLoading } = useUserChurch(isAuthenticated)

  if (!isAuthenticated || profileLoading) return null

  const handleSelect = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(CHURCH_MODAL_DISMISS_KEY)
    }
    router.push('/minha-conta')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 -mt-4 mb-6">
      <ChurchBadge
        church={userChurch?.church ?? null}
        variant="home"
        loading={isLoading}
        onSelectClick={handleSelect}
      />
    </div>
  )
}
