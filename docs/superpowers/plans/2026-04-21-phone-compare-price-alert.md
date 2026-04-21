# Phone Compare + Price Alert Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기종 비교 페이지(`/phone/compare`)와 공시지원금 인하 알림 구독 기능을 구현한다.

**Architecture:** Next.js API Route 2개(compare/devices, compare/prices) + 인증 필요 API 2개(alerts/subscribe POST·DELETE) + Framer 코드 컴포넌트 2개(PhoneSelectModal, PhoneCompare). 가격 계산 로직은 API 서버에서 담당하고 Framer 컴포넌트는 fetch로 호출한다.

**Tech Stack:** Next.js App Router, Supabase (anon key for public data, server client for auth), Framer code components (React + inline style), Framer Motion, SVG 기반 라인 차트

---

## 파일 목록

| 액션 | 경로 |
|------|------|
| 생성 | `src/app/api/compare/devices/route.ts` |
| 생성 | `src/app/api/compare/prices/route.ts` |
| 생성 | `src/app/api/alerts/subscribe/route.ts` |
| 생성 | `framer/phone/PhoneSelectModal.tsx` |
| 생성 | `framer/phone/PhoneCompare.tsx` |

DB 마이그레이션: `price_alert_subscriptions` 테이블 (Supabase 대시보드에서 SQL 실행)

---

## Task 1: DB 마이그레이션 — price_alert_subscriptions

**Files:**
- Supabase SQL Editor에서 직접 실행

- [ ] **Step 1: SQL 실행**

Supabase 대시보드 → SQL Editor에서 아래 실행:

```sql
CREATE TABLE public.price_alert_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  model text NOT NULL REFERENCES devices(model) ON DELETE CASCADE,
  register_type text NOT NULL CHECK (register_type IN ('mnp', 'chg')),
  last_subsidy bigint,
  is_active boolean NOT NULL DEFAULT true,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, model, register_type)
);

-- RLS
ALTER TABLE public.price_alert_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 구독만 조회" ON public.price_alert_subscriptions
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "본인만 구독 생성" ON public.price_alert_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "본인만 구독 수정" ON public.price_alert_subscriptions
  FOR UPDATE USING (auth.uid() = profile_id);
```

- [ ] **Step 2: 테이블 생성 확인**

Supabase 대시보드 → Table Editor에서 `price_alert_subscriptions` 테이블 확인.

---

## Task 2: API — GET /api/compare/devices

**Files:**
- Create: `src/app/api/compare/devices/route.ts`

- [ ] **Step 1: 파일 생성**

```ts
// src/app/api/compare/devices/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCorsHeaders } from '@/src/shared/lib/cors'
import type { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))

  const { data, error } = await supabase
    .from('devices')
    .select('model, pet_name, thumbnail, company, price, subsidy')
    .eq('is_available', true)
    .order('priority', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
  }

  return NextResponse.json(data, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
```

- [ ] **Step 2: 로컬에서 응답 확인**

```bash
npm run dev
curl "http://localhost:3000/api/compare/devices" | python3 -m json.tool | head -40
```

