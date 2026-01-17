import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>404</h1>
          <h2 style={{ marginBottom: '1rem' }}>Pagina nao encontrada</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            A pagina que voce procura nao existe ou foi removida.
          </p>
          <Link
            href="/"
            style={{
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-bronze) 100%)',
              color: '#000',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Voltar para Inicio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
