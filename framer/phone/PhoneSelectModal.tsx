// framer/phone/PhoneSelectModal.tsx
import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

const API = "https://kt-market-puce.vercel.app"
const FONT = "'Apple SD Gothic Neo', -apple-system, sans-serif"
const S3 = "https://juntell.s3.ap-northeast-2.amazonaws.com/phone"

type Device = {
  model: string
  pet_name: string
  thumbnail: string | null
  company: string | null
  category?: string | null
  colors_en?: string[] | null
  images?: Record<string, string[]> | null
  price: number
  subsidy: number
}

type Props = {
  open: boolean
  excludeModels: string[]
  onSelect: (device: Device) => void
  onClose: () => void
}

// 검색 유연화: 한/영 상호 매핑, 공백·대소문자 무시
const SEARCH_ALIASES: Record<string, string[]> = {
  iphone: ["아이폰"],
  galaxy: ["갤럭시"],
  ipad: ["아이패드"],
  watch: ["워치", "애플워치", "갤럭시워치"],
  pro: ["프로"],
  max: ["맥스"],
  plus: ["플러스"],
  ultra: ["울트라"],
  fold: ["폴드"],
  flip: ["플립"],
  air: ["에어"],
  mini: ["미니"],
}

function normalize(s: string): string {
  return (s || "").toLowerCase().replace(/\s+/g, "")
}

// 인기 기종 시리즈 — pet_name 기준 (S26 시리즈 / iPhone 17 시리즈)
function isPopular(d: Device): boolean {
  const name = normalize(d.pet_name || "")
  const isS26 = /s26/.test(name) || /갤럭시s26/.test(name)
  const isIp17 = /iphone17|아이폰17/.test(name)
  return isS26 || isIp17
}

function buildSearchHaystack(d: Device): string {
  // pet_name + model + 영-한 alias 확장 → 전부 소문자/공백제거 상태로 결합
  const base = [d.pet_name || "", d.model || ""].join(" ")
  const norm = normalize(base)
  const aliasHits: string[] = []
  for (const [en, kos] of Object.entries(SEARCH_ALIASES)) {
    if (norm.includes(en)) aliasHits.push(...kos)
    for (const ko of kos) {
      if (norm.includes(normalize(ko))) aliasHits.push(en)
    }
  }
  return `${norm} ${aliasHits.map(normalize).join(" ")}`
}

// 이미지 URL: 직접 S3 경로 구성 (category/enColor/imageKey)
// 실패 시 thumbnail fallback
function resolveImageUrl(d: Device): string | null {
  const category = d.category
  const enColors = d.colors_en || []
  const images = d.images || {}
  if (category && enColors.length > 0) {
    for (const color of enColors) {
      const keys = images?.[color] || []
      if (keys.length > 0) {
        return `${S3}/${category}/${color}/${keys[0]}.png`
      }
    }
  }
  return d.thumbnail ?? null
}

export default function PhoneSelectModal({ open, excludeModels, onSelect, onClose }: Props) {
  const [devices, setDevices] = useState<Device[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setQuery("")
    const controller = new AbortController()
    setLoading(true)
    fetch(`${API}/api/compare/devices`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setDevices(Array.isArray(data) ? data : []))
      .catch((err) => { if (err.name !== 'AbortError') console.error('devices fetch error:', err) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [open])

  // 검색 인덱스 (query 독립) — devices 변경 시에만 재계산
  const index = useMemo(
    () => devices.map((d) => ({ device: d, hay: buildSearchHaystack(d) })),
    [devices]
  )

  const filtered = useMemo(() => {
    const q = normalize(query)
    return index
      .filter(({ device }) => !excludeModels.includes(device.model))
      .filter(({ hay }) => (q.length === 0 ? true : hay.includes(q)))
      .map((x) => x.device)
  }, [index, query, excludeModels])

  const popularDevices = useMemo(
    () =>
      devices
        .filter((d) => !excludeModels.includes(d.model) && isPopular(d)),
    [devices, excludeModels]
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
          {/* 바텀시트 — height 고정으로 검색 중 리사이즈 방지 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              margin: "0 auto", maxWidth: 440,
              background: "#fff", borderRadius: "20px 20px 0 0",
              zIndex: 201,
              height: "80vh",
              display: "flex", flexDirection: "column",
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
                placeholder="기종명 검색 (예: 아이폰, iphone, 갤럭시 s26)"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 12,
                  border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
                  fontFamily: FONT, boxSizing: "border-box",
                }}
              />
            </div>

            {/* 인기 기종 — 검색어 없을 때만 노출 */}
            {query.length === 0 && popularDevices.length > 0 && !loading && (
              <div style={{ padding: "0 16px 12px" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6b7280",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  🔥 인기 기종
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    paddingBottom: 4,
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "none",
                  }}
                >
                  {popularDevices.map((d) => {
                    const imgUrl = resolveImageUrl(d)
                    return (
                      <button
                        key={d.model}
                        onClick={() => { onSelect(d); onClose() }}
                        style={{
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 10px 6px 6px",
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 100,
                          cursor: "pointer",
                          fontFamily: FONT,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 34,
                            borderRadius: 6,
                            background: "#fff",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={d.pet_name}
                              onError={(e) => {
                                const el = e.currentTarget
                                if (d.thumbnail && el.src !== d.thumbnail) {
                                  el.src = d.thumbnail
                                } else {
                                  el.style.display = "none"
                                }
                              }}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          ) : (
                            <span style={{ fontSize: 14 }}>📱</span>
                          )}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>
                          {d.pet_name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

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
                filtered.map((device) => {
                  const imgUrl = resolveImageUrl(device)
                  return (
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
                        {imgUrl ? (
                          <img src={imgUrl} alt={device.pet_name}
                            onError={(e) => {
                              const el = e.currentTarget
                              if (device.thumbnail && el.src !== device.thumbnail) {
                                el.src = device.thumbnail
                              } else {
                                el.style.display = "none"
                              }
                            }}
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
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
