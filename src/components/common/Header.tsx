"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks'
import logoIEQ from '@/assets/images/only-logo.png'

export default function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, loading, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const navLinkClass = (active: boolean) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 no-underline ${
      active
        ? 'text-gold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-gold after:rounded-full'
        : 'text-text-secondary hover:text-text-primary'
    }`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-b border-gold/10">
      <div className="max-w-[1400px] mx-auto px-6 h-[70px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src={logoIEQ} alt="Logo IEQ" className="w-10 h-10" width={40} height={40} />
          <span className="text-lg font-semibold text-gold tracking-wide">IEQ 157</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`
          md:flex md:items-center md:gap-1 md:static md:bg-transparent md:p-0 md:border-none md:h-auto
          ${mobileMenuOpen
            ? 'flex flex-col fixed top-[70px] left-0 right-0 bg-bg-primary/98 backdrop-blur-md border-b border-gold/10 p-6 gap-2 animate-dropdown z-40'
            : 'hidden md:flex'
          }
        `}>
          <Link href="/" className={navLinkClass(isActive('/'))} onClick={() => setMobileMenuOpen(false)}>
            Inicio
          </Link>
          <Link href="/eventos" className={navLinkClass(isActive('/eventos'))} onClick={() => setMobileMenuOpen(false)}>
            Eventos
          </Link>
          <Link href="/avisos" className={navLinkClass(isActive('/avisos'))} onClick={() => setMobileMenuOpen(false)}>
            Avisos
          </Link>
          <Link href="/calendario" className={navLinkClass(isActive('/calendario'))} onClick={() => setMobileMenuOpen(false)}>
            Calendario
          </Link>
          <Link href="/sobre" className={navLinkClass(isActive('/sobre'))} onClick={() => setMobileMenuOpen(false)}>
            Sobre
          </Link>
          <Link href="/historia" className={navLinkClass(isActive('/historia'))} onClick={() => setMobileMenuOpen(false)}>
            História
          </Link>

          {/* Mobile account section */}
          <div className="md:hidden flex flex-col gap-2 mt-4 pt-4 border-t border-gold/10">
            {loading ? (
              <span className="text-sm text-text-muted">Carregando...</span>
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/minha-conta"
                  className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Minha Conta
                </Link>
                <button
                  className="px-3 py-2 text-sm text-red-500 text-left hover:bg-red-500/10 rounded-lg transition-colors"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gold to-gold-dark text-bg-primary font-semibold text-sm rounded-lg shadow-gold no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Entrar
              </Link>
            )}
          </div>
        </nav>

        {/* Desktop account section */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-bg-tertiary animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent border border-gold/20 hover:border-gold/40 transition-all"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Menu da conta"
              >
                <span className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-xs font-semibold text-gold">
                  {getInitials(user?.displayName)}
                </span>
                <span className="text-sm text-text-primary max-w-[100px] truncate">
                  {user?.displayName?.split(' ')[0] || 'Usuario'}
                </span>
                <svg
                  className={`w-3 h-3 text-text-muted transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-bg-secondary border border-gold/15 rounded-xl shadow-dark-lg overflow-hidden animate-dropdown">
                  <div className="px-4 py-3 border-b border-gold/10">
                    <span className="text-xs text-text-muted truncate block">{user?.email}</span>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/minha-conta"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-gold/5 transition-colors no-underline"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M13 14C13 11.2386 10.7614 9 8 9C5.23858 9 3 11.2386 3 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Minha Conta
                    </Link>
                    <Link
                      href="/minha-conta/perfil"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-gold/5 transition-colors no-underline"
                      onClick={() => setShowDropdown(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Editar Perfil
                    </Link>
                  </div>
                  <div className="border-t border-gold/10 py-2">
                    <button
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M11 11L14 8L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold to-gold-dark text-bg-primary font-semibold text-sm rounded-lg shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 transition-all duration-200 no-underline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 14C13 11.2386 10.7614 9 8 9C5.23858 9 3 11.2386 3 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Entrar
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className={`md:hidden flex flex-col gap-1.5 p-2 -mr-2 ${mobileMenuOpen ? 'open' : ''}`}
          aria-label="Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`w-6 h-0.5 bg-text-primary transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-text-primary transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-text-primary transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>
    </header>
  )
}
