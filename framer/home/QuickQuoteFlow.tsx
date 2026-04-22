// framer/home/QuickQuoteFlow.tsx
// B approach: Samsung/Apple 탭 + PhoneCompare 이미지 패턴 + 단계별 자동 진행 + Framer 통신사 이미지
import { addPropertyControls, ControlType } from 'framer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from "@supabase/supabase-js"

const FONT = '"Pretendard Variable", "Pretendard", -apple-system, sans-serif'
const S3   = 'https://juntell.s3.ap-northeast-2.amazonaws.com/phone'

const supabase = createClient(
  'https://crooiozzbjwdaghqddnu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM'
)

const C = {
  white: '#FFFFFF', bg: '#FAFAFA', surface: '#F5F5F7',
  border: '#E8E8EC', borderLight: '#F0F0F3',
  textPrimary: '#1A1A1A', textSecondary: '#505056',
  textTertiary: '#8E8E93', textDisabled: '#AEAEB2',
  blue: '#3182F6', blueBg: '#EBF4FF',
  red: '#F04452', green: '#00B386', greenBg: '#E8FAF5',
} as const

// ─── PhoneCompare 동일 이미지 URL 추출 ───────────────────────────────────────
function resolveImageUrl(d: {
  category?: string | null
  colors_en?: string[] | null
  images?: Record<string, string[]> | null
  thumbnail?: string | null
}): string | null {
  const enColors = d.colors_en ?? []
  const imgs     = d.images ?? {}
  if (d.category && enColors.length > 0) {
    for (const color of enColors) {
      const keys = imgs[color] ?? []
      if (keys.length > 0) return `${S3}/${d.category}/${color}/${keys[0]}.png`
    }
  }
  return d.thumbnail ?? null
}

// ─── 기종 데이터 ──────────────────────────────────────────────────────────────
interface PhoneModel {
  modelCode: string
  name: string
  isLegacy?: boolean
}
interface Series { key: string; label: string; models: PhoneModel[] }

const SAMSUNG_SERIES: Series[] = [
  {
    key: 'galaxy-s', label: 'Galaxy S',
    models: [
      { modelCode: 'sm-s948nk', name: 'Galaxy S26 Ultra' },
      { modelCode: 'sm-s947nk', name: 'Galaxy S26+' },
      { modelCode: 'sm-s942nk', name: 'Galaxy S26' },
    ],
  },
  {
    key: 'galaxy-z', label: 'Galaxy Z',
    models: [
      { modelCode: 'sm-f741nk', name: 'Z Flip7' },
      { modelCode: 'sm-f761nk', name: 'Z Fold7' },
    ],
  },
  {
    key: 'galaxy-a', label: 'Galaxy A',
    models: [{ modelCode: 'sm-a165nk', name: 'Galaxy A', isLegacy: true }],
  },
  {
    key: 'galaxy-legacy', label: '이전 모델',
    models: [{ modelCode: 'sm-s928nk', name: 'Galaxy S25 이하', isLegacy: true }],
  },
]

const APPLE_SERIES: Series[] = [
  {
    key: 'iphone-17', label: 'iPhone 17',
    models: [
      { modelCode: 'aip17e-256',  name: 'iPhone 17e' },
      { modelCode: 'aip17-256',   name: 'iPhone 17' },
      { modelCode: 'aip17p-256',  name: 'iPhone 17 Pro' },
      { modelCode: 'aip17pm-256', name: 'iPhone 17 Pro Max' },
      { modelCode: 'aipa-256',    name: 'iPhone 17 Air' },
    ],
  },
  {
    key: 'iphone-legacy', label: '이전 모델',
    models: [{ modelCode: 'aip16-256', name: 'iPhone 16 이하', isLegacy: true }],
  },
]

const ALL_MODEL_CODES = [
  ...SAMSUNG_SERIES.flatMap(s => s.models.map(m => m.modelCode)),
  ...APPLE_SERIES.flatMap(s  => s.models.map(m => m.modelCode)),
]

