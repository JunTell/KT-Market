// withPriceCard override와 함께 사용
// 요금제 변경 시 가격 카운트 애니메이션 + 스켈레톤 UI + 월 할부 팝업

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─────────────────────────────────────────
// 숫자 카운트 애니메이션 훅 (easeOutCubic, ~1초)
// ─────────────────────────────────────────
function useAnimatedNumber(target: number, duration = 1000) {
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
            const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
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
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [target, duration])

    return display
}

// ─────────────────────────────────────────
// 스켈레톤
// ─────────────────────────────────────────
const Skeleton = ({ width, height, style = {} }: { width: string | number; height: number; style?: React.CSSProperties }) => (
    <motion.div
        style={{
            width,
            height,
            borderRadius: "8px",
            backgroundColor: "#E5E7EB",
            ...style,
        }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
)

// ─────────────────────────────────────────
// 월 할부 팝업 (바텀시트)
// ─────────────────────────────────────────
function MonthlyPopup({
    finalPrice,
    monthlyPayment,
    installment,
    planPrice,
    planDiscountAmount,
    onClose,
}: {
    finalPrice: number
    monthlyPayment: number
    installment: number
    planPrice: number
    planDiscountAmount: number
    onClose: () => void
}) {
    const totalMonthly = monthlyPayment + (planPrice - planDiscountAmount)

    const rows = [
        { label: "할부원금", value: `${finalPrice.toLocaleString()}원`, bold: false },
        {
            label: `월 단말 할부금 (${installment}개월, 5.9%)`,
            value: `${monthlyPayment.toLocaleString()}원`,
            bold: true,
        },
        {
            label: `월 요금제 (할인 후)`,
            value: `${(planPrice - planDiscountAmount).toLocaleString()}원`,
            bold: false,
        },
    ]

    return (
        <AnimatePresence>
            {/* 딤 배경 */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    zIndex: 9998,
                }}
            />
            {/* 바텀시트 */}
            <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    margin: "0 auto",
                    maxWidth: "440px",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#FFFFFF",
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                    padding: "28px 20px 36px",
                    zIndex: 9999,
                    boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
                }}
            >
                {/* 핸들 */}
                <div
                    style={{
                        width: "40px",
                        height: "4px",
                        borderRadius: "9999px",
                        backgroundColor: "#E5E7EB",
                        margin: "0 auto 24px",
                    }}
                />

                <p style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>
                    월 납부금 안내
                </p>

                {/* 행 목록 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                    {rows.map((row) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", color: "#6B7280" }}>{row.label}</span>
                            <span style={{ fontSize: "14px", fontWeight: row.bold ? 700 : 400, color: "#111827" }}>
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 구분선 */}
                <div style={{ height: "1px", backgroundColor: "#F3F4F6", marginBottom: "16px" }} />

                {/* 합계 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>월 예상 납부금</span>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: "#0055FF" }}>
                        {totalMonthly.toLocaleString()}원
                    </span>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: "100%",
                        height: "52px",
                        backgroundColor: "#0055FF",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    확인
                </button>
            </motion.div>
        </AnimatePresence>
    )
}

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function PhonePriceCard(props) {
    const {
        finalPrice = 0,
        originPrice = 0,
        discountRate = 0,
        monthlyPayment = 0,
        installment = 24,
        planPrice = 0,
        planDiscountAmount = 0,
        isLoading = false,
        formLink = "",
    } = props

    const [isMounted, setIsMounted] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    // 가격이 올라가는지 내려가는지 추적 (색상 힌트용)
    const prevFinalPrice = useRef(finalPrice)
    const [direction, setDirection] = useState<"up" | "down" | null>(null)

    useEffect(() => { setIsMounted(true) }, [])

    useEffect(() => {
        if (!isMounted) return
        if (finalPrice !== prevFinalPrice.current) {
            setDirection(finalPrice > prevFinalPrice.current ? "up" : "down")
            prevFinalPrice.current = finalPrice
            const t = setTimeout(() => setDirection(null), 1200)
            return () => clearTimeout(t)
        }
    }, [finalPrice])

    const animatedPrice = useAnimatedNumber(finalPrice, 1000)

    // 가격 색상: 오를 때 주황, 내릴 때 파랑, 평상시 검정
    const priceColor =
        direction === "up" ? "#F59E0B" :
        direction === "down" ? "#0055FF" :
        "#111827"

    if (!isMounted) return <div style={{ width: "100%", height: "120px" }} />

    // ── 스켈레톤 ──
    if (isLoading) {
        return (
            <div style={{ ...wrapperStyle, gap: "16px" }}>
                {/* 가격 행 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Skeleton width="55%" height={28} />
                    <Skeleton width="12%" height={18} />
                </div>
                {/* 서브텍스트 */}
                <Skeleton width="70%" height={16} style={{ margin: "0 auto" }} />
                {/* 버튼 */}
                <Skeleton width="100%" height={48} />
            </div>
        )
    }

    // ── 실제 렌더 ──
    return (
        <>
            <div style={wrapperStyle}>
                {/* ── 가격 행 ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#0055FF" }}>최저가</span>
                        <motion.span
                            key={animatedPrice}
                            style={{
                                fontSize: "26px",
                                fontWeight: 800,
                                color: priceColor,
                                transition: "color 0.4s ease",
                                letterSpacing: "-0.5px",
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {animatedPrice.toLocaleString()}
                        </motion.span>
                        <span style={{ fontSize: "15px", fontWeight: 500, color: "#374151" }}>원</span>
                    </div>

                    {/* 월 > 버튼 */}
                    <button
                        onClick={() => setShowPopup(true)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 0 4px 8px",
                            color: "#6B7280",
                            fontSize: "13px",
                            fontWeight: 500,
                        }}
                    >
                        월
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── 월 할부 팝업 ── */}
            {showPopup && (
                <MonthlyPopup
                    finalPrice={finalPrice}
                    monthlyPayment={monthlyPayment}
                    installment={installment}
                    planPrice={planPrice}
                    planDiscountAmount={planDiscountAmount}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </>
    )
}

const wrapperStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    boxSizing: "border-box",
    backgroundColor: "#FFFFFF",
}

addPropertyControls(PhonePriceCard, {
    isLoading: {
        type: ControlType.Boolean,
        title: "Loading",
        defaultValue: false,
    },
    finalPrice: {
        type: ControlType.Number,
        title: "최저가 (원)",
        defaultValue: 857400,
    },
    originPrice: {
        type: ControlType.Number,
        title: "출고가 (원)",
        defaultValue: 1200000,
    },
    discountRate: {
        type: ControlType.Number,
        title: "할인율 (%)",
        defaultValue: 28,
    },
    monthlyPayment: {
        type: ControlType.Number,
        title: "월 할부금 (원)",
        defaultValue: 38000,
    },
    installment: {
        type: ControlType.Number,
        title: "할부 개월",
        defaultValue: 24,
    },
    planPrice: {
        type: ControlType.Number,
        title: "요금제 가격 (원)",
        defaultValue: 90000,
    },
    planDiscountAmount: {
        type: ControlType.Number,
        title: "요금제 할인 (원)",
        defaultValue: 0,
    },
    formLink: {
        type: ControlType.String,
        title: "전용 조건 링크",
        defaultValue: "",
    },
})
