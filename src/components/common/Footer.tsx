"use client"

import Link from 'next/link'
import Image from 'next/image'
import logoIEQ from '@/assets/images/only-logo.png'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-bg-secondary border-t border-gold/10">
      <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Image src={logoIEQ} alt="Logo IEQ" className="w-10 h-10" width={40} height={40} />
            <span className="text-lg font-semibold text-gold">IEQ 157</span>
          </div>
          <p className="text-sm text-text-secondary">Redencao - PA: Capital do Avivamento</p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Links Rapidos</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/" className="text-sm text-text-secondary hover:text-gold transition-colors no-underline">Inicio</Link>
            <Link href="/eventos" className="text-sm text-text-secondary hover:text-gold transition-colors no-underline">Eventos</Link>
            <Link href="/avisos" className="text-sm text-text-secondary hover:text-gold transition-colors no-underline">Avisos</Link>
            <Link href="/calendario" className="text-sm text-text-secondary hover:text-gold transition-colors no-underline">Calendario</Link>
            <Link href="/sobre" className="text-sm text-text-secondary hover:text-gold transition-colors no-underline">Sobre</Link>
          </nav>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Contato</h4>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>Rua Example, 157</p>
            <p>Redencao - PA</p>
            <p>(94) 99999-9999</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Horarios</h4>
          <div className="space-y-2 text-sm text-text-secondary">
            <p><span className="text-text-primary font-medium">Domingo:</span> 09h e 18h</p>
            <p><span className="text-text-primary font-medium">Quarta:</span> 19h30</p>
            <p><span className="text-text-primary font-medium">Sexta:</span> 19h30</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gold/10 py-6">
        <p className="text-center text-xs text-text-muted">
          &copy; {currentYear} Igreja do Evangelho Quadrangular 157. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