Expected: `[{ "model": "...", "pet_name": "...", ... }, ...]` 형태의 배열

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/compare/devices/route.ts
git commit -m "feat: add GET /api/compare/devices endpoint"
```

---

## Task 3: API — GET /api/compare/prices

**Files:**
- Create: `src/app/api/compare/prices/route.ts`

가격 계산 공식:
- `device_monthly = ceil((devices.price - devices.subsidy - device_discount) / 24)`
- `plan_monthly = TIER_PLAN_PRICE - plan_discount`
- `total_monthly = device_monthly + plan_monthly`

요금제 구간 대표 금액:
| UI | ktmarket_subsidy 컬럼 suffix | 대표 요금제 |
|----|------------------------------|-------------|
| 3.7만↑ | `gte_37000` | 45,000원 |
| 6.9만↑ | `gte_61000` | 75,000원 |
| 9.0만↑ | `gte_90000` | 100,000원 |

- [ ] **Step 1: 파일 생성**

```ts
// src/app/api/compare/prices/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCorsHeaders } from '@/src/shared/lib/cors'
import type { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type RegisterType = 'mnp' | 'chg'

const TIERS = [
  { key: 'gte_37000', planPrice: 45000, label: '3.7만원↑' },
  { key: 'gte_61000', planPrice: 75000, label: '6.9만원↑' },
  { key: 'gte_90000', planPrice: 100000, label: '9.0만원↑' },
] as const

export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))
  const { searchParams } = new URL(request.url)
  const modelsParam = searchParams.get('models') ?? ''
  const register = (searchParams.get('register') ?? 'mnp') as RegisterType

  const models = modelsParam.split(',').map((m) => m.trim()).filter(Boolean).slice(0, 3)

  if (models.length === 0) {
    return NextResponse.json({ error: 'models 파라미터 필요' }, { status: 400, headers: cors })
  }

  // devices + ktmarket_subsidy 병렬 조회
  const [devicesRes, subsidyRes] = await Promise.all([
    supabase
      .from('devices')
      .select('model, pet_name, price, subsidy, thumbnail')
      .in('model', models),
    supabase
      .from('ktmarket_subsidy')
      .select('*')
      .in('model', models),
  ])

  if (devicesRes.error) {
    return NextResponse.json({ error: devicesRes.error.message }, { status: 500, headers: cors })
  }

  const subsidyMap = Object.fromEntries(
    (subsidyRes.data ?? []).map((row) => [row.model, row])
  )

  const result = (devicesRes.data ?? []).map((device) => {
    const sub = subsidyMap[device.model] ?? {}
    const baseDevicePrice = (device.price ?? 0) - (device.subsidy ?? 0)

    const plans = TIERS.map(({ key, planPrice, label }) => {
      const deviceDiscount: number = sub[`device_discount_${register}_${key}`] ?? 0
      const planDiscount: number = sub[`plan_discount_${register}_${key}`] ?? 0

      const finalDevicePrice = Math.max(0, baseDevicePrice - deviceDiscount)
      const monthlyDevice = Math.ceil(finalDevicePrice / 24)
      const monthlyPlan = Math.max(0, planPrice - planDiscount)
      const monthly = monthlyDevice + monthlyPlan

      return { tier: key, label, monthly, deviceDiscount, planDiscount }
    })

    return {
      model: device.model,
      pet_name: device.pet_name,
      thumbnail: device.thumbnail,
      price: device.price ?? 0,
      disclosure_subsidy: device.subsidy ?? 0,
      plans,
    }
  })

  return NextResponse.json(result, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
```

- [ ] **Step 2: 응답 확인** (실제 model 값으로 교체)

```bash
curl "http://localhost:3000/api/compare/prices?models=SM-S938N,iPhone17Pro&register=mnp" \
  | python3 -m json.tool
```

Expected:
```json
[
  {
    "model": "SM-S938N",
    "pet_name": "갤S26 울트라",
    "price": 1559800,
    "disclosure_subsidy": 256000,
    "plans": [
      { "tier": "gte_37000", "label": "3.7만원↑", "monthly": 128000, ... },
      { "tier": "gte_61000", "label": "6.9만원↑", "monthly": 101000, ... },
      { "tier": "gte_90000", "label": "9.0만원↑", "monthly": 92000, ... }
    ]
  }
]
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/compare/prices/route.ts
git commit -m "feat: add GET /api/compare/prices endpoint"
```

---

## Task 4: API — POST/DELETE /api/alerts/subscribe

**Files:**
- Create: `src/app/api/alerts/subscribe/route.ts`

- [ ] **Step 1: 파일 생성**

```ts
// src/app/api/alerts/subscribe/route.ts
import { NextResponse } from 'next/server'
import { getCorsHeaders } from '@/src/shared/lib/cors'
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'
import { createSupabaseAdminClient } from '@/src/shared/lib/supabase/admin'
import type { NextRequest } from 'next/server'

// POST: 알림 구독 신청
export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인 필요' }, { status: 401, headers: cors })
  }

  const body = await request.json()
  const { model, register_type } = body as { model: string; register_type: 'mnp' | 'chg' }

  if (!model || !['mnp', 'chg'].includes(register_type)) {
    return NextResponse.json({ error: '유효하지 않은 요청' }, { status: 400, headers: cors })
  }

  // 현재 공시지원금 스냅샷 조회
  const admin = createSupabaseAdminClient()
  const { data: device } = await admin
    .from('devices')
    .select('subsidy')
    .eq('model', model)
    .single()

  const { error } = await admin
    .from('price_alert_subscriptions')
    .upsert(
      {
        profile_id: user.id,
        model,
        register_type,
        last_subsidy: device?.subsidy ?? null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,model,register_type' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

// DELETE: 알림 구독 취소
export async function DELETE(request: NextRequest) {
  const cors = getCorsHeaders(request.headers.get('origin'))
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인 필요' }, { status: 401, headers: cors })
  }

  const { searchParams } = new URL(request.url)
  const model = searchParams.get('model')
  const register_type = searchParams.get('register_type')

  if (!model || !register_type) {
    return NextResponse.json({ error: 'model, register_type 필요' }, { status: 400, headers: cors })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('price_alert_subscriptions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('profile_id', user.id)
    .eq('model', model)
    .eq('register_type', register_type)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request.headers.get('origin')),
  })
}
```

- [ ] **Step 2: 타입 체크**

```bash
npm run typecheck 2>&1 | grep -i "alerts"
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/api/alerts/subscribe/route.ts
git commit -m "feat: add POST/DELETE /api/alerts/subscribe endpoint"
```

---

## Task 5: Framer — PhoneSelectModal.tsx

**Files:**
- Create: `framer/phone/PhoneSelectModal.tsx`

기종 선택 모달. 빈 슬롯 탭 시 열리고, 검색 + 리스트에서 선택.

- [ ] **Step 1: 파일 생성**

```tsx
// framer/phone/PhoneSelectModal.tsx
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

