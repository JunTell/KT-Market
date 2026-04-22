// withOrderSheet override와 함께 사용
// 하단 고정 BottomSheet — 신청하기 버튼 클릭 시 주문/상담 플로우 실행

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    FONT,
    useAnimatedNumber,
    useInstallmentInterest,
} from "https://framer.com/m/OrderComponents-QLDYR7.js@sKK3V4EokH71sr4CS4oo"

// ─── 긴급 타이머 (15분) ───────────────────────────────────────────────────────
// 15분 = 휴대폰 구매 결정에 적합한 고려 시간 (너무 짧지 않고 충분한 긴박감)
const TIMER_DURATION = 15 * 60 // 900초
const TIMER_KEY = "ktmarket_urgency_timer_start"

function useUrgencyTimer(): number | null {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

    useEffect(() => {
        if (typeof window === "undefined") return

        const stored = localStorage.getItem(TIMER_KEY)
        const now = Date.now()

        let startTime: number
        if (stored) {
            startTime = parseInt(stored, 10)
        } else {
            startTime = now
            localStorage.setItem(TIMER_KEY, String(startTime))
        }

        const calc = () => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            return Math.max(0, TIMER_DURATION - elapsed)
        }

        setSecondsLeft(calc())

        const interval = setInterval(() => {
            const remaining = calc()
            setSecondsLeft(remaining)
            if (remaining === 0) clearInterval(interval)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return secondsLeft
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 148
 */
export default function OrderFlowBottomSheet(props) {
    const {
        installment = 24,
        installmentPaymentTitle = "월 할부원금 (24개월)",
        installmentPaymentDescription = "할부 이자 포함",
        installmentPrincipal = 0,
        installmentPayment = "0원",
        devicePrice = 0,
        disclosureSubsidy = 0,
        ktmarketSubsidy = 0,
        promotionDiscount = 0,
        migrationSubsidy = 0,
        guaranteedReturnPrice = 0,
        specialPrice = 0,
        doubleStorageDiscount = 0,
        plan = "",
        planPrice = 0,
        planDiscountAmount = 0,
        totalMonthPlanPrice = 0,
        totalMonthPayment = 0,
        discount = "공통지원금",
        isLoading = false,
        devicePetName = "",
        deviceImage = "",
        deviceColor = "",
        deviceCapacity = "",
        formLink = "",
        phoneOrderLink = "tel:15880661",
        kakaoTalkLink = "http://pf.kakao.com/_HfItxj/chat",
        onKakaoOrderClick,
        onSaveOrderSession,
        onPhoneClick,
        onRestockClick,
        isSoldOut = false,
        installmentPaymentNoInterest = 0,
        totalMonthPaymentNoInterest = 0,
    } = props

    const [mounted, setMounted] = useState(false)
    const [showInterest] = useInstallmentInterest()
    const secondsLeft = useUrgencyTimer()

    // ── 금액 변동 애니메이션 ──
    const roundedPayment = Math.round(
        showInterest
            ? totalMonthPayment
            : (totalMonthPaymentNoInterest > 0 ? totalMonthPaymentNoInterest : totalMonthPayment)
    )
    const prevPaymentRef = useRef(roundedPayment)
    const [direction, setDirection] = useState<"up" | "down" | null>(null)
    const animatedPayment = useAnimatedNumber(roundedPayment)

    useEffect(() => {
        if (!mounted) return
        if (roundedPayment !== prevPaymentRef.current) {
            setDirection(roundedPayment > prevPaymentRef.current ? "up" : "down")
            prevPaymentRef.current = roundedPayment
            const t = setTimeout(() => setDirection(null), 1200)
            return () => clearTimeout(t)
        }
    }, [roundedPayment])

    useEffect(() => { setMounted(true) }, [])

    const handleFormLink = () => {
        if (typeof onKakaoOrderClick === "function") {
            onKakaoOrderClick()
        } else {
            onSaveOrderSession?.()
            if (typeof window !== "undefined") {
                window.location.href = "/phone/user-info"
            }
        }
    }

    if (!mounted) return <div style={{ width: "100%", minHeight: 148 }} />

    const handlePhoneClick = () => {
        if (typeof onPhoneClick === "function") {
            onPhoneClick()
        } else {
            if (typeof window !== "undefined") {
                window.location.href = phoneOrderLink
            }
        }
    }

    const handleRestockClick = () => {
        if (typeof onRestockClick === "function") {
            onRestockClick()
        }
    }

    /*
    const planAfterDiscount = totalMonthPlanPrice > 0 ? totalMonthPlanPrice : planPrice - planDiscountAmount
    const rawInstallment = installment === 0 ? 0 : totalMonthPayment - planAfterDiscount
    const noInterestInstallment = installmentPaymentNoInterest > 0
        ? installmentPaymentNoInterest
        : rawInstallment
    const displayInstallment = showInterest
        ? rawInstallment
        : (installment === 0 ? 0 : noInterestInstallment)
    const displayTotal = Math.round(planAfterDiscount + displayInstallment)
    */

    const bar = (
        <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto",
            width: "100%", maxWidth: 440,
            zIndex: 120,
            fontFamily: FONT,
        }}>
            {/* 말풍선 — 바 바깥 위에 배치 (clipping 방지) */}
            {mounted && secondsLeft !== null && !isSoldOut && (
                <motion.div
                    key={secondsLeft > 0 ? "timer" : "default"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{
                        opacity: 1,
                        y: [0, -6, 0],
                    }}
                    transition={{
                        opacity: { duration: 0.3 },
                        y: {
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        },
                    }}
                    onClick={handleFormLink}
                    style={{
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "center",
                        margin: "0 auto -12px",
                        width: "fit-content",
                        maxWidth: "90%",
                        position: "relative",
                        zIndex: 121,
                    }}
                >
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                        padding: "10px 20px",
                        borderRadius: 16,
                        backgroundColor: "#4F7FFF",
                        boxShadow: "0 4px 16px rgba(79,127,255,0.35)",
                        fontFamily: FONT,
                    }}>
                        {secondsLeft > 0 ? (
                            <>
                                <span style={{
                                    fontSize: 18, fontWeight: 800,
                                    color: "#FFEB3B",
                                    fontVariantNumeric: "tabular-nums",
                                    letterSpacing: -0.3,
                                    lineHeight: 1.3,
                                    fontFamily: FONT,
                                }}>
                                    {formatTime(secondsLeft)}
                                </span>
                                <span style={{
                                    fontSize: 13, fontWeight: 600,
                                    color: "#FFFFFF",
                                    letterSpacing: -0.2,
                                    lineHeight: 1.3,
                                    fontFamily: FONT,
                                }}>
                                    시간 내 신청 시 악세사리 3종 추가 증정
                                </span>
                            </>
                        ) : (
                            <span style={{
                                fontSize: 13, fontWeight: 700,
                                color: "#FFFFFF",
                                letterSpacing: -0.2,
                                lineHeight: 1.4,
                                fontFamily: FONT,
                                textAlign: "center",
                            }}>
                                지금 주문하면 악세사리 3종 추가 증정!
                            </span>
                        )}
                    </div>
                    {/* 말풍선 꼬리 */}
                    <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: "8px solid transparent",
                        borderRight: "8px solid transparent",
                        borderTop: "8px solid #4F7FFF",
                    }} />
                </motion.div>
            )}

            {/* 하단 바 */}
            <div style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "20px 20px 0 0",
                boxShadow: "0 -2px 12px rgba(0,0,0,0.10)",
            }}>
                <div style={{
                    display: "flex", alignItems: "center",
                    padding: "14px 16px",
                    paddingBottom: "calc(14px + env(safe-area-inset-bottom, 10px))",
                    gap: 12,
                }}>
                    {/* 왼쪽: 가격 정보 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{
                                fontSize: 13, fontWeight: 500,
                                color: "#868E96",
                                letterSpacing: -0.2, lineHeight: 1.4,
                                fontFamily: FONT,
                            }}>
                                월 예상 금액
                            </span>
                        </div>
                        <motion.span
                            style={{
                                fontSize: 22, fontWeight: 800, lineHeight: 1.2,
                                letterSpacing: -0.5,
                                color: direction === "up" ? "#EF4444" : direction === "down" ? "#3B82F6" : "#24292E",
                                transition: "color 0.4s ease",
                                fontVariantNumeric: "tabular-nums",
                                fontFamily: FONT,
                            }}
                        >
                            {animatedPayment.toLocaleString()}원
                        </motion.span>
                        <span style={{
                            fontSize: 8, fontWeight: 400,
                            color: "#ADB5BD",
                            letterSpacing: -0.1, lineHeight: 1.3,
                            fontFamily: FONT,
                        }}>
                            부가세 포함 {installment > 0 ? (showInterest ? "/ 할부이자 포함" : "/ 할부이자 미포함") : ""}
                        </span>
                    </div>

                    {/* 오른쪽: 신청하기 버튼 */}
                    <div style={{ flex: 1, flexShrink: 0 }}>
                        <button
                            onClick={isSoldOut ? handleRestockClick : handleFormLink}
                            style={{
                                width: "100%", height: 54, borderRadius: 14,
                                border: "none",
                                backgroundColor: isSoldOut ? "#3F4750" : "#EF4444",
                                color: "#FFFFFF",
                                fontSize: 17, fontWeight: 700,
                                letterSpacing: -0.3, lineHeight: 1,
                                cursor: "pointer", fontFamily: FONT,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            {isSoldOut ? "입고 알림" : "신청하기"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div style={{ width: "100%", minHeight: 86 }}>
            {/* portal 없이 직접 렌더링 — Framer 캔버스에서 portal은 에디터 외부 body에 붙음 */}
            {bar}
        </div>
    )
}

addPropertyControls(OrderFlowBottomSheet, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    // 기기 정보 (preview용 — 실제 사용 시 withOrderSheet이 주입)
    devicePetName: { type: ControlType.String, title: "기기명", defaultValue: "갤S26 울트라" },
    deviceImage: { type: ControlType.Image, title: "기기 이미지" },
    deviceColor: { type: ControlType.String, title: "색상", defaultValue: "티타늄 그레이" },
    deviceCapacity: { type: ControlType.String, title: "용량", defaultValue: "256GB" },
    // 주문서 데이터 (preview용)
    installmentPaymentTitle: { type: ControlType.String, title: "할부 타이틀", defaultValue: "월 할부원금 (24개월)" },
    installmentPaymentDescription: { type: ControlType.String, title: "할부 설명", defaultValue: "할부 이자 포함" },
    installmentPayment: { type: ControlType.String, title: "월 할부금", defaultValue: "0원" },
    installment: { type: ControlType.Number, title: "할부", defaultValue: 24, min: 0, max: 48, step: 1 },
    devicePrice: { type: ControlType.Number, title: "출고가", defaultValue: 0 },
    disclosureSubsidy: { type: ControlType.Number, title: "공시지원금", defaultValue: 0 },
    ktmarketSubsidy: { type: ControlType.Number, title: "KT마켓 특가", defaultValue: 0 },
    promotionDiscount: { type: ControlType.Number, title: "디바이스 추가지원금", defaultValue: 0 },
    migrationSubsidy: { type: ControlType.Number, title: "번호이동 지원금", defaultValue: 0 },
    guaranteedReturnPrice: { type: ControlType.Number, title: "미리보상 할인", defaultValue: 0 },
    specialPrice: { type: ControlType.Number, title: "스페셜 할인", defaultValue: 0 },
    doubleStorageDiscount: { type: ControlType.Number, title: "더블스토리지 할인", defaultValue: 0 },
    installmentPrincipal: { type: ControlType.Number, title: "할부원금", defaultValue: 0 },
    plan: { type: ControlType.String, title: "요금제명", defaultValue: "5G 스탠다드" },
    planPrice: { type: ControlType.Number, title: "요금제 금액", defaultValue: 0 },
    planDiscountAmount: { type: ControlType.Number, title: "요금제 할인액", defaultValue: 0 },
    totalMonthPlanPrice: { type: ControlType.Number, title: "월 통신요금(할인 후)", defaultValue: 0 },
    totalMonthPayment: { type: ControlType.Number, title: "월 예상 금액", defaultValue: 0 },
    isSoldOut: { type: ControlType.Boolean, title: "품절", defaultValue: false },
    discount: {
        type: ControlType.Enum, title: "할인 유형",
        options: ["공통지원금", "선택약정할인"], defaultValue: "공통지원금",
    },
    // CTA 링크
    formLink: { type: ControlType.String, title: "신청서 링크", defaultValue: "" },
    phoneOrderLink: { type: ControlType.String, title: "전화 주문 링크", defaultValue: "tel:15880661" },
    kakaoTalkLink: { type: ControlType.String, title: "카카오톡 채널 링크", defaultValue: "http://pf.kakao.com/_HfItxj/chat" },
})