// ─── 변경 시기 ────────────────────────────────────────────────────────────────
const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  '1month': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="#F04452" strokeWidth="1.5"/>
      <path d="M9 5v4l2.5 2.5" stroke="#F04452" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  '2-3month': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.25" y="3.75" width="13.5" height="12" rx="1.5" stroke="#505056" strokeWidth="1.5"/>
      <path d="M2.25 7.5h13.5M6 2.25v3M12 2.25v3" stroke="#505056" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  '6month': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.25" y="3.75" width="13.5" height="12" rx="1.5" stroke="#505056" strokeWidth="1.5"/>
      <path d="M2.25 7.5h13.5M6 2.25v3M12 2.25v3" stroke="#505056" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="12" r="1.5" fill="#505056"/>
    </svg>
  ),
  'after6month': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2.25v13.5M2.25 9h13.5" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="9" r="2" fill="#8E8E93"/>
    </svg>
  ),
  'after1year': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 15.75A6.75 6.75 0 1 0 9 2.25a6.75 6.75 0 0 0 0 13.5Z" stroke="#8E8E93" strokeWidth="1.5"/>
      <path d="M9 5.25V9l3 1.5" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'not-yet': (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="#8E8E93" strokeWidth="1.5"/>
      <path d="M6.75 6.75a2.25 2.25 0 1 1 2.25 2.25V10.5" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="12.75" r="0.75" fill="#8E8E93"/>
    </svg>
  ),
}

