'use client'

import { ReactNode, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks'
import { useRequireAuth } from '@/hooks'
import { EVENT_OPS_PERMISSIONS } from '@/shared/constants'
import Header from '@/components/common/Header'

interface MinhaContaLayoutProps {
  children: ReactNode
}

export default function MinhaContaLayout({ children }: MinhaContaLayoutProps) {
  const pathname = usePathname()
  const { logout, isAdmin, permissions } = useAuth()
  const { loading } = useRequireAuth()
  const canOperate = isAdmin || permissions.some((g) => EVENT_OPS_PERMISSIONS.includes(g.key))

  const handleLogout = async () => {
    await logout()
  }

  const navItems = useMemo(() => {
    const items: { href: string; label: string; exact?: boolean }[] = [
      { href: '/minha-conta', label: 'Visão geral', exact: true },
      { href: '/minha-conta/perfil', label: 'Meu perfil' },
      { href: '/minha-conta/inscricoes', label: 'Minhas inscrições' },
      { href: '/minha-conta/pagamentos', label: 'Meus pagamentos' },
    ]
    if (canOperate) {
      items.push({ href: '/minha-conta/operacao', label: 'Operação' })
    }
    if (isAdmin) {
      items.push({ href: '/minha-conta/admin', label: 'Admin' })
    }
    return items
  }, [isAdmin, canOperate])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-bg-primary pt-[70px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="spinner" />
            <span className="text-text-secondary">Carregando...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-bg-primary pt-[70px] flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-[260px] bg-bg-secondary border-r border-gold/10 fixed top-[70px] left-0 bottom-0">
          <nav className="flex-1 py-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-3 ${
                  isActive(item.href, item.exact)
                    ? 'text-gold bg-gold/10 border-l-gold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gold/5 border-l-transparent'
                } no-underline`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gold/10">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-sm font-medium text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Sair
            </button>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed top-[70px] left-0 right-0 bg-bg-secondary border-b border-gold/10 z-40">
          <div className="grid grid-cols-3 gap-1 p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center text-center px-2 py-2.5 text-xs font-medium rounded-lg transition-colors no-underline leading-tight ${
                  isActive(item.href, item.exact)
                    ? 'bg-gold/15 text-gold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gold/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 min-w-0 md:ml-[260px] p-4 sm:p-6 md:p-8 mt-[96px] md:mt-0">
          {children}
        </main>
      </div>
    </>
  )
}
