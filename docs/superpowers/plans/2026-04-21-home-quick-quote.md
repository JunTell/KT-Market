# Home + Quick Quote Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Framer 홈 히어로 + 5단계 바텀시트 빠른 견적 플로우를 신규 구축하고, `customer_consultations` 테이블을 `online_order` 구조로 확장한다.

**Architecture:** Framer에서 `HomeHero.tsx`가 전역 커스텀 이벤트(`ktmarket:open-quick-quote`)를 발송하면 같은 페이지에 마운트된 `QuickQuoteFlow.tsx`가 바텀시트를 오픈. 5단계(기종 → 용량 → 가입유형 → 확인 모달 → 정보 입력) 후 `POST /api/consultations/quick-quote`로 상담 요청을 저장. 모바일 80% 사용자 기준, 데스크탑은 중앙 카드 모달로 표시.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Framer (code components), Supabase, Pretendard, inline CSS (Framer 환경)

**Spec:** `docs/superpowers/specs/2026-04-21-home-quick-quote-design.md`

**Testing 접근:** 프로젝트에 테스트 러너 없음. 검증은 (a) `npm run check-all` 통과, (b) API 라우트는 `curl` 수동 테스트, (c) Framer 컴포넌트는 실제 Framer 환경 수동 QA.

---

## 파일 구조

```
supabase/migrations/
  20260421_customer_consultations_extend.sql   [신규 — 관리자가 Supabase 대시보드에서 실행]

src/app/api/consultations/quick-quote/
  route.ts                                     [신규 — POST 핸들러 + OPTIONS]

framer/home/
  HomeHero.tsx                                 [신규 — 홈 히어로]
  QuickQuoteFlow.tsx                           [신규 — 5단계 바텀시트]
```

각 파일 책임:
- **migration SQL**: `customer_consultations` 테이블에 16개 컬럼 추가 + 인덱스 생성
- **route.ts**: zod 검증, 쿠키 세션 optional 연결, admin client로 insert
- **HomeHero.tsx**: 풀뷰포트 랜딩, CTA 클릭 시 커스텀 이벤트 발송
- **QuickQuoteFlow.tsx**: 5단계 state machine, 각 단계 서브 컴포넌트는 같은 파일 내 private 컴포넌트로 분리

---

## Task 1: Supabase Migration

**Files:**
- Create: `supabase/migrations/20260421_customer_consultations_extend.sql`

- [ ] **Step 1: 디렉터리 생성 및 SQL 파일 작성**

`supabase/migrations/` 디렉터리가 없으면 생성. 파일 내용:

```sql
-- 20260421_customer_consultations_extend.sql
-- customer_consultations 테이블을 online_order 구조로 확장
-- 실행 전 기존 레코드는 운영자가 수동 삭제

ALTER TABLE customer_consultations
  ADD COLUMN IF NOT EXISTS device text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS "petName" text,
  ADD COLUMN IF NOT EXISTS capacity text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS register text,
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS freebie text,
  ADD COLUMN IF NOT EXISTS installment text,
  ADD COLUMN IF NOT EXISTS installment_principal text,
  ADD COLUMN IF NOT EXISTS discount text,
  ADD COLUMN IF NOT EXISTS benefit text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS is_consultation boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS kakao_friend_rewarded boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS kakao_friend_checked_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_customer_consultations_profile_id
  ON customer_consultations(profile_id);
CREATE INDEX IF NOT EXISTS idx_customer_consultations_phone
  ON customer_consultations(phone);
```

- [ ] **Step 2: 관리자에게 실행 요청 (사용자 작업)**

플랜 실행자는 이 SQL을 직접 Supabase에 적용하지 않는다. 아래 메시지로 사용자에게 요청:

> "Supabase SQL Editor에서 `supabase/migrations/20260421_customer_consultations_extend.sql` 내용을 실행하고, 기존 `customer_consultations` 레코드를 지워주세요. 완료되면 확인 부탁드립니다."

