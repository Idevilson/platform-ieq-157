'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { toPng } from 'html-to-image'
import { QRCodeSVG } from 'qrcode.react'

interface ShareableReceiptProps {
  inscriptionId: string
  participantName: string
  eventName: string
  eventDates: string
  eventLocation: string
}

export function ShareableReceipt({
  inscriptionId,
  participantName,
  eventName,
  eventDates,
  eventLocation,
}: ShareableReceiptProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return

    setIsGenerating(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      })

      const link = document.createElement('a')
      link.download = `inscricao-${eventName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShareWhatsApp = () => {
    const text = `🎉 Estou confirmado(a) no *${eventName}*!\n\n📅 ${eventDates}\n📍 ${eventLocation}\n\n_Faça sua inscrição também!_`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Card para compartilhar */}
      <div
        ref={cardRef}
        className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl"
        style={{ aspectRatio: '1/1' }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]" />

        {/* Decorative gold lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/images/only-logo.png"
                alt="IEQ"
                width={32}
                height={32}
                className="opacity-90"
              />
              <div className="text-left">
                <p className="text-gold text-sm font-bold">REDENÇÃO - PA</p>
                <p className="text-gold/60 text-[10px] uppercase tracking-wide">Capital do Avivamento</p>
              </div>
            </div>
            <div className="bg-green-500/20 border border-green-500/40 rounded-full px-4 py-1.5">
              <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">
                Confirmado
              </span>
            </div>
          </div>

          {/* Main content - grid layout */}
          <div className="flex items-center gap-5">
            {/* Event images - 2x2 grid */}
            <div className="grid grid-cols-2 gap-2 w-[140px] shrink-0">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gold/30">
                <Image src="/images/startup/homem.jpeg" alt="" width={70} height={70} className="object-cover w-full h-full" />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gold/30">
                <Image src="/images/startup/leão.jpeg" alt="" width={70} height={70} className="object-cover w-full h-full" />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gold/30">
                <Image src="/images/startup/boi.jpeg" alt="" width={70} height={70} className="object-cover w-full h-full" />
              </div>
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gold/30">
                <Image src="/images/startup/aguia.jpeg" alt="" width={70} height={70} className="object-cover w-full h-full" />
              </div>
            </div>

            {/* Event info + Participant */}
            <div className="flex-1 text-center">
              <h3 className="text-gold text-2xl font-bold uppercase tracking-wider mb-1">
                {eventName}
              </h3>
              <p className="text-gold/70 text-sm mb-4">
                A Uncao dos Quatro Seres
              </p>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {participantName}
              </h2>
            </div>
          </div>

          {/* Footer - Date, Location and QR */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-gold/20">
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{eventDates}</p>
              <p className="text-white/60 text-xs mt-1">{eventLocation}</p>
            </div>
            <div className="bg-white p-1.5 rounded-lg shrink-0">
              <QRCodeSVG
                value={inscriptionId}
                size={56}
                level="M"
                bgColor="#ffffff"
                fgColor="#1a1a2e"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 max-w-md mx-auto">
        <button
          onClick={handleShareWhatsApp}
          className="w-full py-3 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enviar Texto no WhatsApp
        </button>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar Imagem
        </button>
      </div>
    </div>
  )
}