const TIMELINE_OPTIONS = [
  { key: '1month',     label: '당장 1개월 안에' },
  { key: '2-3month',  label: '2~3개월 안에' },
  { key: '6month',    label: '6개월 안에' },
  { key: 'after6month', label: '6개월 이후' },
  { key: 'after1year',  label: '1년 이후' },
  { key: 'not-yet',   label: '아직 생각 없어요' },
] as const

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function formatPhone(digits: string): string {
  const n = digits.replace(/\D/g, '').slice(0, 11)
  if (n.length < 4) return n
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`
}
function sanitizeDigits(v: string, max: number): string {
  return v.replace(/\D/g, '').slice(0, max)
}

// ─── 타입 ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  selectedPhone: string      // 실제 model code
  selectedPhoneName: string  // 표시명
  timeline: string
  carrier: string
  name: string
  phone: string
  birthday: string
  agree: boolean
}

const INITIAL_FORM: FormData = {
  selectedPhone: '', selectedPhoneName: '',
  timeline: '', carrier: '',
  name: '', phone: '', birthday: '',
  agree: true,
}

interface Props {
  apiUrl?: string
  primaryColor?: string
  sktLogo?: string   // Framer에서 이미지 직접 등록
  ktLogo?: string
  lguLogo?: string
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function QuickQuoteFlow({
  apiUrl = 'https://kt-market-puce.vercel.app',
  primaryColor,
  sktLogo,
  ktLogo,
  lguLogo,
}: Props) {
  const accent = primaryColor || C.blue

  const [step, setStep]           = useState<Step>(1)
  const [form, setForm]           = useState<FormData>(INITIAL_FORM)
  const [images, setImages]       = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'samsung' | 'apple'>('samsung')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]         = useState<string | null>(null)

  // PhoneCompare 동일 패턴 — 기종 이미지 일괄 조회
  useEffect(() => {
    supabase
      .from('devices')
      .select('model, category, colors_en, images, thumbnail')
      .in('model', ALL_MODEL_CODES)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string> = {}
        data.forEach(d => {
          const url = resolveImageUrl(d)
          if (url) map[d.model] = url
        })
        setImages(map)
      })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const goBack = useCallback(() => {
    if (step === 1) { if (typeof window !== 'undefined') window.history.back() }
    else setStep(s => (s - 1) as Step)
  }, [step])

  // 각 단계 선택 즉시 자동 진행 (200ms 시각적 피드백 후)
  const selectPhone = useCallback((m: PhoneModel) => {
    setForm(f => ({ ...f, selectedPhone: m.modelCode, selectedPhoneName: m.name }))
    setTimeout(() => setStep(2), 200)
  }, [])

  const selectTimeline = useCallback((key: string) => {
    setForm(f => ({ ...f, timeline: key }))
    setTimeout(() => setStep(3), 200)
  }, [])

  const selectCarrier = useCallback((key: string) => {
    setForm(f => ({ ...f, carrier: key }))
    setTimeout(() => setStep(4), 200)
  }, [])

  const canSubmit = useMemo(() => {
    const phoneOk = /^01[016789]\d{7,8}$/.test(form.phone)
    const birthOk = /^\d{6}$/.test(form.birthday)
    return form.name.trim().length >= 2 && phoneOk && birthOk && form.agree && !submitting
  }, [form, submitting])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    const controller = new AbortController()
    const tid = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch(`${apiUrl}/api/consultations/quick-quote`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: form.selectedPhone,
          petName: form.selectedPhoneName,
          timeline: form.timeline,
          carrier: form.carrier,
          name: form.name.trim(),
          phone: form.phone,
          birthday: form.birthday,
        }),
      })
      clearTimeout(tid)
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setToast(json.error ?? '잠시 후 다시 시도해주세요')
        setSubmitting(false)
        return
      }
      setStep(5)
      setSubmitting(false)
    } catch (err) {
      clearTimeout(tid)
      setToast((err as Error).name === 'AbortError' ? '네트워크가 불안정합니다' : '잠시 후 다시 시도해주세요')
      setSubmitting(false)
    }
  }, [apiUrl, form])

  const pct = step >= 5 ? 100 : step * 25
  const STEP_TITLES = ['', '기종 선택', '변경 시기', '통신사', '정보 입력']

  const logoMap: Record<string, string | undefined> = { SKT: sktLogo, KT: ktLogo, 'LGU+': lguLogo }

  return (
    <div style={{ minHeight: '100svh', width: '100%', backgroundColor: C.bg, display: 'flex', justifyContent: 'center', fontFamily: FONT, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ width: '100%', maxWidth: '440px', minWidth: '320px', backgroundColor: C.white, minHeight: '100svh', display: 'flex', flexDirection: 'column', boxShadow: '0 0 0 1px rgba(0,0,0,0.04)' }}>

        {/* 헤더 */}
        {step < 5 && (
          <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: C.white }}>
            <div style={{ height: '48px', display: 'flex', alignItems: 'center', padding: '0 4px' }}>
              <button onClick={goBack} style={iconBtn} aria-label="뒤로가기">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19l-7-7 7-7" stroke={C.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '15px', fontWeight: 600, color: C.textPrimary, letterSpacing: -0.3 }}>
                {STEP_TITLES[step] || '빠른 견적'}
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontSize: '12px', color: C.textTertiary, letterSpacing: -0.2, paddingRight: '4px', fontVariantNumeric: 'tabular-nums' }}>
                {step}/4
              </div>
            </div>
            <div style={{ height: '2px', backgroundColor: C.borderLight }}>
              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: accent, transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>
        )}

        {/* 바디 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: step === 5 ? '0' : '28px 20px 100px' }}>
          {step === 1 && <StepPhone form={form} accent={accent} images={images} onSelect={selectPhone} activeTab={activeTab} setActiveTab={setActiveTab} />}
          {step === 2 && <StepTimeline form={form} accent={accent} onSelect={selectTimeline} />}
          {step === 3 && <StepCarrier form={form} accent={accent} onSelect={selectCarrier} logoMap={logoMap} />}
          {step === 4 && <StepInfo form={form} setForm={setForm} accent={accent} />}
          {step === 5 && <StepDone accent={accent} />}
        </div>

        {/* 토스트 */}
        {toast && (
          <div style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', backgroundColor: C.textPrimary, color: C.white, padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, fontFamily: FONT, zIndex: 100, letterSpacing: -0.2, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', maxWidth: '340px', textAlign: 'center' }}>
            {toast}
          </div>
        )}

        {/* 하단 — steps 1~3: 안내 문구 / step 4: 제출 버튼 */}
        {step < 5 && (
          <div style={{ position: 'sticky', bottom: 0, backgroundColor: C.white, borderTop: `1px solid ${C.borderLight}`, padding: '12px 20px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            {step < 4 ? (
              <div style={{ textAlign: 'center', fontSize: '13px', color: C.textTertiary, letterSpacing: -0.2 }}>
                선택하면 자동으로 다음 단계로 이동해요
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ width: '100%', height: '54px', borderRadius: '16px', border: 'none', backgroundColor: canSubmit ? accent : C.surface, color: canSubmit ? C.white : C.textDisabled, fontFamily: FONT, fontSize: '16px', fontWeight: 700, letterSpacing: -0.2, cursor: canSubmit ? 'pointer' : 'default', transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)' }}
              >
                {submitting ? '전송 중...' : '상담 신청하기'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step 1: 기종 선택 ────────────────────────────────────────────────────────

function StepPhone({
  form, accent, images, onSelect, activeTab, setActiveTab,
}: {
  form: FormData
  accent: string
  images: Record<string, string>
  onSelect: (m: PhoneModel) => void
  activeTab: 'samsung' | 'apple'
  setActiveTab: (t: 'samsung' | 'apple') => void
}) {
  const series = activeTab === 'samsung' ? SAMSUNG_SERIES : APPLE_SERIES

  return (
    <div>
      <h2 style={h2Style}>어떤 기종이{'\n'}궁금하세요?</h2>
      <p style={descStyle}>탭하면 바로 다음으로 이동해요</p>

      {/* 브랜드 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '20px', borderRadius: '12px', backgroundColor: C.surface, padding: '3px' }}>
        {(['samsung', 'apple'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ flex: 1, height: '34px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === tab ? C.white : 'transparent', color: activeTab === tab ? C.textPrimary : C.textTertiary, fontFamily: FONT, fontSize: '14px', fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.10)' : 'none', transition: 'all 200ms ease', letterSpacing: -0.2 }}
          >
            {tab === 'samsung' ? 'Samsung' : 'Apple'}
          </button>
        ))}
      </div>

      {/* 시리즈 + 모델 그리드 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {series.map(s => (
          <div key={s.key}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: C.textTertiary, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: '10px', fontFamily: FONT }}>
              {s.label}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '8px' }}>
              {s.models.map(m => {
                const sel = form.selectedPhone === m.modelCode
                const imgUrl = images[m.modelCode]
                return (
                  <button
                    key={m.modelCode}
                    onClick={() => onSelect(m)}
                    style={{ padding: '12px 6px 10px', borderRadius: '14px', border: sel ? `2px solid ${accent}` : `1.5px solid ${C.border}`, backgroundColor: sel ? C.blueBg : C.white, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', fontFamily: FONT, outline: 'none', opacity: m.isLegacy ? 0.55 : 1, transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)' }}
                  >
                    {sel && (
                      <div style={{ position: 'absolute', top: '6px', right: '6px' }}>
                        <CheckCircle size={16} color={accent} />
                      </div>
                    )}
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={m.name} style={{ width: '48px', height: '48px', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <PhoneIcon legacy={m.isLegacy} />
                      )}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: sel ? 700 : 500, color: sel ? accent : C.textSecondary, letterSpacing: -0.1, textAlign: 'center', lineHeight: 1.3, wordBreak: 'keep-all', transition: 'color 150ms ease' }}>
                      {m.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: 변경 시기 ────────────────────────────────────────────────────────

function StepTimeline({
  form, accent, onSelect,
}: {
  form: FormData
  accent: string
  onSelect: (key: string) => void
}) {
  return (
    <div>
      <h2 style={h2Style}>휴대폰을 언제{'\n'}바꾸실 예정인가요?</h2>
      <p style={descStyle}>상담 시기를 맞춰드릴게요</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {TIMELINE_OPTIONS.map(opt => {
          const active = form.timeline === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              style={{ height: '56px', borderRadius: '14px', border: active ? `2px solid ${accent}` : `1.5px solid ${C.border}`, backgroundColor: active ? C.blueBg : C.white, fontFamily: FONT, fontSize: '15px', fontWeight: active ? 600 : 400, color: C.textPrimary, letterSpacing: -0.3, textAlign: 'left', padding: '0 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)', outline: 'none' }}
            >
              <Radio checked={active} accent={accent} />
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {TIMELINE_ICONS[opt.key]}
              </span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: 통신사 ───────────────────────────────────────────────────────────

const CARRIER_KEYS = ['SKT', 'KT', 'LGU+', '알뜰폰'] as const

function StepCarrier({
  form, accent, onSelect, logoMap,
}: {
  form: FormData
  accent: string
  onSelect: (key: string) => void
  logoMap: Record<string, string | undefined>
}) {
  return (
    <div>
      <h2 style={h2Style}>현재 어떤 통신사를{'\n'}이용 중이신가요?</h2>
      <p style={descStyle}>맞춤 혜택을 안내해드릴게요</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {CARRIER_KEYS.map(key => {
          const active  = form.carrier === key
          const logoSrc = logoMap[key]
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{ height: '96px', borderRadius: '16px', border: active ? `2px solid ${accent}` : `1.5px solid ${C.border}`, backgroundColor: active ? C.blueBg : C.white, fontFamily: FONT, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)', outline: 'none', position: 'relative' }}
            >
              {active && (
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <CheckCircle size={16} color={accent} />
                </div>
              )}

              {/* Framer에서 등록한 이미지 or 텍스트 fallback */}
              {logoSrc ? (
                <img src={logoSrc} alt={key} style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: active ? accent : C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: key === '알뜰폰' ? '10px' : '12px', fontWeight: 800, color: active ? C.white : C.textTertiary, fontFamily: FONT, letterSpacing: -0.5, transition: 'all 200ms ease' }}>
                  {key === '알뜰폰' ? '알뜰' : key.replace('+', '')}
                </div>
              )}

              <span style={{ fontSize: '15px', fontWeight: active ? 700 : 500, color: active ? accent : C.textPrimary, letterSpacing: -0.3, transition: 'color 150ms ease' }}>
                {key}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 4: 정보 입력 ────────────────────────────────────────────────────────

function StepInfo({
  form, setForm, accent,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  accent: string
}) {
  const [agreeOpen, setAgreeOpen] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ ...h2Style, marginBottom: 0 }}>마지막으로{'\n'}정보를 입력해주세요</h2>
        <div style={{ backgroundColor: C.greenBg, color: C.green, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, fontFamily: FONT, letterSpacing: -0.16, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 4.5V3.75A2.25 2.25 0 006.75 1.5h-1.5A2.25 2.25 0 003 3.75V4.5m-.75 0h7.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          안심보안
        </div>
      </div>

      {/* 이전 단계 선택 요약 칩 */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {form.selectedPhoneName && (
          <div style={summaryChip}>{form.selectedPhoneName}</div>
        )}
        {form.timeline && (
          <div style={summaryChip}>{TIMELINE_OPTIONS.find(t => t.key === form.timeline)?.label ?? form.timeline}</div>
        )}
        {form.carrier && (
          <div style={summaryChip}>{form.carrier}</div>
        )}
      </div>

      {/* 이름 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>이름</label>
        <input type="text" placeholder="홍길동" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.slice(0, 20) }))} onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)} style={{ ...fieldStyle, borderBottomColor: focusField === 'name' ? accent : C.border }} />
      </div>

      {/* 전화번호 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>전화번호</label>
        <input type="tel" inputMode="numeric" placeholder="010-0000-0000" value={formatPhone(form.phone)} onChange={e => setForm(f => ({ ...f, phone: sanitizeDigits(e.target.value, 11) }))} onFocus={() => setFocusField('phone')} onBlur={() => setFocusField(null)} style={{ ...fieldStyle, borderBottomColor: focusField === 'phone' ? accent : C.border }} />
      </div>

      {/* 생년월일 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>생년월일</label>
        <input type="text" inputMode="numeric" placeholder="YYMMDD (6자리)" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: sanitizeDigits(e.target.value, 6) }))} onFocus={() => setFocusField('birthday')} onBlur={() => setFocusField(null)} style={{ ...fieldStyle, borderBottomColor: focusField === 'birthday' ? accent : C.border }} />
      </div>

      {/* 개인정보 동의 */}
      <div style={{ padding: '16px', backgroundColor: C.surface, borderRadius: '14px' }}>
        <div onClick={() => setForm(f => ({ ...f, agree: !f.agree }))} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} role="checkbox" aria-checked={form.agree}>
          <Checkbox checked={form.agree} accent={accent} />
          <span style={{ flex: 1, fontFamily: FONT, fontSize: '14px', color: C.textPrimary, letterSpacing: -0.24 }}>
            개인정보 수집·이용 동의
            <span style={{ color: C.red, fontWeight: 600, marginLeft: '4px' }}>(필수)</span>
          </span>
          <button onClick={e => { e.stopPropagation(); setAgreeOpen(v => !v) }} style={{ ...iconBtn, padding: '4px' }} aria-label={agreeOpen ? '접기' : '펼치기'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: agreeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
              <path d="M4 6L8 10L12 6" stroke={C.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {agreeOpen && (
          <div style={{ marginTop: '12px', padding: '14px', backgroundColor: C.white, borderRadius: '10px', fontFamily: FONT, fontSize: '12px', color: C.textSecondary, letterSpacing: -0.16, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: C.textPrimary }}>수집 항목</div>
            <div>이름, 전화번호, 생년월일</div>
            <div style={{ fontWeight: 600, marginTop: '10px', marginBottom: '4px', color: C.textPrimary }}>수집 목적</div>
            <div>KT 요금제·기기 상담 연락 및 계약 진행</div>
            <div style={{ fontWeight: 600, marginTop: '10px', marginBottom: '4px', color: C.textPrimary }}>보관 기간</div>
            <div>상담 완료 후 6개월 또는 이용자 철회 요청 시 즉시 파기</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step 5: 완료 ─────────────────────────────────────────────────────────────

function StepDone({ accent }: { accent: string }) {
  const goHome = useCallback(() => {
    if (typeof window !== 'undefined') window.location.href = '/'
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', textAlign: 'center', padding: '0 24px' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: C.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M10 20L17 27L30 14" stroke={accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: FONT, fontSize: '24px', fontWeight: 700, color: C.textPrimary, letterSpacing: -0.5, margin: '0 0 8px' }}>
        상담 신청이 접수됐어요
      </h2>
      <p style={{ fontFamily: FONT, fontSize: '15px', color: C.textSecondary, letterSpacing: -0.3, lineHeight: 1.6, margin: '0 0 40px', maxWidth: '260px' }}>
        영업일 기준 1일 이내에{'\n'}전화로 연락드릴게요
      </p>
      <button onClick={goHome} style={{ width: '100%', maxWidth: '280px', height: '54px', borderRadius: '16px', border: 'none', backgroundColor: accent, color: C.white, fontFamily: FONT, fontSize: '16px', fontWeight: 700, letterSpacing: -0.2, cursor: 'pointer' }}>
        홈으로 돌아가기
      </button>
    </div>
  )
}

// ─── UI 컴포넌트 ──────────────────────────────────────────────────────────────

function CheckCircle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill={color}/>
      <path d="M6 10.2L8.8 13L14 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Radio({ checked, accent }: { checked: boolean; accent: string }) {
  return (
    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${checked ? accent : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 200ms ease' }}>
      {checked && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: accent }} />}
    </div>
  )
}

function Checkbox({ checked, accent }: { checked: boolean; accent: string }) {
  return (
    <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: checked ? 'none' : `2px solid ${C.border}`, backgroundColor: checked ? accent : C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 200ms ease' }}>
      {checked && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7L6 10L11 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

function PhoneIcon({ legacy }: { legacy?: boolean }) {
  const color = legacy ? C.textDisabled : C.textTertiary
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"/>
      <circle cx="12" cy="18" r="1" fill={color} stroke="none"/>
    </svg>
  )
}

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }

const h2Style: React.CSSProperties = { fontFamily: FONT, fontSize: '24px', fontWeight: 700, color: C.textPrimary, letterSpacing: -0.5, margin: 0, marginBottom: '8px', lineHeight: 1.35, wordBreak: 'keep-all', whiteSpace: 'pre-line' }

const descStyle: React.CSSProperties = { fontFamily: FONT, fontSize: '15px', color: C.textTertiary, letterSpacing: -0.3, margin: 0, marginBottom: '24px', lineHeight: 1.5 }

const labelStyle: React.CSSProperties = { display: 'block', fontFamily: FONT, fontSize: '13px', fontWeight: 500, color: C.textTertiary, letterSpacing: -0.2, marginBottom: '8px' }

const fieldStyle: React.CSSProperties = { width: '100%', height: '48px', border: 'none', borderBottom: `2px solid ${C.border}`, backgroundColor: 'transparent', fontFamily: FONT, fontSize: '17px', fontWeight: 500, color: C.textPrimary, letterSpacing: -0.34, outline: 'none', padding: '0 2px', transition: 'border-color 200ms ease' }

const summaryChip: React.CSSProperties = { backgroundColor: C.blueBg, color: C.blue, padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, fontFamily: FONT, letterSpacing: -0.16, whiteSpace: 'nowrap' }

// ─── Property Controls ────────────────────────────────────────────────────────

addPropertyControls(QuickQuoteFlow, {
  apiUrl:       { type: ControlType.String, title: 'API URL',       defaultValue: 'https://kt-market-puce.vercel.app' },
  primaryColor: { type: ControlType.Color,  title: 'Primary Color', defaultValue: '#3182F6' },
  sktLogo:      { type: ControlType.Image,  title: 'SKT 로고 이미지' },
  ktLogo:       { type: ControlType.Image,  title: 'KT 로고 이미지' },
  lguLogo:      { type: ControlType.Image,  title: 'LGU+ 로고 이미지' },
})
