'use client'

import { InscriptionStatus as InscriptionStatusType, INSCRIPTION_STATUS_LABELS } from '@/shared/constants'

interface InscriptionStatusProps {
  status: InscriptionStatusType
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function InscriptionStatus({
  status,
  showLabel = true,
  size = 'medium',
}: InscriptionStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pendente':
        return '⏳'
      case 'confirmado':
        return '✓'
      case 'cancelado':
        return '✗'
      default:
        return '•'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'pendente':
        return 'status--pending'
      case 'confirmado':
        return 'status--confirmed'
      case 'cancelado':
        return 'status--cancelled'
      default:
        return ''
    }
  }

  return (
    <span className={`inscription-status inscription-status--${size} ${getStatusColor()}`}>
      <span className="inscription-status__icon">{getStatusIcon()}</span>
      {showLabel && (
        <span className="inscription-status__label">{INSCRIPTION_STATUS_LABELS[status]}</span>
      )}
    </span>
  )
}
