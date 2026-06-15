"use client"

import Link from 'next/link'
import Image from 'next/image'
import logoIEQ from '@/assets/images/only-logo.png'

export default function Footer() {
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
            <p>Redencao - PA</p>
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
      <div className="border-t border-gold/10 py-7 px-6 flex flex-col items-center gap-3">
        <p className="text-center text-sm text-text-secondary">
          Feito com amor <span className="text-red-500">❤️</span> por{' '}
          <a
            href="https://www.linkedin.com/in/idevilson-junior-493a3a143/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold font-medium hover:underline no-underline"
          >
            Idevilson
          </a>
          {' & '}
          <span className="text-gold font-medium">Estrela</span>
        </p>

        <p className="text-center text-xs text-text-muted italic max-w-xl leading-relaxed">
          &ldquo;Cada um exerça o dom que recebeu para servir os outros, administrando fielmente a graça de Deus em suas múltiplas formas.&rdquo;
          <span className="block not-italic mt-1 text-gold/60 tracking-wide">1 Pedro 4:10</span>
        </p>

        <div className="flex items-center gap-5 pt-1">
          <a
            href="https://www.linkedin.com/in/idevilson-junior-493a3a143/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn de Idevilson"
            className="text-text-muted hover:text-gold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
            </svg>
          </a>
          <a
            href="https://github.com/Idevilson"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub de Idevilson"
            className="text-text-muted hover:text-gold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.82 0c2.22-1.49 3.2-1.18 3.2-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
