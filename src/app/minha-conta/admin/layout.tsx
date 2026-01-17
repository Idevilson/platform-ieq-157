'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRequireAdmin } from '@/hooks'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { loading, isAdmin } = useRequireAdmin({ redirectTo: '/minha-conta' })

  const navItems = [
    { href: '/minha-conta/admin', label: 'Gerenciar Eventos', exact: true },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <span className="text-text-secondary">Verificando permissões...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gold mb-2">Painel Administrativo</h1>
        <nav className="flex gap-4 border-b border-gold/10 pb-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors pb-2 -mb-2 border-b-2 ${
                isActive(item.href, item.exact)
                  ? 'text-gold border-gold'
                  : 'text-text-secondary hover:text-text-primary border-transparent'
              } no-underline`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  )
}
