// framer/phone/PhoneCompare.tsx
import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PhoneSelectModal from "./PhoneSelectModal"

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
      {/* Y축 그리드 */}
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
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize={9}
          fill={i === activeTierIndex ? "#EF4444" : "#9ca3af"}
          fontWeight={i === activeTierIndex ? "700" : "400"}>
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
        const x = toX(activeTierIndex)
        const y = toY(v)
        const offsetY = si === 0 ? -10 : si === 1 ? -18 : -26
        return (
          <text key={si} x={x} y={y + offsetY} textAnchor="middle" fontSize={9} fill={colors[si]} fontWeight="700">
            {Math.round(v / 1000)}천
          </text>
        )
      })}
    </svg>
  )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
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
  const [tierIndex, setTierIndex] = useState(1)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [targetSlot, setTargetSlot] = useState(0)
  const [alertState, setAlertState] = useState<"idle" | "loading" | "done">("idle")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filledSlots = slots.filter(Boolean) as DeviceInfo[]
  const activeTier = TIERS[tierIndex]

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

  return (
    <div style={{ fontFamily: FONT, background: "#fff", minHeight: 600 }}>

      <PhoneSelectModal
        open={modalOpen}
        excludeModels={slots.filter(Boolean).map((s) => s!.model)}
        onSelect={handleSelectDevice}
        onClose={() => setModalOpen(false)}
      />

      {/* 폰 슬롯 3칸 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "14px 16px" }}>
        {slots.map((slot, i) =>
          slot ? (
            <div key={i} style={{
              borderRadius: 14, border: `1.5px solid ${SLOT_COLORS[i]}`,
              background: SLOT_BG[i], padding: "10px 8px", textAlign: "center",
              position: "relative",
            }}>
              <button
                onClick={() => removeSlot(i)}
                style={{
                  position: "absolute", top: 6, right: 6, width: 18, height: 18,
                  borderRadius: "50%", background: "rgba(0,0,0,0.12)", border: "none",
                  fontSize: 9, color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
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
        )}
      </div>

      {/* 가입유형 세그먼트: 번이/기변 */}
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
            flex: 1, padding: "9px 0", borderRadius: 10,
            border: `1.5px solid ${tierIndex === i ? "#EF4444" : "#e5e7eb"}`,
            background: tierIndex === i ? "#EF4444" : "#fff",
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
              datasets={slots.map((s) =>
                TIERS.map((t) => s?.plans.find((p) => p.tier === t.key)?.monthly ?? 0)
              )}
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

            {/* 행 */}
            {[
              {
                label: "월 납부금",
                vals: slots.map((s) => s?.plans[tierIndex]?.monthly ?? 0),
                fmt: (v: number) => v > 0 ? v.toLocaleString() : "-",
                isBest: true,
              },
              {
                label: "공시지원금",
                vals: slots.map((s) => s?.disclosure_subsidy ?? 0),
                fmt: (v: number) => v > 0 ? v.toLocaleString() : "-",
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
              const minVal = filledVals.length > 0 ? Math.min(...filledVals) : -1
              return (
                <div key={row.label} style={{
                  display: "grid",
                  gridTemplateColumns: `80px ${slots.filter(Boolean).map(() => "1fr").join(" ")}`,
                  padding: "10px 14px", borderBottom: "1px solid #f9fafb", alignItems: "center",
                }}>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{row.label}</div>
                  {slots.map((s, i) =>
                    s ? (
                      <div key={i} style={{
                        textAlign: "center", fontSize: 12, fontWeight: 600,
                        color: row.isBest && row.vals[i] === minVal && minVal > 0 ? "#EF4444" : "#111827",
                      }}>
                        {row.fmt(row.vals[i])}{row.isBest && row.vals[i] === minVal && minVal > 0 ? " ✓" : ""}
                      </div>
                    ) : null
                  )}
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
              {alertState === "done"
                ? "알림 신청 완료! 변동 시 카카오톡으로 알려드립니다."
                : "가격 변동 시 카카오톡으로 즉시 알림 (로그인 필요)"}
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
