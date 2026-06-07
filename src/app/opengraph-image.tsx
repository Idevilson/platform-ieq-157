import { ImageResponse } from 'next/og'

export const alt = 'IEQ 157 Redenção-PA · Capital do Avivamento'
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
          justifyContent: 'center',
          background: '#0a0a0a',
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,215,0,0.18) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(218,165,32,0.15) 0%, transparent 65%)',
          position: 'relative',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '36px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 900,
              color: '#0a0a0a',
            }}
          >
            ✝
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#FFD700',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            IEQ Sede Campo 157
          </div>
        </div>

        <div
          style={{
            fontSize: '120px',
            fontWeight: 900,
            color: 'white',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          IEQ 157
        </div>

        <div
          style={{
            fontSize: '52px',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #FFD700, #DAA520)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '40px',
          }}
        >
          Redenção · PA
        </div>

        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          Igreja do Evangelho Quadrangular
        </div>

        <div
          style={{
            marginTop: '24px',
            padding: '12px 28px',
            border: '2px solid rgba(255,215,0,0.4)',
            borderRadius: '999px',
            fontSize: '22px',
            color: '#FFD700',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Capital do Avivamento
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.1em',
          }}
        >
          ieqredencaopa157.com
        </div>
      </div>
    ),
    { ...size }
  )
}
