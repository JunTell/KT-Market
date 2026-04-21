// framer/home/QuickQuoteFlow.tsx
// moyoplan.com/phone-deal-alert 디자인 참조
import { addPropertyControls, ControlType } from 'framer'
import { useCallback, useEffect, useMemo, useState } from 'react'

const FONT = '"Pretendard Variable", "Pretendard", -apple-system, sans-serif'

// moyoplan 톤 기반 색상 시스템
const C = {
  white: '#FFFFFF',
  bg: '#FAFAFA',
  surface: '#F5F5F7',
  surfaceHover: '#EDEDF0',
  border: '#E8E8EC',
  borderLight: '#F0F0F3',
  textPrimary: '#1A1A1A',
  textSecondary: '#505056',
  textTertiary: '#8E8E93',
  textDisabled: '#AEAEB2',
  // 브랜드 블루
  blue: '#3182F6',
  blueBg: '#EBF4FF',
  blueBorder: '#3182F6',
  blueHover: '#1B6AE8',
  // 시맨틱
  red: '#F04452',
  green: '#00B386',
  greenBg: '#E8FAF5',
} as const

// ─── 모요 기준 기종 데이터 ───

interface PhoneModel {
  id: string
  name: string
  image?: string
  isLegacy?: boolean
}

interface Series {
  key: string
  label: string
  models: PhoneModel[]
}

const PHONE_SERIES: Series[] = [
  {
    key: 'galaxy-s',
    label: 'Galaxy S 시리즈',
    models: [
      { id: 'galaxy-s26', name: 'Galaxy S26' },
      { id: 'galaxy-s25', name: 'Galaxy S25' },
      { id: 'galaxy-s24', name: 'Galaxy S24 이하', isLegacy: true },
    ],
  },
  {
    key: 'galaxy-z-flip',
    label: 'Galaxy Z Flip 시리즈',
    models: [
      { id: 'z-flip7', name: 'Z Flip7' },
      { id: 'z-flip6', name: 'Z Flip6' },
      { id: 'z-flip5', name: 'Z Flip5 이하', isLegacy: true },
    ],
  },
  {
    key: 'galaxy-z-fold',
    label: 'Galaxy Z Fold 시리즈',
    models: [
      { id: 'z-fold7', name: 'Z Fold7' },
      { id: 'z-fold6', name: 'Z Fold6' },
      { id: 'z-fold5', name: 'Z Fold5 이하', isLegacy: true },
    ],
  },
  {
    key: 'galaxy-a',
    label: 'Galaxy A 시리즈',
    models: [
      { id: 'galaxy-a', name: 'Galaxy A' },
    ],
  },
  {
    key: 'iphone',
    label: 'iPhone 시리즈',
    models: [
      { id: 'iphone-17', name: 'iPhone 17' },
      { id: 'iphone-air', name: 'iPhone Air' },
      { id: 'iphone-16', name: 'iPhone 16 이하', isLegacy: true },
    ],
  },
]

const TIMELINE_OPTIONS = [
  { key: '1month', label: '당장 1개월 안에', emoji: '🔥' },
  { key: '2-3month', label: '2~3개월 안에', emoji: '📅' },
  { key: '6month', label: '6개월 안에', emoji: '🗓' },
  { key: 'after6month', label: '6개월 이후', emoji: '⏳' },
  { key: 'after1year', label: '1년 이후', emoji: '📆' },
  { key: 'not-yet', label: '아직 생각 없어요', emoji: '🤔' },
] as const

const CARRIER_OPTIONS = [
  { key: 'SKT', label: 'SKT', color: '#E4002B' },
  { key: 'KT', label: 'KT', color: '#ED1C24' },
  { key: 'LGU+', label: 'LGU+', color: '#E6007E' },
  { key: 'budget', label: '알뜰폰', color: '#8E8E93' },
] as const

// ─── 유틸 ───

