'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks'
import { usePublicChurches } from '@/hooks/queries/useChurches'
import { useSetUserChurch } from '@/hooks/mutations/useUserChurchMutations'
import { CHURCH_MODAL_DISMISS_KEY } from '@/shared/types'
import { ChurchSelectorModal } from './ChurchSelectorModal'

export function ChurchSelectorBootstrap() {
  const { user, isAuthenticated, profileLoading } = useAuth()
  const { data: churches = [], isLoading: churchesLoading } = usePublicChurches()
  const setChurch = useSetUserChurch()
  const [open, setOpen] = useState(false)

  const profileChurchId = user?.profile?.churchId ?? null

  useEffect(() => {
    if (!isAuthenticated) return
    if (profileLoading) return
    if (profileChurchId !== null) return
    if (typeof window === 'undefined') return

    const dismissed = window.sessionStorage.getItem(CHURCH_MODAL_DISMISS_KEY)
    if (dismissed === '1') return

    setOpen(true)
  }, [isAuthenticated, profileLoading, profileChurchId])

  if (!isAuthenticated) return null

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(CHURCH_MODAL_DISMISS_KEY, '1')
    }
    setOpen(false)
  }

  const handleConfirm = async (churchId: string) => {
    await setChurch.mutateAsync(churchId)
  }

  return (
    <ChurchSelectorModal
      open={open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      churches={churches}
      currentChurchId={null}
      mode="initial"
      loading={churchesLoading}
    />
  )
}
