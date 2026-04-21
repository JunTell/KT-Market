// framer/home/HomeHero.tsx
import { addPropertyControls, ControlType } from 'framer'
import { useCallback } from 'react'

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

interface Props {
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaColor?: string
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function HomeHero({
  title = 'KT 공식대리점 온라인몰\nKT마켓에서만 가능한 가격을 만나보세요',
  subtitle = '상담부터 개통까지, 단 한 번의 클릭으로',
  ctaLabel = '빠른 견적받아보기',
  ctaColor = '#0066FF',
}: Props) {
  const handleCta = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ktmarket:open-quick-quote'))
    }
  }, [])

  return (
    <div
      style={{
        minHeight: '100svh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: '#FAF9F5',
        fontFamily: FONT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* warm blur decoration */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-120px',
          right: '-80px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          backgroundColor: '#D97757',
          opacity: 0.12,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: ctaColor,
          opacity: 0.08,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px', width: '100%', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: FONT,
            fontSize: '28px',
            lineHeight: 1.3,
            fontWeight: 700,
            color: '#24292E',
            letterSpacing: -1,
            whiteSpace: 'pre-line',
            wordBreak: 'keep-all',
            margin: 0,
            marginBottom: '16px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: '16px',
            lineHeight: 1.5,
            color: '#3F4750',
            letterSpacing: -0.3,
            wordBreak: 'keep-all',
            margin: 0,
            marginBottom: '40px',
          }}
        >
          {subtitle}
        </p>
        <button
          onClick={handleCta}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: ctaColor,
            color: '#FFFFFF',
            fontFamily: FONT,
            fontSize: '17px',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: 0.08,
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 120ms ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          onTouchStart={(e) => (e.currentTarget.style.opacity = '0.9')}
          onTouchEnd={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}

addPropertyControls(HomeHero, {
  title: { type: ControlType.String, title: 'Title', defaultValue: 'KT 공식대리점 온라인몰\nKT마켓에서만 가능한 가격을 만나보세요', displayTextArea: true },
  subtitle: { type: ControlType.String, title: 'Subtitle', defaultValue: '상담부터 개통까지, 단 한 번의 클릭으로' },
  ctaLabel: { type: ControlType.String, title: 'CTA Label', defaultValue: '빠른 견적받아보기' },
  ctaColor: { type: ControlType.Color, title: 'CTA Color', defaultValue: '#0066FF' },
})