- [ ] **Step 3: 스키마 반영 확인**

사용자가 확인 회신하면 로컬에서 Supabase 타입을 재생성하거나(프로젝트에 `npm run gen:types` 있으면 실행) 없으면 수동 확인:

```bash
# 프로젝트 루트
grep -n "customer_consultations" src/shared/types/supabase.ts | head -5
```

타입 파일이 자동 생성된 형태라면 갱신 필요. 갱신 방법을 모를 경우 사용자에게 확인.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421_customer_consultations_extend.sql
git commit -m "feat: add migration to extend customer_consultations for quick-quote"
```

---

## Task 2: API Endpoint — POST /api/consultations/quick-quote

**Files:**
- Create: `src/app/api/consultations/quick-quote/route.ts`

- [ ] **Step 1: 디렉터리 및 파일 생성 — 전체 코드 작성**

```typescript
// src/app/api/consultations/quick-quote/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import type { NextRequest } from 'next/server'

const QuickQuoteSchema = z.object({
  model: z.string().min(1, 'model 필수'),
  petName: z.string().min(1, 'petName 필수'),
  device: z.string().min(1, 'device 필수'),
  capacity: z.string().default(''),
  register: z.enum(['번호이동', '기기변경']),
  name: z.string().min(2, '이름은 2자 이상').max(20, '이름은 20자 이하'),
  phone: z.string().regex(/^01[016789]\d{7,8}$/, '전화번호 형식 오류'),
  birthday: z.string().regex(/^\d{6}$/, '생년월일은 YYMMDD 6자리'),
})

