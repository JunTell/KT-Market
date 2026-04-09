// 주문서 공통 컴포넌트 — OrderFlowBottomSheet, OrderSummaryCard, OrderSummarySheet 에서 공유

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export const FONT = '"Pretendard"'

// ─── 할부이자 표시 토글 동기화 훅 ──────────────────────────────────────
const INSTALLMENT_INTEREST_STORAGE_KEY = "phone_installment_interest_visible"
const INSTALLMENT_INTEREST_EVENT = "phone-installment-interest-change"

export function useInstallmentInterest(): [boolean, (v: boolean) => void] {
    const [showInterest, setShowInterest] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return

        const readValue = () => {
            const saved = window.sessionStorage.getItem(INSTALLMENT_INTEREST_STORAGE_KEY)
            setShowInterest(saved === "true")
        }

        const handleSync = () => readValue()
        const handleStorage = (event: StorageEvent) => {
            if (event.key === INSTALLMENT_INTEREST_STORAGE_KEY) readValue()
        }

        readValue()
        window.addEventListener(INSTALLMENT_INTEREST_EVENT, handleSync)
        window.addEventListener("storage", handleStorage)

        return () => {
            window.removeEventListener(INSTALLMENT_INTEREST_EVENT, handleSync)
            window.removeEventListener("storage", handleStorage)
        }
    }, [])

    const updateShowInterest = (nextValue: boolean) => {
        setShowInterest(nextValue)
        if (typeof window === "undefined") return
        window.sessionStorage.setItem(INSTALLMENT_INTEREST_STORAGE_KEY, String(nextValue))
        window.dispatchEvent(new Event(INSTALLMENT_INTEREST_EVENT))
    }

    return [showInterest, updateShowInterest]
}

// ─── 숫자 카운트 애니메이션 훅 (easeOutCubic, ~1초) ──────────────────
export function useAnimatedNumber(target: number, duration = 1000) {
    const [display, setDisplay] = useState(target)
    const currentRef = useRef(target)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        const from = currentRef.current
        const to = target
        if (from === to) return
        const startTime = performance.now()
        const tick = (now: number) => {
            const elapsed = now - startTime
            const t = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            const value = Math.round(from + (to - from) * eased)
            currentRef.current = value
            setDisplay(value)
            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick)
            } else {
                currentRef.current = to
                setDisplay(to)
            }
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }, [target, duration])

    return display
}

// ─── 토글 스위치 ──────────────────────────────────────────────────────
export const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <motion.div
        onClick={() => onChange(!checked)}
        style={{
            width: 44, height: 26, borderRadius: 13,
            padding: 3,
            display: "flex", alignItems: "center",
            cursor: "pointer", flexShrink: 0,
        }}
        animate={{ backgroundColor: checked ? "#0055FF" : "#D1D5DB" }}
        initial={false}
        transition={{ duration: 0.2 }}
    >
        <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
                width: 20, height: 20, borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                marginLeft: checked ? "auto" : 0,
            }}
        />
    </motion.div>
)

// ─── 툴팁 ─────────────────────────────────────────────────────────────
export const Tooltip = ({ text, children, zIndex = 10100 }: { text: string; children: React.ReactNode; zIndex?: number }) => {
    const [visible, setVisible] = useState(false)
    return (
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <span
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onClick={() => setVisible((v) => !v)}
                style={{ cursor: "pointer", lineHeight: 1 }}
            >
                {children}
            </span>
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        style={{
                            position: "absolute",
                            bottom: "calc(100% + 6px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "#1F2937",
                            color: "#FFFFFF",
                            fontSize: 11,
                            padding: "6px 10px",
                            borderRadius: 6,
                            whiteSpace: "nowrap",
                            zIndex,
                            pointerEvents: "none",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── 물음표 아이콘 ────────────────────────────────────────────────────
export const QuestionIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6.5" stroke="#9CA3AF" />
        <text x="7" y="11" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontWeight="600">?</text>
    </svg>
)

// ─── 스켈레톤 행 ──────────────────────────────────────────────────────
export const SkeletonRow = ({ delay = 0, width = "45%" }: { delay?: number; width?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10 }}>
        <motion.div style={{ width: "50%", height: 13, borderRadius: 4, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }} />
        <motion.div style={{ width, height: 13, borderRadius: 4, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: delay + 0.08 }} />
    </div>
)

// ─── 구분선 ──────────────────────────────────────────────────────────
export const Dashed = () => (
    <div style={{ width: "100%", height: 0, borderTop: "1.5px dashed #E5E7EB", margin: "10px 0 12px" }} />
)

// ─── 일반 행 ─────────────────────────────────────────────────────────
export const Row = ({
    label, value, bold = false, large = false,
    labelColor = "#374151", valueColor = "#111827", tooltip,
}: {
    label: string; value: string; bold?: boolean; large?: boolean
    labelColor?: string; valueColor?: string; tooltip?: string
}) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: large ? 15 : 14, fontWeight: bold ? 700 : 400, color: labelColor }}>
                {label}
            </span>
            {tooltip && <Tooltip text={tooltip}><QuestionIcon /></Tooltip>}
        </div>
        <span style={{ fontSize: large ? 17 : 14, fontWeight: bold ? 700 : 500, color: valueColor }}>
            {value}
        </span>
    </div>
)

// ─── 빨간 할인 행 ─────────────────────────────────────────────────────
export const RedRow = ({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: "#EF4444" }}>{label}</span>
            {tooltip && <Tooltip text={tooltip}><QuestionIcon /></Tooltip>}
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#EF4444" }}>{value}</span>
    </div>
)

// ─── 카드 컨테이너 ────────────────────────────────────────────────────
export const Card = ({ children, marginBottom = 0 }: { children: React.ReactNode; marginBottom?: number }) => (
    <div style={{
        width: "100%", backgroundColor: "#FFFFFF",
        border: "1.5px solid #E5E7EB", borderRadius: 12,
        padding: "16px 18px 6px", boxSizing: "border-box",
        marginBottom,
    }}>
        {children}
    </div>
)

// ─── 섹션 헤더 ────────────────────────────────────────────────────────
export const SectionHeader = ({ label, value, description }: { label: string; value?: string; description?: string }) => (
    <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{label}</span>
            {value && <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{value}</span>}
        </div>
        {description && (
            <span style={{ fontSize: 12, color: "#9CA3AF", display: "block", marginTop: 2 }}>
                {description}
            </span>
        )}
    </div>
)