function formatPhone(digits: string): string {
  const n = digits.replace(/\D/g, '').slice(0, 11)
  if (n.length < 4) return n
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`
}

function sanitizeDigits(v: string, max: number): string {
  return v.replace(/\D/g, '').slice(0, max)
}

// ─── 타입 ───

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  selectedPhone: string
  selectedPhoneName: string
  timeline: string
  carrier: string
  name: string
  phone: string
  birthday: string
  agree: boolean
}

const INITIAL_FORM: FormData = {
  selectedPhone: '',
  selectedPhoneName: '',
  timeline: '',
  carrier: '',
  name: '',
  phone: '',
  birthday: '',
  agree: true,
}

// ─── 메인 ───

interface Props {
  apiUrl?: string
  primaryColor?: string
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function QuickQuoteFlow({
  apiUrl = 'https://kt-market-puce.vercel.app',
  primaryColor,
}: Props) {
  const accent = primaryColor || C.blue

  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const goBack = useCallback(() => {
    if (step === 1) {
      if (typeof window !== 'undefined') window.history.back()
    } else {
      setStep((s) => (s - 1) as Step)
    }
  }, [step])

  const canNext = useMemo(() => {
    if (step === 1) return !!form.selectedPhone
    if (step === 2) return !!form.timeline
    if (step === 3) return !!form.carrier
    if (step === 4) {
      const phoneOk = /^01[016789]\d{7,8}$/.test(form.phone)
      const birthOk = /^\d{6}$/.test(form.birthday)
      return form.name.trim().length >= 2 && phoneOk && birthOk && form.agree && !submitting
    }
    return false
  }, [step, form, submitting])

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

  const goNext = useCallback(() => {
    if (!canNext) return
    if (step === 4) void handleSubmit()
    else setStep((s) => (s + 1) as Step)
  }, [step, canNext, handleSubmit])

  const pct = step >= 5 ? 100 : step * 25

  const STEP_TITLES = ['', '기종 선택', '변경 시기', '통신사', '정보 입력']

  return (
    <div style={{
      minHeight: '100svh',
      width: '100%',
      backgroundColor: C.bg,
      display: 'flex',
      justifyContent: 'center',
      fontFamily: FONT,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        minWidth: '320px',
        backgroundColor: C.white,
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
      }}>
        {/* ── 헤더 ── */}
        {step < 5 && (
          <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: C.white }}>
            <div style={{
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 4px',
            }}>
              <button onClick={goBack} style={iconBtn} aria-label="뒤로가기">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19l-7-7 7-7" stroke={C.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '15px',
                fontWeight: 600,
                color: C.textPrimary,
                letterSpacing: -0.3,
              }}>
                {STEP_TITLES[step] || '빠른 견적'}
              </div>
              <div style={{ width: '40px' }} />
            </div>
            {/* 프로그레스 */}
            <div style={{ height: '2px', backgroundColor: C.borderLight }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: accent,
                transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>
        )}

        {/* ── 바디 ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: step === 5 ? '0' : '28px 20px 100px',
        }}>
          {step === 1 && <StepPhone form={form} setForm={setForm} accent={accent} />}
          {step === 2 && <StepTimeline form={form} setForm={setForm} accent={accent} />}
          {step === 3 && <StepCarrier form={form} setForm={setForm} accent={accent} />}
          {step === 4 && <StepInfo form={form} setForm={setForm} accent={accent} />}
          {step === 5 && <StepDone accent={accent} />}
        </div>

        {/* ── 토스트 ── */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: C.textPrimary,
            color: C.white,
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: FONT,
            zIndex: 100,
            letterSpacing: -0.2,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            maxWidth: '340px',
            textAlign: 'center',
          }}>
            {toast}
          </div>
        )}

        {/* ── 하단 CTA ── */}
        {step < 5 && (
          <div style={{
            position: 'sticky',
            bottom: 0,
            padding: '12px 20px',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            backgroundColor: C.white,
            borderTop: `1px solid ${C.borderLight}`,
          }}>
            <button
              onClick={goNext}
              disabled={!canNext}
              style={{
                width: '100%',
                height: '54px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: canNext ? accent : C.surface,
                color: canNext ? C.white : C.textDisabled,
                fontFamily: FONT,
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: -0.2,
                cursor: canNext ? 'pointer' : 'default',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {step === 4
                ? (submitting ? '전송 중...' : '상담 신청하기')
                : '선택 완료'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
}

// ─── Step 1: 기종 선택 ───

function StepPhone({
  form, setForm, accent,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  accent: string
}) {
  const [openSeries, setOpenSeries] = useState<Set<string>>(new Set(['galaxy-s']))

  const toggle = useCallback((key: string) => {
    setOpenSeries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const select = useCallback((m: PhoneModel) => {
    setForm((f) => ({ ...f, selectedPhone: m.id, selectedPhoneName: m.name }))
  }, [setForm])

  return (
    <div>
      <h2 style={h2Style}>관심있는 휴대폰을{'\n'}골라주세요</h2>
      <p style={descStyle}>상담받고 싶은 기종을 선택해주세요</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PHONE_SERIES.map((series) => {
          const isOpen = openSeries.has(series.key)
          const hasSelected = series.models.some((m) => m.id === form.selectedPhone)

          return (
            <div
              key={series.key}
              style={{
                borderRadius: '16px',
                border: `1.5px solid ${hasSelected ? accent : C.border}`,
                backgroundColor: C.white,
                overflow: 'hidden',
                transition: 'border-color 200ms ease',
              }}
            >
              {/* 시리즈 헤더 */}
              <button
                onClick={() => toggle(series.key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  backgroundColor: hasSelected ? C.blueBg : C.white,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  transition: 'background-color 200ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasSelected && (
                    <CheckCircle size={18} color={accent} />
                  )}
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: C.textPrimary,
                    letterSpacing: -0.3,
                  }}>
                    {series.label}
                  </span>
                </div>
                <svg
                  width="18" height="18" viewBox="0 0 18 18" fill="none"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0,
                  }}
                >
                  <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke={C.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* 모델 카드 */}
              {isOpen && (
                <div style={{
                  padding: '4px 14px 16px',
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}>
                  {series.models.map((model) => {
                    const sel = form.selectedPhone === model.id
                    return (
                      <button
                        key={model.id}
                        onClick={() => select(model)}
                        style={{
                          flexShrink: 0,
                          width: '108px',
                          padding: '14px 8px 12px',
                          borderRadius: '14px',
                          border: sel ? `2px solid ${accent}` : `1.5px solid ${C.border}`,
                          backgroundColor: sel ? C.blueBg : C.white,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          fontFamily: FONT,
                          outline: 'none',
                        }}
                      >
                        {/* 체크마크 */}
                        {sel && (
                          <div style={{
                            position: 'absolute', top: '7px', right: '7px',
                          }}>
                            <CheckCircle size={20} color={accent} />
                          </div>
                        )}

                        {/* 기종 이미지 영역 */}
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '14px',
                          backgroundColor: C.surface,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {model.image ? (
                            <img
                              src={model.image}
                              alt={model.name}
                              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                            />
                          ) : (
                            <PhoneIcon legacy={model.isLegacy} />
                          )}
                        </div>

                        {/* 이름 */}
                        <span style={{
                          fontSize: '13px',
                          fontWeight: sel ? 700 : 500,
                          color: sel ? accent : C.textSecondary,
                          letterSpacing: -0.2,
                          textAlign: 'center',
                          lineHeight: 1.3,
                          wordBreak: 'keep-all',
                          transition: 'color 150ms ease',
                        }}>
                          {model.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 2: 변경 시기 ───

function StepTimeline({
  form, setForm, accent,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  accent: string
}) {
  return (
    <div>
      <h2 style={h2Style}>휴대폰을 언제{'\n'}바꾸실 예정이신가요?</h2>
      <p style={descStyle}>상담 시기를 맞춰드릴게요</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {TIMELINE_OPTIONS.map((opt) => {
          const active = form.timeline === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => setForm((f) => ({ ...f, timeline: opt.key }))}
              style={{
                height: '56px',
                borderRadius: '14px',
                border: active ? `2px solid ${accent}` : `1.5px solid ${C.border}`,
                backgroundColor: active ? C.blueBg : C.white,
                fontFamily: FONT,
                fontSize: '15px',
                fontWeight: active ? 600 : 400,
                color: C.textPrimary,
                letterSpacing: -0.3,
                textAlign: 'left',
                padding: '0 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
              }}
            >
              <Radio checked={active} accent={accent} />
              <span style={{ fontSize: '17px', lineHeight: 1 }}>{opt.emoji}</span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: 통신사 ───

function StepCarrier({
  form, setForm, accent,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  accent: string
}) {
  return (
    <div>
      <h2 style={h2Style}>현재 어떤 통신사를{'\n'}이용 중이신가요?</h2>
      <p style={descStyle}>맞춤 혜택을 안내해드릴게요</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {CARRIER_OPTIONS.map((opt) => {
          const active = form.carrier === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => setForm((f) => ({ ...f, carrier: opt.key }))}
              style={{
                height: '88px',
                borderRadius: '16px',
                border: active ? `2px solid ${accent}` : `1.5px solid ${C.border}`,
                backgroundColor: active ? C.blueBg : C.white,
                fontFamily: FONT,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                position: 'relative',
              }}
            >
              {active && (
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <CheckCircle size={18} color={accent} />
                </div>
              )}
              {/* 통신사 로고 원 */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: active ? accent : C.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                color: active ? C.white : C.textTertiary,
                fontFamily: FONT,
                letterSpacing: -0.5,
                transition: 'all 200ms ease',
              }}>
                {opt.key === 'budget' ? '알뜰' : opt.key.replace('+', '')}
              </div>
              <span style={{
                fontSize: '15px',
                fontWeight: active ? 700 : 500,
                color: active ? accent : C.textPrimary,
                letterSpacing: -0.3,
                transition: 'color 150ms ease',
              }}>
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 4: 정보 입력 ───

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h2 style={{ ...h2Style, marginBottom: 0 }}>
          상담을 위해{'\n'}정보를 작성해주세요
        </h2>
        <div style={{
          backgroundColor: C.greenBg,
          color: C.green,
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: FONT,
          letterSpacing: -0.16,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 4.5V3.75A2.25 2.25 0 006.75 1.5h-1.5A2.25 2.25 0 003 3.75V4.5m-.75 0h7.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          안심보안
        </div>
      </div>

      {/* 이름 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>이름</label>
        <input
          type="text"
          placeholder="홍길동"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.slice(0, 20) }))}
          onFocus={() => setFocusField('name')}
          onBlur={() => setFocusField(null)}
          style={{
            ...fieldStyle,
            borderBottomColor: focusField === 'name' ? accent : C.border,
          }}
        />
      </div>

      {/* 전화번호 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>전화번호</label>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="010-0000-0000"
          value={formatPhone(form.phone)}
          onChange={(e) => setForm((f) => ({ ...f, phone: sanitizeDigits(e.target.value, 11) }))}
          onFocus={() => setFocusField('phone')}
          onBlur={() => setFocusField(null)}
          style={{
            ...fieldStyle,
            borderBottomColor: focusField === 'phone' ? accent : C.border,
          }}
        />
      </div>

      {/* 생년월일 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>생년월일</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="YYMMDD (6자리)"
          value={form.birthday}
          onChange={(e) => setForm((f) => ({ ...f, birthday: sanitizeDigits(e.target.value, 6) }))}
          onFocus={() => setFocusField('birthday')}
          onBlur={() => setFocusField(null)}
          style={{
            ...fieldStyle,
            borderBottomColor: focusField === 'birthday' ? accent : C.border,
          }}
        />
      </div>

      {/* 개인정보 동의 */}
      <div style={{
        padding: '16px',
        backgroundColor: C.surface,
        borderRadius: '14px',
      }}>
        <div
          onClick={() => setForm((f) => ({ ...f, agree: !f.agree }))}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          role="checkbox"
          aria-checked={form.agree}
        >
          <Checkbox checked={form.agree} accent={accent} />
          <span style={{
            flex: 1,
            fontFamily: FONT,
            fontSize: '14px',
            color: C.textPrimary,
            letterSpacing: -0.24,
          }}>
            개인정보 수집·이용 동의
            <span style={{ color: C.red, fontWeight: 600, marginLeft: '4px' }}>(필수)</span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setAgreeOpen((v) => !v) }}
            style={{ ...iconBtn, padding: '4px' }}
            aria-label={agreeOpen ? '접기' : '펼치기'}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{
                transform: agreeOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
            >
              <path d="M4 6L8 10L12 6" stroke={C.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {agreeOpen && (
          <div style={{
            marginTop: '12px',
            padding: '14px',
            backgroundColor: C.white,
            borderRadius: '10px',
            fontFamily: FONT,
            fontSize: '12px',
            color: C.textSecondary,
            letterSpacing: -0.16,
            lineHeight: 1.7,
          }}>
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

// ─── Step 5: 완료 ───

function StepDone({ accent }: { accent: string }) {
  const goHome = useCallback(() => {
    if (typeof window !== 'undefined') window.location.href = '/'
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      textAlign: 'center',
      padding: '0 24px',
    }}>
      {/* 성공 아이콘 */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: C.blueBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M10 20L17 27L30 14" stroke={accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 style={{
        fontFamily: FONT,
        fontSize: '24px',
        fontWeight: 700,
        color: C.textPrimary,
        letterSpacing: -0.5,
        margin: 0,
        marginBottom: '8px',
      }}>
        상담 신청이 접수됐어요
      </h2>
      <p style={{
        fontFamily: FONT,
        fontSize: '15px',
        color: C.textSecondary,
        letterSpacing: -0.3,
        lineHeight: 1.6,
        margin: 0,
        marginBottom: '40px',
        maxWidth: '260px',
      }}>
        영업일 기준 1일 이내에{'\n'}전화로 연락드릴게요
      </p>

      <button
        onClick={goHome}
        style={{
          width: '100%',
          maxWidth: '280px',
          height: '54px',
          borderRadius: '16px',
          border: 'none',
          backgroundColor: accent,
          color: C.white,
          fontFamily: FONT,
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: -0.2,
          cursor: 'pointer',
        }}
      >홈으로 돌아가기</button>
    </div>
  )
}

// ─── UI 컴포넌트 ───

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
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: `2px solid ${checked ? accent : C.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'border-color 200ms ease',
    }}>
      {checked && (
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: accent,
        }} />
      )}
    </div>
  )
}

