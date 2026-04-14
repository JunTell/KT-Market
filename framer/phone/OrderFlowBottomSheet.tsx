// withOrderSheet override와 함께 사용
// 하단 고정 BottomSheet — 신청하기 버튼 클릭 시 주문/상담 플로우 실행

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    FONT,
    useAnimatedNumber,
    useInstallmentInterest,
} from "https://framer.com/m/OrderComponents-QLDYR7.js@hhiQilDauXuXfkuhoANY"

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
        installmentPaymentDescription = "분할 상환 수수료 5.9% 포함",
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
            backgroundColor: "#FFFFFF",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -4px 28px rgba(0,0,0,0.13)",
            fontFamily: FONT,
        }}>
            {/*
            월 통신요금 + 월 할부금
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: "14px 16px 8px",
                backgroundColor: "#F9FAFB",
                borderRadius: 12,
                padding: "12px 14px",
                boxSizing: "border-box" as const,
            }}>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 2, flex: 1 }}>
                    <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>월 통신요금</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                        {Math.round(planAfterDiscount).toLocaleString()}원
                    </span>
                </div>
                <span style={{ fontSize: 16, color: "#D1D5DB", fontWeight: 400, flexShrink: 0 }}>+</span>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 2, flex: 1 }}>
                    <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>월 할부금</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                        {Math.round(displayInstallment).toLocaleString()}원
                    </span>
                </div>
                <span style={{ fontSize: 16, color: "#D1D5DB", fontWeight: 400, flexShrink: 0 }}>=</span>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 2, alignItems: "flex-end" }}>
                    <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>월 예상</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0055FF", fontFamily: FONT }}>
                        {displayTotal.toLocaleString()}원
                    </span>
                </div>
            </div>
            */}

            {/* 월 예상 금액 행 */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px 10px",
            }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                    <span style={{ fontSize: 15, color: "#374151", fontWeight: 600, fontFamily: FONT }}>
                        월 예상 금액
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", fontFamily: FONT }}>부가세 포함</span>
                        {installment > 0 && (
                            <>
                                <span style={{ fontSize: 11, color: "#D1D5DB", fontFamily: FONT }}>·</span>
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={showInterest ? "interest-on" : "interest-off"}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ fontSize: 12, fontWeight: 500, color: "#9CA3AF", fontFamily: FONT }}
                                    >
                                        {showInterest ? "할부이자 포함" : "할부이자 미포함"}
                                    </motion.span>
                                </AnimatePresence>
                            </>
                        )}
                    </div>
                </div>
                <motion.span
                    style={{
                        fontSize: 21,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: direction === "up" ? "#EF4444" : direction === "down" ? "#0055FF" : "#111827",
                        transition: "color 0.4s ease",
                        fontVariantNumeric: "tabular-nums",
                        fontFamily: FONT,
                    }}
                >
                    {animatedPayment.toLocaleString()}원
                </motion.span>
            </div>

            {/* 버튼 행: 전화 | 카카오톡 상담 | 입고 알림 */}
            <div style={{
                display: "flex", gap: 8,
                padding: "0 16px",
                paddingBottom: "calc(16px + env(safe-area-inset-bottom, 10px))",
            }}>
                {/* 전화 아이콘 버튼 */}
                <button
                    onClick={handlePhoneClick}
                    style={{
                        width: 45, height: 45, borderRadius: 14,
                        border: "1.5px solid #E5E7EB",
                        backgroundColor: "#FFFFFF",
                        cursor: "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                        <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z"
                            fill="#3B82F6" />
                    </svg>
                </button>

                {/* 카카오톡 상담 버튼 */}
                <a
                    href={kakaoTalkLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        flex: 1, height: 45, borderRadius: 14,
                        border: "none", backgroundColor: "#FEE500",
                        color: "#191919", fontSize: 14, fontWeight: 700,
                        cursor: "pointer", fontFamily: FONT,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        textDecoration: "none",
                        gap: 6,
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                        <ellipse cx="9" cy="8.1" rx="7.5" ry="6.3" fill="#191919" />
                        <ellipse cx="9" cy="13.5" rx="3" ry="1.8" fill="#FEE500" />
                        <path d="M5.4 7.2c0-.5.4-.9.9-.9s.9.4.9.9-.4.9-.9.9-.9-.4-.9-.9zM8.1 7.2c0-.5.4-.9.9-.9s.9.4.9.9-.4.9-.9.9-.9-.4-.9-.9zM10.8 7.2c0-.5.4-.9.9-.9s.9.4.9.9-.4.9-.9.9-.9-.4-.9-.9z" fill="#FEE500" />
                    </svg>
                    카카오톡 상담
                </a>

                {/* 신청/입고알림 버튼 */}
                <button
                    onClick={isSoldOut ? handleRestockClick : handleFormLink}
                    style={{
                        flex: 1, height: 45, borderRadius: 14,
                        border: "none", backgroundColor: "#EF4444",
                        color: "#FFFFFF", fontSize: 18, fontWeight: 700,
                        cursor: "pointer", fontFamily: FONT,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    {isSoldOut ? "입고 알림" : "신청하기"}
                </button>
            </div>
        </div>
    )

    return (
        <div style={{ width: "100%", minHeight: 148 }}>
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
    installmentPaymentDescription: { type: ControlType.String, title: "할부 설명", defaultValue: "분할 상환 수수료 5.9% 포함" },
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
