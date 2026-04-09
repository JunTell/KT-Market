// withPriceCard override와 함께 사용
// 요금제 변경 시 가격 카운트 애니메이션 + 스켈레톤 UI + 월 할부 팝업 + 최종 신청서 모달

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { createPortal } from "react-dom"
import {
    FONT, useAnimatedNumber, ToggleSwitch, Tooltip as OSTooltip, QuestionIcon as OSQuestionIcon,
    SkeletonRow as OSSkeletonRow, Dashed as OSDashed,
    Row as OSRow, RedRow as OSRedRow, Card as OSCard, SectionHeader as OSSectionHeader,
    useInstallmentInterest,
} from "https://framer.com/m/OrderComponents-QLDYR7.js@B8HOuK0Vr7pFdSYgTLEK"

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
// OrderSheet 내용 렌더러 (모달 내부용)
// ─────────────────────────────────────────
function OrderSheetContent({
    installment,
    installmentPaymentTitle,
    installmentPaymentDescription,
    installmentPrincipal,
    installmentPayment,
    installmentPaymentNoInterest = 0,
    totalMonthPaymentNoInterest = 0,
    showInterest = true,
    devicePrice,
    disclosureSubsidy,
    ktmarketSubsidy,
    promotionDiscount,
    migrationSubsidy,
    guaranteedReturnPrice,
    specialPrice,
    doubleStorageDiscount,
    plan,
    planPrice,
    planDiscountAmount,
    totalMonthPlanPrice,
    totalMonthPayment,
    discount,
    isLoading,
}: {
    installment: number
    installmentPaymentTitle: string
    installmentPaymentDescription: string
    installmentPrincipal: number
    installmentPayment: string | number
    installmentPaymentNoInterest?: number
    totalMonthPaymentNoInterest?: number
    showInterest?: boolean
    devicePrice: number
    disclosureSubsidy: number
    ktmarketSubsidy: number
    promotionDiscount: number
    migrationSubsidy: number
    guaranteedReturnPrice: number
    specialPrice: number
    doubleStorageDiscount: number
    plan: string
    planPrice: number
    planDiscountAmount: number
    totalMonthPlanPrice: number
    totalMonthPayment: number
    discount: string
    isLoading: boolean
}) {
    const planAfterDiscount = totalMonthPlanPrice > 0 ? totalMonthPlanPrice : planPrice - planDiscountAmount
    const planDiscountLabel = discount === "선택약정할인"
        ? `요금할인 25%${installment > 0 ? ` (${installment}개월)` : ""}`
        : ""
    const planTooltip = discount === "선택약정할인"
        ? `월 요금제(${planPrice.toLocaleString()}원) × 25% 선택약정 할인 적용`
        : `공통지원금 선택 시 요금제 할인 없음`
    const installmentPaymentStr = typeof installmentPayment === "number"
        ? `${installmentPayment.toLocaleString()}원`
        : installmentPayment

    // 토글 기준 표시값 분기
    const displayInstallmentValue = (installment === 0 || showInterest)
        ? installmentPaymentStr
        : `${installmentPaymentNoInterest.toLocaleString()}원`
    const displayDescription = showInterest ? installmentPaymentDescription : ""
    const displayTotalMonthPayment = showInterest
        ? Math.round(totalMonthPayment)
        : installment === 0
            ? Math.round(totalMonthPayment)
            : totalMonthPaymentNoInterest

    if (isLoading) {
        return (
            <OSCard>
                <OSSkeletonRow delay={0} />
                <OSSkeletonRow delay={0.1} />
                <OSSkeletonRow delay={0.2} />
                <OSSkeletonRow delay={0.3} width="35%" />
            </OSCard>
        )
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* 카드 1: 월 할부원금 */}
            <OSCard>
                <OSSectionHeader
                    label={installmentPaymentTitle}
                    value={displayInstallmentValue}
                    description={displayDescription}
                />
                <OSRow label="출고가" value={`${devicePrice.toLocaleString()}원`} />
                {disclosureSubsidy > 0 && (
                    <OSRedRow label="공시지원금" value={`-${disclosureSubsidy.toLocaleString()}원`} tooltip="이동통신사가 공시한 단말기 지원금" />
                )}
                {ktmarketSubsidy > 0 && (
                    <OSRedRow label="KT마켓 단독지원금" value={`-${ktmarketSubsidy.toLocaleString()}원`} tooltip="KT마켓에서만 제공하는 단독 지원금" />
                )}
                {promotionDiscount > 0 && (
                    <OSRedRow label="디바이스 추가지원금(단독)" value={`-${promotionDiscount.toLocaleString()}원`} tooltip="KT마켓 단독 프로모션 추가 지원금" />
                )}
                {migrationSubsidy > 0 && (
                    <OSRedRow label="번호이동 지원금" value={`- ${migrationSubsidy.toLocaleString()}원`} />
                )}
                {guaranteedReturnPrice > 0 && (
                    <OSRedRow label="미리보상 할인" value={`-${guaranteedReturnPrice.toLocaleString()}원`} tooltip="미리보상 프로그램 적용 시 단말기 가격의 50% 할인" />
                )}
                {specialPrice > 0 && (
                    <OSRedRow label="스페셜 할인" value={`-${specialPrice.toLocaleString()}원`} />
                )}
                {doubleStorageDiscount > 0 && (
                    <OSRedRow label="더블스토리지 할인" value={`-${doubleStorageDiscount.toLocaleString()}원`} />
                )}
                <OSDashed />
                <OSRow label="할부원금" value={`${(installment === 0 ? 0 : installmentPrincipal).toLocaleString()}원`} bold large />
            </OSCard>

            {/* 카드 2: 월 통신요금 */}
            <OSCard>
                <OSSectionHeader label="월 통신요금" description="결합 할인 또는 복지할인은 제외된 금액" />
                {plan && (
                    <OSRow label={plan} value={`월 ${planPrice.toLocaleString()}원`} />
                )}
                {discount === "선택약정할인" && planDiscountAmount > 0 && (
                    <OSRedRow label={planDiscountLabel} value={`-${planDiscountAmount.toLocaleString()}원`} tooltip={planTooltip} />
                )}
                <OSDashed />
                <OSRow label="월 통신요금" value={`${planAfterDiscount.toLocaleString()}원`} bold large />
            </OSCard>

            {/* 카드 3: 월 예상 금액 */}
            <div style={{
                width: "100%",
                backgroundColor: "#F9FAFB",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: "16px 18px",
                boxSizing: "border-box" as const,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#374151" }}>월 예상 금액</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#0055FF" }}>
                    {displayTotalMonthPayment.toLocaleString()}원
                </span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────
// 주문서 센터 모달
// ─────────────────────────────────────────
function OrderSheetModal({
    onClose,
    showInterest,
    onShowInterestChange,
    ...sheetProps
}: {
    onClose: () => void
    showInterest: boolean
    onShowInterestChange: (v: boolean) => void
    installment: number
    installmentPaymentTitle: string
    installmentPaymentDescription: string
    installmentPrincipal: number
    installmentPayment: string | number
    installmentPaymentNoInterest?: number
    totalMonthPaymentNoInterest?: number
    devicePrice: number
    disclosureSubsidy: number
    ktmarketSubsidy: number
    promotionDiscount: number
    migrationSubsidy: number
    guaranteedReturnPrice: number
    specialPrice: number
    doubleStorageDiscount: number
    plan: string
    planPrice: number
    planDiscountAmount: number
    totalMonthPlanPrice: number
    totalMonthPayment: number
    discount: string
    isLoading: boolean
}) {

    const modal = (
        <AnimatePresence>
            {/* 딤 오버레이 */}
            <motion.div
                key="os-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 10000,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px 16px",
                    boxSizing: "border-box",
                    fontFamily: FONT,
                }}
            >
                {/* 모달 카드 */}
                <motion.div
                    key="os-modal"
                    initial={{ opacity: 0, scale: 0.93, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.93, y: 12 }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 440,
                        maxHeight: "85vh",
                        overflowY: "auto",
                        backgroundColor: "#FFFFFF",
                        borderRadius: 20,
                        padding: "24px 20px 28px",
                        boxSizing: "border-box",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                        fontFamily: FONT,
                    }}
                >
                    {/* 헤더 */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                    }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: FONT }}>최종 주문서</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>할부이자 표시</span>
                            <ToggleSwitch checked={showInterest} onChange={onShowInterestChange} />
                        </div>
                    </div>

                    <OrderSheetContent {...sheetProps} showInterest={showInterest} />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )

    if (typeof document === "undefined") return null
    return createPortal(modal, document.body)
}