function Checkbox({ checked, accent }: { checked: boolean; accent: string }) {
  return (
    <div style={{
      width: '22px',
      height: '22px',
      borderRadius: '6px',
      border: checked ? 'none' : `2px solid ${C.border}`,
      backgroundColor: checked ? accent : C.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 200ms ease',
    }}>
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

// ─── 공통 스타일 ───

const h2Style: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: '24px',
  fontWeight: 700,
  color: C.textPrimary,
  letterSpacing: -0.5,
  margin: 0,
  marginBottom: '8px',
  lineHeight: 1.35,
  wordBreak: 'keep-all',
  whiteSpace: 'pre-line',
}

const descStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: '15px',
  color: C.textTertiary,
  letterSpacing: -0.3,
  margin: 0,
  marginBottom: '28px',
  lineHeight: 1.5,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: FONT,
  fontSize: '13px',
  fontWeight: 500,
  color: C.textTertiary,
  letterSpacing: -0.2,
  marginBottom: '8px',
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  border: 'none',
  borderBottom: `2px solid ${C.border}`,
  backgroundColor: 'transparent',
  fontFamily: FONT,
  fontSize: '17px',
  fontWeight: 500,
  color: C.textPrimary,
  letterSpacing: -0.34,
  outline: 'none',
  padding: '0 2px',
  transition: 'border-color 200ms ease',
}

addPropertyControls(QuickQuoteFlow, {
  apiUrl: { type: ControlType.String, title: 'API URL', defaultValue: 'https://kt-market-puce.vercel.app' },
  primaryColor: { type: ControlType.Color, title: 'Primary Color', defaultValue: '#3182F6' },
})
