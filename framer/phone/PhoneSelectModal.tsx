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