// ─────────────────────────────────────────
// 월 납부금 팝업 (바텀시트)
// ─────────────────────────────────────────
function MonthlyPopup({
    finalPrice,
    monthlyPayment,
    installmentPaymentNoInterest = 0,
    installment,
    planPrice,
    planDiscountAmount,
    discount,
    showInterest,
    onShowInterestChange,
    onClose,
}: {
    finalPrice: number
    monthlyPayment: number
    installmentPaymentNoInterest?: number
    installment: number
    planPrice: number
    planDiscountAmount: number
    discount: string
    showInterest: boolean
    onShowInterestChange: (v: boolean) => void
    onClose: () => void
}) {
    const touchStartY = useRef(0)
    const dragControls = useDragControls()
    const isYakjeong =
        discount === "선택약정할인" || discount === "선택약정"

    const planAfterDiscount = planPrice - planDiscountAmount
    const displayMonthlyPayment = installment === 0
        ? 0
        : showInterest
            ? monthlyPayment
            : installmentPaymentNoInterest
    const totalMonthly = displayMonthlyPayment + planAfterDiscount
    const installmentLabel = installment > 0
        ? `월 할부금 (${installment}개월)`
        : "결제 금액"
    const interestLabel = showInterest ? "할부이자 포함" : "할부이자 미포함"

    const handleSheetTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY
    }
    const handleSheetTouchEnd = (e: React.TouchEvent) => {
        const delta = e.changedTouches[0].clientY - touchStartY.current
        if (delta > 60) onClose()
    }

    return (
        <AnimatePresence>
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
            <motion.div
                key="sheet"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.18 }}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 120 || info.velocity.y > 700) {
                        onClose()
                    }
                }}
                onTouchStart={handleSheetTouchStart}
                onTouchEnd={handleSheetTouchEnd}
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
                    padding: "28px 20px calc(36px + env(safe-area-inset-bottom, 0px))",
                    zIndex: 9999,
                    boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
                    fontFamily: '"Pretendard", "Inter", sans-serif',
                }}
            >
                <div
                    onPointerDown={(event) => dragControls.start(event)}
                    style={{
                        width: "40px",
                        height: "4px",
                        borderRadius: "9999px",
                        backgroundColor: "#E5E7EB",
                        margin: "0 auto 24px",
                        cursor: "grab",
                    }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: "12px" }}>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
                        월 납부금액 안내
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>할부이자 표시</span>
                        <ToggleSwitch checked={showInterest} onChange={onShowInterestChange} />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <span style={{
                        display: "inline-block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: isYakjeong ? "#7C3AED" : "#0055FF",
                        backgroundColor: isYakjeong ? "#F5F3FF" : "#EFF6FF",
                        padding: "3px 8px",
                        borderRadius: "6px",
                    }}>
                        {isYakjeong ? "선택약정할인 (25%)" : "공통지원금"}
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", color: "#6B7280" }}>할부원금</span>
                        <span style={{ fontSize: "14px", color: "#111827" }}>
                            {finalPrice.toLocaleString()}원
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontSize: "14px", color: "#6B7280" }}>
                                {installmentLabel}
                            </span>
                            {installment > 0 && (
                                <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                                    {interestLabel}
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                            {displayMonthlyPayment.toLocaleString()}원
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", color: "#6B7280" }}>월 요금제</span>
                        <span style={{ fontSize: "14px", color: "#111827" }}>
                            {planPrice.toLocaleString()}원
                        </span>
                    </div>
                    {isYakjeong && planDiscountAmount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", color: "#7C3AED" }}>
                                └ 선택약정 25% 할인
                            </span>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#7C3AED" }}>
                                -{planDiscountAmount.toLocaleString()}원
                            </span>
                        </div>
                    )}
                    {!isYakjeong && (
                        <div style={{
                            fontSize: "12px",
                            color: "#9CA3AF",
                            backgroundColor: "#F9FAFB",
                            borderRadius: "8px",
                            padding: "8px 10px",
                        }}>
                            공통지원금 선택 시 요금제 별도 할인 없음
                        </div>
                    )}
                </div>

                <div style={{ height: "1px", backgroundColor: "#F3F4F6", marginBottom: "16px" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div>
                        <span style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>월 예상 납부금</span>
                        <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                            부가세 포함, 결합할인 미적용 기준 · {interestLabel}
                        </div>
                    </div>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "#0055FF" }}>
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
                        fontFamily: '"Pretendard", "Inter", sans-serif',
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
export default function OrderSummaryCard(props) {
    const {
        finalPrice = 0,
        originPrice = 0,
        discountRate = 0,
        monthlyPayment = 0,
        installment = 24,
        planPrice = 0,
        planDiscountAmount = 0,
        discount = "공통지원금",
        isLoading = false,
        formLink = "",
        devicePetName = "",
        ctaTitle = "신청하기",
        onApplyClick,
        // OrderSheet 추가 props
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
        totalMonthPlanPrice = 0,
        totalMonthPayment = 0,
        installmentPaymentNoInterest = 0,
        totalMonthPaymentNoInterest = 0,
    } = props

    const [isMounted, setIsMounted] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [showOrderSheet, setShowOrderSheet] = useState(false)
    const [showInterest, setShowInterest] = useInstallmentInterest()
    const prevFinalPrice = useRef(finalPrice)
    const [direction, setDirection] = useState<"up" | "down" | null>(null)
    const [isBefore3PM, setIsBefore3PM] = useState(true)

    useEffect(() => {
        setIsMounted(true)
        const checkTime = () => {
            const now = new Date()
            setIsBefore3PM(now.getHours() < 15)
        }
        checkTime()
        const timer = setInterval(checkTime, 60000)
        return () => clearInterval(timer)
    }, [])

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

    const priceColor =
        direction === "up" ? "#DC2626" :
            direction === "down" ? "#EF4444" :
                "#EF4444"

    if (!isMounted) return <div style={{ width: "100%", height: "120px" }} />

    if (isLoading) {
        return (
            <div style={{ ...wrapperStyle, gap: "16px" }}>
                <Skeleton width="52%" height={28} style={{ borderRadius: 20 }} />
                <Skeleton width="40%" height={18} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Skeleton width="55%" height={28} />
                    <Skeleton width="22%" height={16} />
                </div>
                <Skeleton width="100%" height={52} style={{ borderRadius: 12 }} />
            </div>
        )
    }



    return (
        <>
            <div style={wrapperStyle}>
                {/* ── 배송 배지 ── */}
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    border: "1.5px solid #D1D5DB",
                    borderRadius: "20px",
                    padding: "5px 10px",
                    alignSelf: "flex-start",
                    fontFamily: FONT,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="1" y="3" width="15" height="13" rx="1" stroke="#2563EB" strokeWidth="1.8" />
                        <path d="M16 8h4l3 4v4h-7V8z" stroke="#2563EB" strokeWidth="1.8" strokeLinejoin="round" />
                        <circle cx="5.5" cy="18.5" r="2" stroke="#2563EB" strokeWidth="1.8" />
                        <circle cx="18.5" cy="18.5" r="2" stroke="#2563EB" strokeWidth="1.8" />
                    </svg>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>
                        {isBefore3PM ? "오후 3시 전 주문시 당일 출발" : "내일 출발"}
                    </span>
                </div>

                {/* ── 기기명 ── */}
                {devicePetName && (
                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                        {devicePetName}
                    </span>
                )}

                {/* ── 가격 행 ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#EF4444" }}>최저가</span>
                        <motion.span
                            key={animatedPrice}
                            style={{
                                fontSize: "26px",
                                fontWeight: 800,
                                color: priceColor,
                                transition: "color 0.4s ease",
                                letterSpacing: "-0.5px",
                                fontVariantNumeric: "tabular-nums",
                                fontFamily: FONT,
                            }}
                        >
                            {animatedPrice.toLocaleString()}
                        </motion.span>
                        <span style={{ fontSize: "15px", fontWeight: 500, color: "#2563EB", fontFamily: FONT }}>원</span>
                    </div>

                    {/* 월 납부금 확인 > 버튼 */}
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
                            fontFamily: FONT,
                            flexShrink: 0,
                        }}
                    >
                        월 납부금 확인
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                {/* ── 신청 전 필독사항 ── */}
                <div style={{
                    backgroundColor: "#F9FAFB",
                    borderRadius: 12,
                    padding: "14px 16px",
                    boxSizing: "border-box" as const,
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: 6,
                }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", fontFamily: FONT }}>
                        신청 전 필독사항
                    </span>
                    <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, fontFamily: FONT }}>
                        최종신청 내역에는 KT마켓지원금이 제외된 금액이 보여요.{"\n"}실제 개통 시 할인 금액이 반영되니 안심하세요.
                    </span>
                </div>

            </div>

            {/* ── 월 할부 팝업 ── */}
            {showPopup && (
                <MonthlyPopup
                    finalPrice={finalPrice}
                    monthlyPayment={monthlyPayment}
                    installmentPaymentNoInterest={installmentPaymentNoInterest}
                    installment={installment}
                    planPrice={planPrice}
                    planDiscountAmount={planDiscountAmount}
                    discount={discount}
                    showInterest={showInterest}
                    onShowInterestChange={setShowInterest}
                    onClose={() => setShowPopup(false)}
                />
            )}

            {/* ── 최종 신청서 모달 ── */}
            {showOrderSheet && (
                <OrderSheetModal
                    onClose={() => setShowOrderSheet(false)}
                    showInterest={showInterest}
                    onShowInterestChange={setShowInterest}
                    installment={installment}
                    installmentPaymentTitle={installmentPaymentTitle}
                    installmentPaymentDescription={installmentPaymentDescription}
                    installmentPrincipal={installmentPrincipal}
                    installmentPayment={installmentPayment}
                    devicePrice={devicePrice}
                    disclosureSubsidy={disclosureSubsidy}
                    ktmarketSubsidy={ktmarketSubsidy}
                    promotionDiscount={promotionDiscount}
                    migrationSubsidy={migrationSubsidy}
                    guaranteedReturnPrice={guaranteedReturnPrice}
                    specialPrice={specialPrice}
                    doubleStorageDiscount={doubleStorageDiscount}
                    plan={plan}
                    planPrice={planPrice}
                    planDiscountAmount={planDiscountAmount}
                    totalMonthPlanPrice={totalMonthPlanPrice}
                    totalMonthPayment={totalMonthPayment}
                    discount={discount}
                    isLoading={isLoading}
                    installmentPaymentNoInterest={installmentPaymentNoInterest}
                    totalMonthPaymentNoInterest={totalMonthPaymentNoInterest}
                />
            )}
        </>
    )
}

const wrapperStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    boxSizing: "border-box",
    backgroundColor: "#FFFFFF",
}

addPropertyControls(OrderSummaryCard, {
    isLoading: {
        type: ControlType.Boolean,
        title: "Loading",
        defaultValue: false,
    },
    devicePetName: {
        type: ControlType.String,
        title: "기기명",
        defaultValue: "갤럭시 S26 울트라",
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
    discount: {
        type: ControlType.Enum,
        title: "할인 유형",
        options: ["공통지원금", "선택약정할인"],
        defaultValue: "공통지원금",
    },
    formLink: {
        type: ControlType.String,
        title: "전용 조건 링크",
        defaultValue: "",
    },
    // OrderSheet 모달용 추가 props
    installmentPaymentTitle: {
        type: ControlType.String,
        title: "할부 타이틀",
        defaultValue: "월 할부원금 (24개월)",
    },
    installmentPaymentDescription: {
        type: ControlType.String,
        title: "할부 설명",
        defaultValue: "분할 상환 수수료 5.9% 포함",
    },
    installmentPayment: {
        type: ControlType.String,
        title: "월 할부금 표시",
        defaultValue: "0원",
    },
    devicePrice: {
        type: ControlType.Number,
        title: "출고가",
        defaultValue: 0,
    },
    disclosureSubsidy: {
        type: ControlType.Number,
        title: "공시지원금",
        defaultValue: 0,
    },
    ktmarketSubsidy: {
        type: ControlType.Number,
        title: "KT마켓 단독지원금",
        defaultValue: 0,
    },
    promotionDiscount: {
        type: ControlType.Number,
        title: "디바이스 추가지원금",
        defaultValue: 0,
    },
    migrationSubsidy: {
        type: ControlType.Number,
        title: "번호이동 지원금",
        defaultValue: 0,
    },
    guaranteedReturnPrice: {
        type: ControlType.Number,
        title: "미리보상 할인",
        defaultValue: 0,
    },
    specialPrice: {
        type: ControlType.Number,
        title: "스페셜 할인",
        defaultValue: 0,
    },
    doubleStorageDiscount: {
        type: ControlType.Number,
        title: "더블스토리지 할인",
        defaultValue: 0,
    },
    installmentPrincipal: {
        type: ControlType.Number,
        title: "할부원금",
        defaultValue: 0,
    },
    plan: {
        type: ControlType.String,
        title: "요금제명",
        defaultValue: "",
    },
    totalMonthPlanPrice: {
        type: ControlType.Number,
        title: "월 통신요금(할인 후)",
        defaultValue: 0,
    },
    totalMonthPayment: {
        type: ControlType.Number,
        title: "월 예상 금액",
        defaultValue: 0,
    },
})
