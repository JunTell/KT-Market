// framer/home/QuickQuoteFlow.tsx
import { addPropertyControls, ControlType } from 'framer'
import { useCallback, useEffect, useMemo, useState } from 'react'

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

// 색상 토큰
const COLORS = {
  bg: '#FFFFFF',
  cream: '#FAF9F5',
  cardCream: '#F5F1EB',
  cardSelected: '#EFF6FF',
  primary: '#0066FF',
  primarySubtle: '#E6F0FF',
  textPrimary: '#24292E',
  textSecondary: '#3F4750',
  textMuted: '#868E96',
  border: '#E5E7EB',
  success: '#22C55E',
  error: '#EF4444',
  overlay: 'rgba(0,0,0,0.4)',
} as const

// 전화번호 자동 하이픈 포맷팅 (숫자만 저장)
function formatPhone(digits: string): string {
  const n = digits.replace(/\D/g, '').slice(0, 11)
  if (n.length < 4) return n
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`
}

function sanitizeDigits(v: string, max: number): string {
  return v.replace(/\D/g, '').slice(0, max)
}

type Step = 1 | 2 | 3 | 4 | 5
type Register = '번호이동' | '기기변경'

interface Selection {
  model: string
  petName: string
  device: string
  capacity: string
  capacities: string[]  // 선택한 기종의 전체 용량 옵션 (Step 2에서 사용)
  register: Register | ''
}

interface FormState {
  name: string
  phone: string       // 하이픈 없는 숫자만 (e.g., "01012345678")
  birthday: string    // YYMMDD 6자리
  agree: boolean
}

interface Device {
  model: string
  pet_name: string
  thumbnail: string | null
  company: string
  category?: string
  capacities?: string[]
  colors_en?: string[]
  images?: Record<string, string[]>
  capacity?: string
  is_available?: boolean
  category_kr?: string
}

type Company = 'samsung' | 'apple' | 'kidsphone'

// PhoneCatalogPage와 동일 패턴 — 이미지 URL 구성
const S3_BASE = 'https://juntell.s3.ap-northeast-2.amazonaws.com/phone'
function buildDeviceImageUrl(d: Device): string | null {
  const colorKey = d.thumbnail || d.colors_en?.[0] || 'black'
  const imageList = d.images?.[colorKey] ?? []
  const imageKey = imageList[0]
  if (!d.category || !imageKey) return null
  return `${S3_BASE}/${d.category}/${colorKey}/${imageKey}.png`
}

// PhoneCatalogPage와 동일 로직 — 최저 용량 1개만 대표 카드로 노출
function filterLowestCapacity(list: Device[]): Device[] {
  return list.filter(
    (d) =>
      d.capacities && d.capacities.length > 0 && d.capacities[0] === d.capacity
  )
}

// pet_name에서 용량 키워드 제거 ("iPhone 17 256GB" → "iPhone 17")
function stripStorage(name: string): string {
  return (name || '')
    .replace(/\d+\s?(GB|TB)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

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
  primaryColor = '#0066FF',
}: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection>({
    model: '', petName: '', device: '', capacity: '', capacities: [], register: '',
  })
  const [form, setForm] = useState<FormState>({
    name: '', phone: '', birthday: '', agree: true,
  })

  // 전역 이벤트로 열기
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('ktmarket:open-quick-quote', handler)
    return () => window.removeEventListener('ktmarket:open-quick-quote', handler)
  }, [])

  // body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // toast auto-dismiss
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const reset = useCallback(() => {
    setStep(1)
    setShowConfirmModal(false)
    setSelection({ model: '', petName: '', device: '', capacity: '', capacities: [], register: '' })
    setForm({ name: '', phone: '', birthday: '', agree: true })
    setSubmitting(false)
    setToast(null)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    // 애니메이션 후 상태 초기화 (딜레이로 깜빡임 방지)
    setTimeout(reset, 200)
  }, [reset])

  // ESC 키로 닫기 (배경 탭과 동일 동작)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const goBack = useCallback(() => {
    if (step === 1) close()
    else if (step === 4) setStep(3)   // 확인 모달 이후 step 4에서 뒤로 → step 3
    else setStep((step - 1) as Step)
  }, [step, close])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const res = await fetch(`${apiUrl}/api/consultations/quick-quote`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: selection.model,
          petName: selection.petName,
          device: selection.device,
          capacity: selection.capacity,
          register: selection.register,
          name: form.name.trim(),
          phone: form.phone,
          birthday: form.birthday,
        }),
      })
      clearTimeout(timeoutId)
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setToast(json.error ?? '잠시 후 다시 시도해주세요')
        setSubmitting(false)
        return
      }
      setStep(5)
      setSubmitting(false)
    } catch (err) {
      clearTimeout(timeoutId)
      const msg = (err as Error).name === 'AbortError' ? '네트워크가 불안정합니다' : '잠시 후 다시 시도해주세요'
      setToast(msg)
      setSubmitting(false)
    }
  }, [apiUrl, selection, form])

  const goNext = useCallback(() => {
    if (step === 1) {
      if (!selection.model) return
      if (selection.capacities.length === 0) {
        setSelection((s) => ({ ...s, capacity: '' }))
        setStep(3)   // 용량 없으면 바로 가입유형으로
      } else {
        setStep(2)
      }
    } else if (step === 2) {
      if (!selection.capacity) return
      setStep(3)
    } else if (step === 3) {
      if (!selection.register) return
      setShowConfirmModal(true)
    } else if (step === 4) {
      void handleSubmit()
    }
  }, [step, selection, handleSubmit])

  const handleConfirmed = useCallback(() => {
    setShowConfirmModal(false)
    setStep(4)
  }, [])

  const progressWidth = useMemo(() => {
    // 1..4 → 25/50/75/100, step 5(done)는 진행바 숨김
    if (step >= 5) return 100
    return step * 25
  }, [step])

  const primaryLabel = step === 4 ? '상담 신청하기' : '다음'
  const primaryDisabled = useMemo(() => {
    if (step === 1) return !selection.model
    if (step === 2) return !selection.capacity
    if (step === 3) return !selection.register
    if (step === 4) {
      const phoneOk = /^01[016789]\d{7,8}$/.test(form.phone)
      const birthOk = /^\d{6}$/.test(form.birthday)
      return !(form.name.trim().length >= 2 && phoneOk && birthOk && form.agree) || submitting
    }
    return false
  }, [step, selection, form, submitting])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: COLORS.overlay,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: FONT,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div
        style={{
          backgroundColor: COLORS.bg,
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          maxHeight: '100svh',
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {step !== 5 && (
          <>
            <Header onBack={goBack} onClose={close} />
            <ProgressBar width={progressWidth} color={primaryColor} />
          </>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 120px' }}>
          {step === 1 && <StepModel selection={selection} setSelection={setSelection} apiUrl={apiUrl} />}
          {step === 2 && <StepCapacity selection={selection} setSelection={setSelection} />}
          {step === 3 && <StepRegister selection={selection} setSelection={setSelection} />}
          {step === 4 && <StepForm form={form} setForm={setForm} />}
          {step === 5 && <StepDone onClose={close} />}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'absolute',
            top: '72px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: COLORS.error,
            color: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 10,
          }}>{toast}</div>
        )}

        {/* Footer */}
        {step !== 5 && (
          <Footer
            primaryLabel={primaryLabel}
            primaryDisabled={primaryDisabled}
            onPrimary={goNext}
            onBrowse={() => { window.location.href = '/phone' }}
            primaryColor={primaryColor}
            submitting={submitting}
          />
        )}

        {/* Confirmation modal */}
        {showConfirmModal && (
          <ConfirmModal
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleConfirmed}
            primaryColor={primaryColor}
          />
        )}
      </div>
    </div>
  )
}

function Header({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div style={{ height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: `1px solid ${COLORS.border}` }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', fontSize: '20px', color: COLORS.textPrimary }} aria-label="뒤로가기">‹</button>
      <div style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 600, color: COLORS.textPrimary, letterSpacing: -0.3 }}>빠른 견적</div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', fontSize: '20px', color: COLORS.textPrimary }} aria-label="닫기">×</button>
    </div>
  )
}

function ProgressBar({ width, color }: { width: number; color: string }) {
  return (
    <div style={{ height: '4px', backgroundColor: COLORS.primarySubtle, width: '100%' }}>
      <div style={{ height: '100%', width: `${width}%`, backgroundColor: color, transition: 'width 200ms ease' }} />
    </div>
  )
}

function Footer({ primaryLabel, primaryDisabled, onPrimary, onBrowse, primaryColor, submitting }: {
  primaryLabel: string
  primaryDisabled: boolean
  onPrimary: () => void
  onBrowse: () => void
  primaryColor: string
  submitting: boolean
}) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '16px 20px',
      backgroundColor: COLORS.bg,
      borderTop: `1px solid ${COLORS.border}`,
      display: 'flex',
      gap: '12px',
    }}>
      <button
        onClick={onBrowse}
        style={{
          flex: 1,
          height: '52px',
          borderRadius: '12px',
          backgroundColor: 'transparent',
          border: `1.5px solid ${COLORS.border}`,
          color: COLORS.textSecondary,
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: FONT,
          cursor: 'pointer',
          letterSpacing: -0.3,
        }}
      >일단 둘러볼게요</button>
      <button
        onClick={onPrimary}
        disabled={primaryDisabled}
        style={{
          flex: 1.4,
          height: '52px',
          borderRadius: '12px',
          backgroundColor: primaryDisabled ? '#E5E7EB' : primaryColor,
          border: 'none',
          color: primaryDisabled ? COLORS.textMuted : '#FFFFFF',
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: FONT,
          cursor: primaryDisabled ? 'not-allowed' : 'pointer',
          letterSpacing: 0.08,
        }}
      >{submitting ? '전송 중…' : primaryLabel}</button>
    </div>
  )
}

function StepModel({
  selection,
  setSelection,
  apiUrl,
}: {
  selection: Selection
  setSelection: React.Dispatch<React.SetStateAction<Selection>>
  apiUrl: string
}) {
  const [tab, setTab] = useState<Company>('samsung')
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`${apiUrl}/api/compare/devices`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: Device[] | { error: string }) => {
        if (Array.isArray(data)) setDevices(data)
        else setError(data.error)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError('기종 목록을 불러오지 못했어요')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [apiUrl])

  // PhoneCatalogPage와 동일: 최저 용량 1개 대표 카드만 노출
  const normalized = useMemo(() => filterLowestCapacity(devices), [devices])

  const filtered = useMemo(() => {
    if (tab === 'samsung') return normalized.filter((d) => d.company === 'samsung')
    if (tab === 'apple') return normalized.filter((d) => d.company === 'apple')
    return normalized.filter((d) => d.category === 'kidsphone')
  }, [normalized, tab])

  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, marginBottom: '20px', wordBreak: 'keep-all' }}>
        어떤 기종을 찾고 계신가요?
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: COLORS.cardCream, borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
        {(['samsung', 'apple', 'kidsphone'] as const).map((key) => {
          const active = tab === key
          const label = key === 'samsung' ? '갤럭시' : key === 'apple' ? '아이폰' : '키즈폰'
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: active ? COLORS.bg : 'transparent',
                color: active ? COLORS.primary : COLORS.textMuted,
                fontFamily: FONT,
                fontSize: '14px',
                fontWeight: active ? 700 : 500,
                letterSpacing: -0.24,
                cursor: 'pointer',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 150ms ease',
              }}
            >{label}</button>
          )
        })}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textMuted, fontSize: '14px' }}>불러오는 중…</div>}
      {error && <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.error, fontSize: '14px' }}>{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textMuted, fontSize: '14px' }}>
          {tab === 'kidsphone' ? '준비 중이에요' : '표시할 기종이 없어요'}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {filtered.map((d) => {
            const isSelected = selection.model === d.model
            const imgUrl = buildDeviceImageUrl(d)
            const displayName = stripStorage(d.pet_name)
            return (
              <button
                key={d.model}
                onClick={() => setSelection((s) => ({
                  ...s,
                  model: d.model,
                  petName: displayName,
                  device: 'smartphone',
                  capacities: d.capacities ?? [],
                  capacity: '',
                }))}
                style={{
                  border: isSelected ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                  backgroundColor: isSelected ? COLORS.cardSelected : COLORS.cardCream,
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}>
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={displayName}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '24px', color: COLORS.textMuted }}>📱</span>
                  )}
                </div>
                <div style={{ fontFamily: FONT, fontSize: '14px', fontWeight: 600, color: COLORS.textPrimary, letterSpacing: -0.24, textAlign: 'center' }}>
                  {displayName}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
function StepCapacity({
  selection,
  setSelection,
}: {
  selection: Selection
  setSelection: React.Dispatch<React.SetStateAction<Selection>>
}) {
  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, marginBottom: '20px', wordBreak: 'keep-all' }}>
        {selection.petName} 용량을 선택해주세요
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {selection.capacities.map((cap) => {
          const active = selection.capacity === cap
          return (
            <button
              key={cap}
              onClick={() => setSelection((s) => ({ ...s, capacity: cap }))}
              style={{
                height: '56px',
                borderRadius: '12px',
                border: active ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                backgroundColor: active ? COLORS.cardSelected : COLORS.cardCream,
                fontFamily: FONT,
                fontSize: '16px',
                fontWeight: active ? 700 : 500,
                color: COLORS.textPrimary,
                letterSpacing: -0.3,
                textAlign: 'left',
                padding: '0 20px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >{cap}</button>
          )
        })}
      </div>
    </div>
  )
}
function StepRegister({
  selection,
  setSelection,
}: {
  selection: Selection
  setSelection: React.Dispatch<React.SetStateAction<Selection>>
}) {
  const options: { key: Register; title: string; desc: string; mark: string }[] = [
    { key: '번호이동', title: '번호이동', desc: '다른 통신사에서\nKT로 이동', mark: 'KT' },
    { key: '기기변경', title: '기기변경', desc: 'KT 사용 중이며\n기기만 변경', mark: 'KT' },
  ]

  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, marginBottom: '8px', wordBreak: 'keep-all' }}>
        가입 유형을 선택해주세요
      </h2>
      <p style={{ fontFamily: FONT, fontSize: '14px', color: COLORS.textMuted, letterSpacing: -0.24, margin: 0, marginBottom: '24px' }}>
        현재 사용하고 있는 번호는 바뀌지 않아요
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {options.map((opt) => {
          const active = selection.register === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => setSelection((s) => ({ ...s, register: opt.key }))}
              style={{
                padding: '24px 16px',
                borderRadius: '14px',
                border: active ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                backgroundColor: active ? COLORS.cardSelected : COLORS.cardCream,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {/* KT 로고 플레이스홀더 (원형) */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.primary,
                fontFamily: FONT,
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: -0.36,
              }}>{opt.mark}</div>
              <div style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.3 }}>{opt.title}</div>
              <div style={{ fontFamily: FONT, fontSize: '13px', color: COLORS.textSecondary, letterSpacing: -0.24, lineHeight: 1.5, whiteSpace: 'pre-line', wordBreak: 'keep-all', textAlign: 'center' }}>
                {opt.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
function StepForm({
  form,
  setForm,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
}) {
  const [agreeExpanded, setAgreeExpanded] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, lineHeight: 1.3, wordBreak: 'keep-all' }}>
          정확한 상담을 위해{'\n'}정보를 작성해주세요
        </h2>
        <div style={{
          backgroundColor: '#ECFDF5',
          color: COLORS.success,
          padding: '6px 10px',
          borderRadius: '999px',
          fontFamily: FONT,
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: -0.16,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          whiteSpace: 'nowrap',
        }}>🔒 안심보안</div>
      </div>

      {/* 이름 */}
      <Field label="이름">
        <input
          type="text"
          placeholder="김유플"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.slice(0, 20) }))}
          style={inputStyle}
        />
      </Field>

      {/* 전화번호 */}
      <Field label="전화번호">
        <input
          type="tel"
          inputMode="numeric"
          placeholder="010-0000-0000"
          value={formatPhone(form.phone)}
          onChange={(e) => setForm((f) => ({ ...f, phone: sanitizeDigits(e.target.value, 11) }))}
          style={inputStyle}
        />
      </Field>

      {/* 생년월일 */}
      <Field label="생년월일">
        <input
          type="text"
          inputMode="numeric"
          placeholder="YYMMDD"
          value={form.birthday}
          onChange={(e) => setForm((f) => ({ ...f, birthday: sanitizeDigits(e.target.value, 6) }))}
          style={inputStyle}
        />
      </Field>

      {/* 개인정보 동의 */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: COLORS.cardCream, borderRadius: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => setForm((f) => ({ ...f, agree: e.target.checked }))}
            style={{ width: '20px', height: '20px', accentColor: COLORS.primary, cursor: 'pointer' }}
          />
          <span style={{ flex: 1, fontFamily: FONT, fontSize: '14px', color: COLORS.textPrimary, letterSpacing: -0.24 }}>
            개인정보수집 동의 <span style={{ color: COLORS.error, fontWeight: 700 }}>(필수)</span>
          </span>
          <button
            onClick={(e) => { e.preventDefault(); setAgreeExpanded((v) => !v) }}
            style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', fontSize: '14px' }}
            aria-label={agreeExpanded ? '접기' : '펼치기'}
          >{agreeExpanded ? '▲' : '▼'}</button>
        </label>
        {agreeExpanded && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: COLORS.bg, borderRadius: '8px', fontFamily: FONT, fontSize: '12px', color: COLORS.textSecondary, letterSpacing: -0.16, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, marginBottom: '6px', color: COLORS.textPrimary }}>수집 항목</div>
            <div>이름, 전화번호, 생년월일</div>
            <div style={{ fontWeight: 700, marginTop: '10px', marginBottom: '6px', color: COLORS.textPrimary }}>수집 목적</div>
            <div>KT 요금제·기기 상담 연락 및 계약 진행</div>
            <div style={{ fontWeight: 700, marginTop: '10px', marginBottom: '6px', color: COLORS.textPrimary }}>보관 기간</div>
            <div>상담 완료 후 6개월 또는 이용자 철회 요청 시 즉시 파기</div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontFamily: FONT, fontSize: '13px', color: COLORS.textMuted, letterSpacing: -0.24, marginBottom: '4px' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  border: 'none',
  borderBottom: `1px solid ${COLORS.border}`,
  backgroundColor: 'transparent',
  fontFamily: FONT,
  fontSize: '17px',
  color: COLORS.textPrimary,
  letterSpacing: -0.34,
  outline: 'none',
  padding: '0 4px',
}

function StepDone({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: COLORS.cardSelected,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        color: COLORS.primary,
        fontSize: '40px',
      }}>✓</div>
      <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, marginBottom: '12px', wordBreak: 'keep-all' }}>
        상담 신청이 접수됐어요
      </h2>
      <p style={{ fontFamily: FONT, fontSize: '15px', color: COLORS.textSecondary, letterSpacing: -0.3, lineHeight: 1.5, margin: 0, marginBottom: '40px', maxWidth: '300px', wordBreak: 'keep-all' }}>
        영업일 기준 1일 이내에 전화로 연락드릴게요
      </p>
      <button
        onClick={onClose}
        style={{
          width: '100%',
          maxWidth: '320px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: COLORS.primary,
          color: '#FFFFFF',
          border: 'none',
          fontFamily: FONT,
          fontSize: '15px',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: 0.08,
          cursor: 'pointer',
        }}
      >확인</button>
    </div>
  )
}
function ConfirmModal({
  onClose,
  onConfirm,
  primaryColor,
}: {
  onClose: () => void
  onConfirm: () => void
  primaryColor: string
}) {
  const items = [
    { num: 1, title: '상담 완료 전에는 기기가 발송되지 않습니다', bullets: ['상담을 통해 최종 확인을 거치기 전까지는 기기를 발송하지 않으니 안심하고 작성해 주세요.'] },
    { num: 2, title: '언제든 취소 가능하며, 정보는 안전하게 파기됩니다', bullets: [
      '상담 신청을 하시더라도 기기가 배정되기 전이라면 언제든지 부담 없이 신청을 취소할 수 있습니다.',
      '신청 취소 시, 작성해주신 신청서와 개인정보는 즉시 안전하게 파기됩니다.',
    ] },
    { num: 3, title: '결합 할인 및 위약금 확인 안내', bullets: [
      '홈페이지 금액은 결합 할인이 미반영된 기준입니다. 기기변경 시 기존 결합 및 복지 할인이 그대로 유지되어 안내된 금액보다 더 저렴하게 이용하실 수 있습니다.',
      '기기변경: 요금제 변경으로 기존 결합 유지가 어렵거나 위약금이 발생할 경우, 진행 전에 미리 안내해 드립니다.',
      '통신사 이동: 당사에서 기존 통신사의 위약금 조회가 어렵습니다. 반드시 현재 이용 중인 통신사에 위약금을 먼저 확인하신 후 진행해 주세요.',
    ] },
    { num: 4, title: '요금제 유지 기간 및 할인 조건', bullets: ['공시지원금 기준 최소 6개월 요금제 유지가 필요합니다. 조기 변경 시 일부 할인이 회수될 수 있어요.'] },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: COLORS.bg,
        borderRadius: '20px',
        width: '100%',
        maxWidth: '440px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontFamily: FONT, fontSize: '17px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.34 }}>신청 전 꼭 확인해주세요!</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: COLORS.textMuted, padding: '4px' }} aria-label="닫기">×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {items.map((it, idx) => (
            <div key={it.num} style={{ marginBottom: idx === items.length - 1 ? 0 : '20px', paddingBottom: idx === items.length - 1 ? 0 : '20px', borderBottom: idx === items.length - 1 ? 'none' : `1px dashed ${COLORS.border}` }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: primaryColor, color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT, fontSize: '13px', fontWeight: 700, flexShrink: 0,
                }}>{it.num}</div>
                <div style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.3, wordBreak: 'keep-all' }}>{it.title}</div>
              </div>
              <ul style={{ margin: 0, paddingLeft: '34px', listStyle: 'disc' }}>
                {it.bullets.map((b, i) => (
                  <li key={i} style={{ fontFamily: FONT, fontSize: '13px', color: COLORS.textSecondary, letterSpacing: -0.24, lineHeight: 1.6, marginBottom: '4px', wordBreak: 'keep-all' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${COLORS.border}` }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: primaryColor,
              color: '#FFFFFF',
              border: 'none',
              fontFamily: FONT,
              fontSize: '15px',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: 0.08,
              cursor: 'pointer',
            }}
          >네, 확인했습니다.</button>
        </div>
      </div>
    </div>
  )
}

addPropertyControls(QuickQuoteFlow, {
  apiUrl: { type: ControlType.String, title: 'API URL', defaultValue: 'https://kt-market-puce.vercel.app' },
  primaryColor: { type: ControlType.Color, title: 'Primary Color', defaultValue: '#0066FF' },
})
