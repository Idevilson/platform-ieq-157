import { ImageResponse } from 'next/og'

export const alt = 'Congresso Geração Forte · Follow Me · 03 a 05 de Julho de 2026 · IEQ 157 Redenção-PA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          backgroundImage:
            'radial-gradient(ellipse 70% 55% at 50% 18%, rgba(82,39,255,0.32) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 50% 95%, rgba(212,160,23,0.28) 0%, transparent 65%), radial-gradient(circle at 85% 12%, rgba(255,215,0,0.14) 0%, transparent 40%)',
          padding: '70px',
          position: 'relative',
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              padding: '10px 22px',
              border: '2px solid rgba(212,160,23,0.5)',
              borderRadius: '999px',
              fontSize: '22px',
              color: '#FFD700',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontWeight: 800,
              background: 'rgba(212,160,23,0.08)',
            }}
          >
            ✝ Follow Me · Marcos 8:34
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'rgba(255,215,0,0.85)',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Congresso Setorizado da
          </div>
          <div
            style={{
              fontSize: '140px',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD700 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              textTransform: 'uppercase',
            }}
          >
            Geração Forte
          </div>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
                color: '#0a0a0a',
                borderRadius: '14px',
                fontSize: '28px',
                fontWeight: 900,
                letterSpacing: '0.05em',
              }}
            >
              03 · 04 · 05
            </div>
            <div
              style={{
                padding: '14px 28px',
                border: '2px solid rgba(255,215,0,0.5)',
                color: '#FFD700',
                borderRadius: '14px',
                fontSize: '28px',
                fontWeight: 900,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Julho · 2026
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            IEQ Sede Campo 157 · Redenção · PA
          </div>
          <div
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.05em',
            }}
          >
            ieqredencaopa157.com/eventos/geracao-forte
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