export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: '잘못된 요청 형식' }, { status: 400, headers: cors })
  }

  const parsed = QuickQuoteSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? '유효성 오류' },
      { status: 400, headers: cors }
    )
  }
  const input = parsed.data

  // 세션이 있으면 profile_id 자동 연결 (없어도 진행)
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // model 존재 여부 검증 (admin client — RLS 우회)
  const admin = createSupabaseAdminClient()
  const { data: device } = await admin
    .from('devices')
    .select('model')
    .eq('model', input.model)
    .maybeSingle()

  if (!device) {
    return NextResponse.json({ ok: false, error: '존재하지 않는 기종' }, { status: 400, headers: cors })
  }

  const { data, error } = await admin
    .from('customer_consultations')
    .insert({
      name: input.name,
      phone: input.phone,
      birthday: input.birthday,
      device: input.device,
      model: input.model,
      petName: input.petName,
      capacity: input.capacity,
      register: input.register,
      carrier: 'KT',
      is_consultation: true,
      is_processed: false,
      profile_id: user?.id ?? null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500, headers: cors })
  }

  return NextResponse.json({ ok: true, id: data.id }, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
```

> **주의**: `customer_consultations`의 컬럼 `petName`이 카멜케이스라 Supabase TypeScript 타입에서 따옴표 처리가 필요할 수 있음. 타입 오류 발생 시 `.insert({ ... } as never)` 또는 타입 재생성 필요.

- [ ] **Step 2: Lint + 타입체크**

```bash
npm run lint -- --fix src/app/api/consultations/quick-quote/route.ts
npm run typecheck
```

Expected: 0 에러. 만약 `customer_consultations` 타입에 새 컬럼이 없다고 나오면, Step 3의 타입 재생성 필요.

- [ ] **Step 3: 타입 오류 대응 (필요 시)**

`supabase.ts` 타입 파일이 최신이 아니면 insert 객체에 타입 단언 추가:

```typescript
.insert({
  name: input.name,
  // ...
} as never)
```

또는 사용자에게 `supabase gen types typescript` 실행을 요청.

- [ ] **Step 4: 빌드 검증**

```bash
npm run build
```

Expected: 성공, `/api/consultations/quick-quote` 라우트가 동적으로 등록됨.

- [ ] **Step 5: 로컬 curl 테스트**

```bash
npm run dev &
sleep 3
# 성공 케이스 (실제 존재하는 model로 교체 필요)
curl -X POST http://localhost:3000/api/consultations/quick-quote \
  -H "Content-Type: application/json" \
  -H "Origin: https://ktmarket.co.kr" \
  -d '{"model":"SM-F766U","petName":"갤럭시 Z플립7","device":"smartphone","capacity":"256GB","register":"번호이동","name":"김유플","phone":"01012345678","birthday":"901129"}'
# Expected: {"ok":true,"id":<number>}

# 실패 케이스 — 전화번호 형식 오류
curl -X POST http://localhost:3000/api/consultations/quick-quote \
  -H "Content-Type: application/json" \
  -H "Origin: https://ktmarket.co.kr" \
  -d '{"model":"SM-F766U","petName":"갤럭시 Z플립7","device":"smartphone","capacity":"","register":"번호이동","name":"테스트","phone":"010","birthday":"901129"}'
# Expected: {"ok":false,"error":"전화번호 형식 오류"}

# 실패 케이스 — 존재하지 않는 model
curl -X POST http://localhost:3000/api/consultations/quick-quote \
  -H "Content-Type: application/json" \
  -H "Origin: https://ktmarket.co.kr" \
  -d '{"model":"NONEXISTENT","petName":"x","device":"smartphone","capacity":"","register":"번호이동","name":"테스트","phone":"01012345678","birthday":"901129"}'
# Expected: {"ok":false,"error":"존재하지 않는 기종"}
```

`npm run dev` 프로세스 종료:
```bash
pkill -f "next dev" 2>/dev/null || true
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/consultations/quick-quote/route.ts
git commit -m "feat: add POST /api/consultations/quick-quote endpoint"
```

---

## Task 3: HomeHero.tsx

**Files:**
- Create: `framer/home/HomeHero.tsx`

- [ ] **Step 1: 디렉터리 생성 및 컴포넌트 작성**

```typescript
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
            letterSpacing: 0.08,
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 120ms ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
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
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```

Expected: 0 에러. `framer` 패키지 import는 실제 Framer 환경에서만 동작하지만, 프로젝트 `tsconfig`에서 `framer/**` 경로를 제외/허용 설정했는지 확인. 만약 에러가 나면 기존 Framer 컴포넌트(`framer/phone/PhoneCompare.tsx` 등)와 비교하여 동일 방식으로 작성.

- [ ] **Step 3: Commit**

```bash
git add framer/home/HomeHero.tsx
git commit -m "feat: add HomeHero framer component with quick quote CTA"
```

---

## Task 4: QuickQuoteFlow — Shell (바텀시트 + 이벤트 리스너)

**Files:**
- Create: `framer/home/QuickQuoteFlow.tsx`

- [ ] **Step 1: 최상위 쉘 작성 (state machine + 이벤트 리스너)**

파일 생성. 이 Task에서는 **쉘(오버레이/헤더/진행바/바디 플레이스홀더/푸터)만 구현**. 각 Step 렌더는 다음 Task에서 추가.

```typescript
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

  const goBack = useCallback(() => {
    if (step === 1) close()
    else if (step === 4) setStep(3)   // 확인 모달 이후 step 4에서 뒤로 → step 3
    else setStep((step - 1) as Step)
  }, [step, close])

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
  }, [step, selection])

  const handleConfirmed = useCallback(() => {
    setShowConfirmModal(false)
    setStep(4)
  }, [])

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

// Header placeholder — 다음 Task에서 구현
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

// Placeholder components — 다음 Task에서 구현
function StepModel(_: any) { return <div>TODO: Step 1</div> }
function StepCapacity(_: any) { return <div>TODO: Step 2</div> }
function StepRegister(_: any) { return <div>TODO: Step 3</div> }
function StepForm(_: any) { return <div>TODO: Step 4</div> }
function StepDone(_: any) { return <div>TODO: Step 5</div> }
function ConfirmModal(_: any) { return null }

addPropertyControls(QuickQuoteFlow, {
  apiUrl: { type: ControlType.String, title: 'API URL', defaultValue: 'https://kt-market-puce.vercel.app' },
  primaryColor: { type: ControlType.Color, title: 'Primary Color', defaultValue: '#0066FF' },
})
```

> **주의**: 이 Task는 쉘만 완성. 내부 `StepModel`/`StepCapacity`/... placeholder는 다음 Task에서 제거·구현. 타입체크를 통과시키려고 `_: any`로 시작했지만, 다음 Task에서 올바른 props 타입으로 교체됨.

- [ ] **Step 2: 타입체크 및 빌드**

```bash
npm run typecheck
```

Expected: 0 에러.

- [ ] **Step 3: Commit**

```bash
git add framer/home/QuickQuoteFlow.tsx
git commit -m "feat: add QuickQuoteFlow shell with bottomsheet + event listener"
```

---

## Task 5: Step 1 — 기종 선택

**Files:**
- Modify: `framer/home/QuickQuoteFlow.tsx` (StepModel 컴포넌트 교체)

- [ ] **Step 1: StepModel placeholder를 실제 구현으로 교체**

기존 `function StepModel(_: any) { return <div>TODO: Step 1</div> }` 부분을 아래로 교체:

```typescript
interface Device {
  model: string
  pet_name: string
  thumbnail: string | null
  company: string
  category?: string
  capacities?: string[]
  category_kr?: string
}

type Company = 'samsung' | 'apple' | 'kidsphone'

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

  const filtered = useMemo(() => {
    if (tab === 'samsung') return devices.filter((d) => d.company === 'samsung')
    if (tab === 'apple') return devices.filter((d) => d.company === 'apple')
    return devices.filter((d) => d.category === 'kidsphone')
  }, [devices, tab])

  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, marginBottom: '20px' }}>
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
            return (
              <button
                key={d.model}
                onClick={() => setSelection((s) => ({
                  ...s,
                  model: d.model,
                  petName: d.pet_name,
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
                {d.thumbnail ? (
                  <img src={d.thumbnail} alt={d.pet_name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: COLORS.border, borderRadius: '8px' }} />
                )}
                <div style={{ fontFamily: FONT, fontSize: '14px', fontWeight: 600, color: COLORS.textPrimary, letterSpacing: -0.24, textAlign: 'center' }}>
                  {d.pet_name}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

> **주의**: 기존 `/api/compare/devices`는 `capacities`와 `category`를 select에 포함하지 않음. Step 2에서 용량이 필요하므로 이 API를 확장하거나 별도 엔드포인트 사용. 아래 Step 2에서 처리.

- [ ] **Step 2: `/api/compare/devices` 응답 확장**

`src/app/api/compare/devices/route.ts`를 수정하여 `capacities`와 `category`를 select에 추가:

```typescript
const { data, error } = await supabase
  .from('devices')
  .select('model, pet_name, thumbnail, company, category, capacities, price, subsidy')
  .eq('is_available', true)
  .order('priority', { ascending: true })
```

- [ ] **Step 3: 타입체크 및 빌드**

```bash
npm run typecheck && npm run build
```

Expected: 0 에러.

- [ ] **Step 4: Commit**

```bash
git add framer/home/QuickQuoteFlow.tsx src/app/api/compare/devices/route.ts
git commit -m "feat: implement StepModel with tab filter and grid"
```

---

## Task 6: Step 2 — 용량 선택

**Files:**
- Modify: `framer/home/QuickQuoteFlow.tsx` (StepCapacity 교체)

- [ ] **Step 1: StepCapacity placeholder를 실제 구현으로 교체**

```typescript
function StepCapacity({
  selection,
  setSelection,
}: {
  selection: Selection
  setSelection: React.Dispatch<React.SetStateAction<Selection>>
}) {
  return (
    <div>
      <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, marginBottom: '20px' }}>
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
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```

Expected: 0 에러.

- [ ] **Step 3: Commit**

```bash
git add framer/home/QuickQuoteFlow.tsx
git commit -m "feat: implement StepCapacity selection"
```

---

## Task 7: Step 3 — 가입유형 선택

**Files:**
- Modify: `framer/home/QuickQuoteFlow.tsx` (StepRegister 교체)

- [ ] **Step 1: StepRegister placeholder를 실제 구현으로 교체**

```typescript
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
      <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, marginBottom: '8px' }}>
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
              <div style={{ fontFamily: FONT, fontSize: '13px', color: COLORS.textSecondary, letterSpacing: -0.24, lineHeight: 1.5, whiteSpace: 'pre-line', textAlign: 'center' }}>
                {opt.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```

Expected: 0 에러.

- [ ] **Step 3: Commit**

```bash
git add framer/home/QuickQuoteFlow.tsx
git commit -m "feat: implement StepRegister with KT-style cards"
```

---

## Task 8: Confirmation Modal

**Files:**
- Modify: `framer/home/QuickQuoteFlow.tsx` (ConfirmModal 교체)

- [ ] **Step 1: ConfirmModal placeholder를 실제 구현으로 교체**

```typescript
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
                <div style={{ fontFamily: FONT, fontSize: '15px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.3 }}>{it.title}</div>
              </div>
              <ul style={{ margin: 0, paddingLeft: '34px', listStyle: 'disc' }}>
                {it.bullets.map((b, i) => (
                  <li key={i} style={{ fontFamily: FONT, fontSize: '13px', color: COLORS.textSecondary, letterSpacing: -0.24, lineHeight: 1.6, marginBottom: '4px' }}>{b}</li>
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
              letterSpacing: 0.08,
              cursor: 'pointer',
            }}
          >네, 확인했습니다.</button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 타입체크**

```bash
npm run typecheck
```

Expected: 0 에러.

- [ ] **Step 3: Commit**

```bash
git add framer/home/QuickQuoteFlow.tsx
git commit -m "feat: implement confirmation modal before form step"
```

---

## Task 9: Step 4 — 정보 입력 폼

**Files:**
- Modify: `framer/home/QuickQuoteFlow.tsx` (StepForm 교체)

- [ ] **Step 1: 전화번호 포맷팅 헬퍼 추가**

파일 상단 COLORS 상수 아래에 추가:

```typescript
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
```

- [ ] **Step 2: StepForm placeholder를 실제 구현으로 교체**

```typescript
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
        <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, lineHeight: 1.3 }}>
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
```

- [ ] **Step 3: 타입체크**

```bash
npm run typecheck
```

Expected: 0 에러.

- [ ] **Step 4: Commit**

```bash
git add framer/home/QuickQuoteFlow.tsx
git commit -m "feat: implement StepForm with name/phone/birthday + privacy consent"
```

---

## Task 10: Step 5 — 완료 화면

**Files:**
- Modify: `framer/home/QuickQuoteFlow.tsx` (StepDone 교체)

- [ ] **Step 1: StepDone placeholder를 실제 구현으로 교체**

```typescript
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
      <h2 style={{ fontFamily: FONT, fontSize: '22px', fontWeight: 700, color: COLORS.textPrimary, letterSpacing: -0.44, margin: 0, marginBottom: '12px' }}>
        상담 신청이 접수됐어요
      </h2>
      <p style={{ fontFamily: FONT, fontSize: '15px', color: COLORS.textSecondary, letterSpacing: -0.3, lineHeight: 1.5, margin: 0, marginBottom: '40px', maxWidth: '300px' }}>
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
          letterSpacing: 0.08,
          cursor: 'pointer',
        }}
      >확인</button>
    </div>
  )
}
```

- [ ] **Step 2: 타입체크 + 빌드 전체**

```bash
npm run check-all
```

Expected: lint/typecheck/build 모두 통과 (import 순서 경고는 무시 가능).

- [ ] **Step 3: Commit**

```bash
git add framer/home/QuickQuoteFlow.tsx
git commit -m "feat: implement StepDone success screen"
```

---

## Task 11: 통합 검증 + 문서화

**Files:**
- Modify: `framer/README.md` (Framer 컴포넌트 배포 가이드 추가)

- [ ] **Step 1: 로컬 종합 테스트**

```bash
npm run dev &
sleep 3
```

브라우저에서 `http://localhost:3000`을 열고:
- `/api/compare/devices` 응답에 `capacities`, `category` 포함 확인
- `POST /api/consultations/quick-quote`에 유효 payload로 curl 요청하여 `ok:true` + Supabase `customer_consultations` 테이블에 레코드 생성 확인
- 잘못된 payload로 검증 에러 메시지 확인

```bash
pkill -f "next dev" 2>/dev/null || true
```

- [ ] **Step 2: Framer README에 배포 섹션 추가**

`framer/README.md`가 없으면 생성. 있으면 섹션 추가:

```markdown
## 홈 + 빠른 견적 배포 (2026-04-21)

Framer에서 `/` 홈 페이지에 아래 두 컴포넌트를 배치:

1. `framer/home/HomeHero.tsx` — 상단에 고정 배치
2. `framer/home/QuickQuoteFlow.tsx` — 같은 페이지 임의 위치(바텀시트이므로 렌더링 위치 무관)

CTA 클릭 시 커스텀 이벤트(`ktmarket:open-quick-quote`)로 시트가 열립니다. 두 컴포넌트가 다른 페이지에 있으면 동작하지 않습니다.

### Property Controls
- HomeHero: title / subtitle / ctaLabel / ctaColor
- QuickQuoteFlow: apiUrl / primaryColor

### 의존 API
- `GET /api/compare/devices` (기종 목록)
- `POST /api/consultations/quick-quote` (상담 신청)
```

- [ ] **Step 3: 최종 check-all**

```bash
npm run check-all
```

Expected: 통과.

- [ ] **Step 4: Commit**

```bash
git add framer/README.md
git commit -m "docs: add framer deploy notes for home + quick-quote"
```

- [ ] **Step 5: 수동 QA 체크리스트 (Framer 실제 환경에서 사용자 확인)**

구현자는 아래 체크리스트를 사용자에게 전달하고, Framer 퍼블리시 후 확인을 요청:

- [ ] 홈 히어로가 크림 배경 + KT 블루 CTA로 표시됨
- [ ] "빠른 견적받아보기" 클릭 시 바텀시트 오픈
- [ ] Step 1: 갤럭시/아이폰/키즈폰 탭 전환, 기종 카드 선택 시 블루 보더
- [ ] Step 2: 선택한 기종의 용량 리스트 표시, 용량 없는 기종은 Step 3으로 자동 이동
- [ ] Step 3: 번호이동/기기변경 2개 카드, 선택 후 "다음" 클릭 시 확인 모달 오픈
- [ ] 확인 모달: 4개 안내 + "네, 확인했습니다." → Step 4 진입
- [ ] Step 4: 이름 2자 이상, 전화번호 자동 하이픈, 생년월일 6자리 입력 시 "상담 신청하기" 활성
- [ ] 동의 체크 해제 시 "상담 신청하기" 비활성
- [ ] "상담 신청하기" 성공 시 Step 5 완료 화면, Supabase에 레코드 저장 확인
- [ ] "확인" 버튼 클릭 시 바텀시트 닫힘, 홈 페이지 유지
- [ ] "일단 둘러볼게요" 클릭 시 `/phone`으로 이동
- [ ] 모바일(375px) 및 데스크탑(1024px)에서 모두 정상 표시

---

## 완료 조건

- 모든 Task의 체크박스 완료
- `npm run check-all` 통과
- Supabase `customer_consultations` 테이블 마이그레이션 반영
- 사용자가 수동 QA 체크리스트 통과 확인

## 파일 변경 요약

- 신규: 4개 (SQL 1, API route 1, Framer 컴포넌트 2)
- 수정: 2개 (compare/devices API, framer/README.md)