const API = "https://kt-market-puce.vercel.app"
const FONT = "'Apple SD Gothic Neo', -apple-system, sans-serif"

type Device = {
  model: string
  pet_name: string
  thumbnail: string | null
  company: string | null
  price: number
  subsidy: number
}

type Props = {
  open: boolean
  excludeModels: string[]
  onSelect: (device: Device) => void
  onClose: () => void
}

export default function PhoneSelectModal({ open, excludeModels, onSelect, onClose }: Props) {
  const [devices, setDevices] = useState<Device[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`${API}/api/compare/devices`)
      .then((r) => r.json())
      .then((data) => setDevices(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [open])

  const filtered = devices.filter(
    (d) =>
      !excludeModels.includes(d.model) &&
      (d.pet_name?.includes(query) || d.model.toLowerCase().includes(query.toLowerCase()))
  )

  if (typeof window === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* 딤 배경 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 200,
            }}
          />
          {/* 바텀시트 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              margin: "0 auto", maxWidth: 440,
              background: "#fff", borderRadius: "20px 20px 0 0",
              zIndex: 201, maxHeight: "80vh", display: "flex", flexDirection: "column",
              fontFamily: FONT,
            }}
          >
            {/* 핸들 */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e5e7eb" }} />
            </div>

            <div style={{ padding: "8px 16px 12px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
                기종 선택
              </div>
              {/* 검색 */}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="기종명 검색"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 12,
                  border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                  fontFamily: FONT, boxSizing: "border-box",
                }}
              />
            </div>

            {/* 목록 */}
            <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 20px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 }}>
                  불러오는 중...
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 }}>
                  검색 결과 없음
                </div>
              ) : (
                filtered.map((device) => (
                  <div
                    key={device.model}
                    onClick={() => { onSelect(device); onClose() }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 0", borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: 44, height: 54, borderRadius: 8, background: "#f3f4f6",
                      flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {device.thumbnail ? (
                        <img src={device.thumbnail} alt={device.pet_name}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      ) : (
                        <span style={{ fontSize: 20 }}>📱</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                        {device.pet_name}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        출고가 {(device.price ?? 0).toLocaleString()}원
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#EF4444", fontWeight: 600 }}>선택</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
npm run typecheck 2>&1 | grep "PhoneSelectModal"
```

Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add framer/phone/PhoneSelectModal.tsx
git commit -m "feat: add PhoneSelectModal Framer component"
```

---

## Task 6: Framer — PhoneCompare.tsx (메인 컴포넌트)

**Files:**
- Create: `framer/phone/PhoneCompare.tsx`

승인된 목업(`comparison-v2.html`) 기준으로 구현. SVG 기반 라인 차트 내장.

- [ ] **Step 1: 파일 생성 — 상수 + 타입 + SVG 차트**

```tsx
// framer/phone/PhoneCompare.tsx
import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── 상수 ────────────────────────────────────────────────
const API = "https://kt-market-puce.vercel.app"
const FONT = "'Apple SD Gothic Neo', -apple-system, sans-serif"
const SLOT_COLORS = ["#EF4444", "#3B82F6", "#10B981"] as const
const SLOT_BG = ["#fff5f5", "#eff6ff", "#f0fdf4"] as const
const TIERS = [
  { key: "gte_37000", label: "3.7만원↑", sub: "베이직" },
  { key: "gte_61000", label: "6.9만원↑", sub: "스탠다드" },
  { key: "gte_90000", label: "9.0만원↑", sub: "프리미엄" },
] as const

type TierKey = "gte_37000" | "gte_61000" | "gte_90000"
type RegisterType = "mnp" | "chg"

type DeviceInfo = {
  model: string
  pet_name: string
  thumbnail: string | null
  price: number
  disclosure_subsidy: number
  plans: { tier: TierKey; label: string; monthly: number }[]
}

// ─── SVG 라인 차트 ────────────────────────────────────────
function LineChart({
  datasets,
  colors,
  labels,
  activeTierIndex,
}: {
  datasets: number[][]
  colors: string[]
  labels: string[]
  activeTierIndex: number
}) {
  const W = 300; const H = 160; const PL = 40; const PR = 10; const PT = 10; const PB = 30
  const cW = W - PL - PR; const cH = H - PT - PB
  const n = labels.length

  const allVals = datasets.flat().filter((v) => v > 0)
  if (allVals.length === 0) return null

  const minV = Math.min(...allVals) * 0.85
  const maxV = Math.max(...allVals) * 1.05

  const toX = (i: number) => PL + (i / (n - 1)) * cW
  const toY = (v: number) => PT + cH - ((v - minV) / (maxV - minV)) * cH

  const pathD = (series: number[]) =>
    series
      .map((v, i) => {
        if (i === 0) return `M ${toX(i)} ${toY(v)}`
        const px = toX(i - 1); const py = toY(series[i - 1])
        const cx = toX(i); const cy = toY(v)
        const mx = (px + cx) / 2
        return `C ${mx} ${py} ${mx} ${cy} ${cx} ${cy}`
      })
      .join(" ")

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }} preserveAspectRatio="xMidYMid meet">
      {/* Y축 점선 그리드 */}
      {[0.25, 0.5, 0.75].map((t) => {
        const y = PT + cH * (1 - t)
        const val = minV + (maxV - minV) * t
        return (
          <g key={t}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={PL - 4} y={y + 4} textAnchor="end" fontSize={8} fill="#9ca3af">
              {Math.round(val / 10000)}만
            </text>
          </g>
        )
      })}

      {/* X축 레이블 */}
      {labels.map((l, i) => (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize={9} fill={i === activeTierIndex ? "#EF4444" : "#9ca3af"} fontWeight={i === activeTierIndex ? "700" : "400"}>
          {l}
        </text>
      ))}

      {/* 활성 구간 세로선 */}
      <line
        x1={toX(activeTierIndex)} y1={PT}
        x2={toX(activeTierIndex)} y2={PT + cH}
        stroke="#f3f4f6" strokeWidth={1.5} strokeDasharray="3 2"
      />

      {/* 라인 + 포인트 */}
      {datasets.map((series, si) => {
        if (series.every((v) => v === 0)) return null
        return (
          <g key={si}>
            <path d={pathD(series)} fill="none" stroke={colors[si]} strokeWidth={2.5} strokeLinecap="round" />
            {series.map((v, i) => (
              <circle key={i}
                cx={toX(i)} cy={toY(v)} r={i === activeTierIndex ? 5 : 3.5}
                fill="#fff" stroke={colors[si]}
                strokeWidth={i === activeTierIndex ? 2.5 : 2}
              />
            ))}
          </g>
        )
      })}

      {/* 활성 포인트 값 레이블 */}
      {datasets.map((series, si) => {
        if (series.every((v) => v === 0)) return null
        const v = series[activeTierIndex]
        const x = toX(activeTierIndex); const y = toY(v)
        const offsetY = si === 0 ? -10 : si === 1 ? -18 : -10
        return (
          <text key={si} x={x} y={y + offsetY} textAnchor="middle" fontSize={9} fill={colors[si]} fontWeight="700">
            {Math.round(v / 1000)}천
          </text>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 2: 메인 컴포넌트 함수 추가** (같은 파일에 이어서 작성)

```tsx
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 800
 */
export default function PhoneCompare(props) {
  const { onLoginRequest } = props

  const [slots, setSlots] = useState<(DeviceInfo | null)[]>([null, null, null])
  const [register, setRegister] = useState<RegisterType>("mnp")
  const [tierIndex, setTierIndex] = useState(1) // 기본: 6.9만원↑
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [targetSlot, setTargetSlot] = useState(0)
  const [alertState, setAlertState] = useState<"idle" | "loading" | "done">("idle")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filledSlots = slots.filter(Boolean) as DeviceInfo[]
  const activeTier = TIERS[tierIndex]

  // 가격 데이터 조회
  const fetchPrices = useCallback(async (models: string[], reg: RegisterType) => {
    if (models.length === 0) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/compare/prices?models=${models.join(",")}&register=${reg}`)
      const data: DeviceInfo[] = await res.json()
      setSlots((prev) =>
        prev.map((s) => {
          if (!s) return null
          return data.find((d) => d.model === s.model) ?? s
        })
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const models = slots.filter(Boolean).map((s) => s!.model)
    fetchPrices(models, register)
  }, [register, fetchPrices])

  const openModal = (slotIndex: number) => {
    setTargetSlot(slotIndex)
    setModalOpen(true)
  }

  const handleSelectDevice = async (device: { model: string; pet_name: string; thumbnail: string | null; price: number; subsidy: number }) => {
    const newSlots = [...slots]
    newSlots[targetSlot] = {
      model: device.model,
      pet_name: device.pet_name,
      thumbnail: device.thumbnail,
      price: device.price,
      disclosure_subsidy: device.subsidy,
      plans: [],
    }
    setSlots(newSlots)
    const models = newSlots.filter(Boolean).map((s) => s!.model)
    fetchPrices(models, register)
  }

  const removeSlot = (index: number) => {
    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(newSlots)
  }

  // 최저가 계산
  const winner = filledSlots.length > 0
    ? filledSlots.reduce((best, cur) => {
        const bv = best.plans[tierIndex]?.monthly ?? Infinity
        const cv = cur.plans[tierIndex]?.monthly ?? Infinity
        return cv < bv ? cur : best
      })
    : null

  const winnerMonthly = winner?.plans[tierIndex]?.monthly ?? 0
  const secondBestMonthly = filledSlots
    .filter((d) => d.model !== winner?.model)
    .map((d) => d.plans[tierIndex]?.monthly ?? 0)
    .filter((v) => v > 0)
    .sort((a, b) => a - b)[0] ?? 0

  const savings = secondBestMonthly > 0 ? secondBestMonthly - winnerMonthly : 0

  // 알림 신청
  const handleAlertSubscribe = async () => {
    const authRes = await fetch(`${API}/api/auth/me`, { credentials: "include" })
    const authData = await authRes.json()
    if (!authData.isLoggedIn) {
      if (typeof onLoginRequest === "function") onLoginRequest()
      return
    }

    setAlertState("loading")
    await Promise.all(
      filledSlots.map((d) =>
        fetch(`${API}/api/alerts/subscribe`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: d.model, register_type: register }),
        })
      )
    )
    setAlertState("done")
  }

  if (!mounted) return <div style={{ minHeight: 400 }} />

  // PhoneSelectModal은 동적 import 처럼 동작하므로 여기서 렌더
  // (실제 Framer 배포 시 같은 번들에 포함됨 — import 추가 필요)

  return (
    <div style={{ fontFamily: FONT, background: "#fff", minHeight: 600 }}>

      {/* 폰 슬롯 3칸 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "14px 16px" }}>
        {slots.map((slot, i) => (
          slot ? (
            <div key={i} onClick={() => {}} style={{
              borderRadius: 14, border: `1.5px solid ${SLOT_COLORS[i]}`,
              background: SLOT_BG[i], padding: "10px 8px", textAlign: "center",
              position: "relative", cursor: "default",
            }}>
              <button
                onClick={() => removeSlot(i)}
                style={{
                  position: "absolute", top: 6, right: 6, width: 18, height: 18,
                  borderRadius: "50%", background: "rgba(0,0,0,0.12)", border: "none",
                  fontSize: 9, color: "#fff", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>✕</button>
              <div style={{
                width: 36, height: 44, borderRadius: 6, margin: "0 auto 6px",
                background: "#e5e7eb", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {slot.thumbnail
                  ? <img src={slot.thumbnail} alt={slot.pet_name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <span style={{ fontSize: 18 }}>📱</span>}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: SLOT_COLORS[i], lineHeight: 1.3 }}>
                {slot.pet_name}
              </div>
            </div>
          ) : (
            <div key={i} onClick={() => openModal(i)} style={{
              borderRadius: 14, border: "1.5px dashed #d1d5db", background: "#fafafa",
              padding: "18px 8px", textAlign: "center", cursor: "pointer",
            }}>
              <div style={{ fontSize: 22, color: "#d1d5db", marginBottom: 4 }}>+</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>추가</div>
            </div>
          )
        ))}
      </div>

      {/* 가입유형 세그먼트 */}
      <div style={{
        display: "flex", margin: "0 16px 14px",
        background: "#f3f4f6", borderRadius: 12, padding: 3,
      }}>
        {(["mnp", "chg"] as RegisterType[]).map((r) => (
          <button key={r} onClick={() => setRegister(r)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
            background: register === r ? "#fff" : "transparent",
            boxShadow: register === r ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            fontSize: 13, fontWeight: 600,
            color: register === r ? "#111827" : "#9ca3af",
            cursor: "pointer", fontFamily: FONT,
          }}>
            {r === "mnp" ? "번호이동" : "기기변경"}
          </button>
        ))}
      </div>

      {/* 요금제 구간 3버튼 */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 14px" }}>
        {TIERS.map((t, i) => (
          <button key={t.key} onClick={() => setTierIndex(i)} style={{
            flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
            background: tierIndex === i ? "#EF4444" : "#fff",
            border: `1.5px solid ${tierIndex === i ? "#EF4444" : "#e5e7eb"}`,
            fontSize: 12, fontWeight: 600,
            color: tierIndex === i ? "#fff" : "#6b7280",
            cursor: "pointer", fontFamily: FONT, lineHeight: 1.4,
          }}>
            {t.label}
            <span style={{ display: "block", fontSize: 9, fontWeight: 400, opacity: 0.8 }}>{t.sub}</span>
          </button>
        ))}
      </div>

      {/* 라인 차트 */}
      {filledSlots.length > 0 && (
        <div style={{
          margin: "0 16px 14px", background: "#fff",
          borderRadius: 16, border: "1px solid #eef0f2",
          padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
            요금제별 월 납부금액
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>
            {register === "mnp" ? "번호이동" : "기기변경"} 기준 · 24개월 할부
          </div>

          {loading ? (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
              계산 중...
            </div>
          ) : (
            <LineChart
              datasets={slots.map((s) => TIERS.map((t) => s?.plans.find((p) => p.tier === t.key)?.monthly ?? 0))}
              colors={[...SLOT_COLORS]}
              labels={TIERS.map((t) => t.label)}
              activeTierIndex={tierIndex}
            />
          )}

          {/* 범례 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
            {slots.map((s, i) => s && (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#374151", fontWeight: 500 }}>
                <div style={{ width: 16, height: 3, borderRadius: 2, background: SLOT_COLORS[i] }} />
                {s.pet_name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최저가 카드 */}
      {winner && winnerMonthly > 0 && (
        <div style={{
          margin: "0 16px 14px",
          borderRadius: 16, background: "linear-gradient(120deg,#fff1f1 0%,#fff 100%)",
          border: "1.5px solid #fecaca", padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              background: "#EF4444", color: "#fff",
              fontSize: 10, fontWeight: 700,
              padding: "3px 8px", borderRadius: 100, marginBottom: 6,
            }}>
              🏆 {activeTier.label} 구간 최저가
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{winner.pet_name}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#EF4444", letterSpacing: -0.5 }}>
              {winnerMonthly.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>원/월</span>
            </div>
            {savings > 0 && (
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                비교 기종 대비 월 {savings.toLocaleString()}원 절약 · 24개월 총 {(savings * 24).toLocaleString()}원
              </div>
            )}
          </div>
          <div style={{
            width: 52, height: 64, background: "#f3f4f6", borderRadius: 10,
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          }}>
            {winner.thumbnail
              ? <img src={winner.thumbnail} alt={winner.pet_name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              : <span style={{ fontSize: 24 }}>📱</span>}
          </div>
        </div>
      )}

      {/* 비교표 */}
      {filledSlots.length > 0 && (
        <div style={{ margin: "0 16px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>
            상세 비교 ({activeTier.label} 요금제 기준)
          </div>
          <div style={{ borderRadius: 14, border: "1px solid #eef0f2", overflow: "hidden" }}>
            {/* 헤더 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: `80px ${slots.filter(Boolean).map(() => "1fr").join(" ")}`,
              padding: "9px 14px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6",
            }}>
              <div />
              {slots.map((s, i) => s && (
                <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: SLOT_COLORS[i] }}>
                  {s.pet_name.length > 5 ? s.pet_name.slice(0, 5) + "…" : s.pet_name}
                </div>
              ))}
            </div>

            {/* 월 납부금 */}
            {[
              {
                label: "월 납부금",
                vals: slots.map((s) => s?.plans[tierIndex]?.monthly ?? 0),
                fmt: (v: number) => v > 0 ? `${v.toLocaleString()}` : "-",
                isBest: true,
              },
              {
                label: "공시지원금",
                vals: slots.map((s) => s?.disclosure_subsidy ?? 0),
                fmt: (v: number) => v > 0 ? `${v.toLocaleString()}` : "-",
                isBest: false,
              },
              {
                label: "출고가",
                vals: slots.map((s) => s?.price ?? 0),
                fmt: (v: number) => v > 0 ? `${Math.round(v / 10000)}만` : "-",
                isBest: false,
              },
            ].map((row) => {
              const filledVals = row.vals.filter((v) => v > 0)
              const minVal = Math.min(...filledVals)
              return (
                <div key={row.label} style={{
                  display: "grid",
                  gridTemplateColumns: `80px ${slots.filter(Boolean).map(() => "1fr").join(" ")}`,
                  padding: "10px 14px", borderBottom: "1px solid #f9fafb", alignItems: "center",
                }}>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{row.label}</div>
                  {slots.map((s, i) => {
                    const v = row.vals[i]
                    const isBest = row.isBest && v === minVal && v > 0
                    return s ? (
                      <div key={i} style={{
                        textAlign: "center", fontSize: 12, fontWeight: 600,
                        color: isBest ? "#EF4444" : "#111827",
                      }}>
                        {row.fmt(v)}{isBest ? " ✓" : ""}
                      </div>
                    ) : null
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 알림 배너 */}
      {filledSlots.length > 0 && (
        <div style={{
          margin: "0 16px 30px", background: "#eff6ff",
          borderRadius: 14, padding: "13px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", marginBottom: 1 }}>
              공시지원금 인하 시 알림받기
            </div>
            <div style={{ fontSize: 11, color: "#3b82f6" }}>
              {alertState === "done" ? "알림 신청 완료! 변동 시 카카오톡으로 알려드립니다." : "가격 변동 시 카카오톡으로 즉시 알림 (로그인 필요)"}
            </div>
          </div>
          {alertState !== "done" && (
            <button
              onClick={handleAlertSubscribe}
              disabled={alertState === "loading"}
              style={{
                background: "#1d4ed8", color: "#fff", border: "none",
                borderRadius: 8, padding: "7px 12px",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap", flexShrink: 0, fontFamily: FONT,
                opacity: alertState === "loading" ? 0.6 : 1,
              }}>
              {alertState === "loading" ? "처리 중..." : "알림 신청"}
            </button>
          )}
        </div>
      )}

      {/* 기종 없을 때 안내 */}
      {filledSlots.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📱</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
            비교할 기종을 선택하세요
          </div>
          <div style={{ fontSize: 13 }}>최대 3개까지 요금제별 금액을 비교할 수 있습니다</div>
        </div>
      )}
    </div>
  )
}

addPropertyControls(PhoneCompare, {
  onLoginRequest: { type: ControlType.EventHandler },
})
```

- [ ] **Step 3: PhoneSelectModal import 연결** (파일 상단에 추가)

`PhoneCompare.tsx` 최상단 import 블록에 추가:
```tsx
import PhoneSelectModal from "./PhoneSelectModal"
```

그리고 `return (` 바로 아래, 첫 `<div>` 안에 추가:
```tsx
<PhoneSelectModal
  open={modalOpen}
  excludeModels={slots.filter(Boolean).map((s) => s!.model)}
  onSelect={handleSelectDevice}
  onClose={() => setModalOpen(false)}
/>
```

- [ ] **Step 4: 타입 체크**

```bash
npm run typecheck 2>&1 | grep -E "PhoneCompare|PhoneSelectModal"
```

Expected: 오류 없음

- [ ] **Step 5: 커밋**

```bash
git add framer/phone/PhoneCompare.tsx framer/phone/PhoneSelectModal.tsx
git commit -m "feat: add PhoneCompare Framer component with SVG line chart and alert subscription"
```

---

## Task 7: 최종 검증

- [ ] **Step 1: 전체 빌드 확인**

```bash
npm run check-all 2>&1 | tail -20
```

Expected: lint, typecheck, build 모두 통과

- [ ] **Step 2: API 엔드포인트 smoke test**

```bash
# devices 목록
curl -s "http://localhost:3000/api/compare/devices" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)}개 기종')"

# prices (실제 model 2개로 교체)
curl -s "http://localhost:3000/api/compare/prices?models=SM-S938N,SM-S931N&register=mnp" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); [print(x['pet_name'], x['plans'][1]['monthly']) for x in d]"
```

- [ ] **Step 3: 최종 커밋**

```bash
git add .
git commit -m "feat: phone comparison page and price alert subscription complete"
```
