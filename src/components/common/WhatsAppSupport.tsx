'use client'

import { useState } from 'react'

const WA_URL = 'https://wa.me/5594992321523'

interface WhatsAppSupportProps {
  variant?: 'inline' | 'floating'
  label?: string
}

export function WhatsAppSupport({ variant = 'inline', label = 'Precisa de ajuda? Fale conosco' }: WhatsAppSupportProps) {
  if (variant === 'floating') {
    return (
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#25D366] text-white font-semibold text-sm rounded-full shadow-lg hover:bg-[#1ebe5d] hover:-translate-y-0.5 transition-all"
        aria-label="Suporte via WhatsApp"
      >
        <WhatsAppIcon />
        <span className="hidden sm:inline">Suporte</span>
      </a>
    )
  }

  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 rounded-xl text-sm font-medium hover:bg-[#25D366]/20 transition-colors"
    >
      <WhatsAppIcon />
      {label}
    </a>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.428a.5.5 0 00.609.61l5.627-1.476A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.933 0-3.742-.518-5.293-1.42l-.38-.225-3.938 1.032 1.049-3.826-.247-.393A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  )
}
