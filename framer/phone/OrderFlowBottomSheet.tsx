// withOrderSheet override와 함께 사용
// 하단 고정 BottomSheet — 신청하기 버튼 클릭 시 모달 (카카오 로그인 / 비회원)
// 상세 신청서 탭 → 위로 올라오는 바텀시트로 OrderSummarySheet UI 표시

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import {
    FONT, useAnimatedNumber, ToggleSwitch,
    SkeletonRow, Dashed, Row, RedRow, SectionHeader,
    useInstallmentInterest,
} from "./shared/orderComponents"

// Card with marginBottom for this component's layout
const Card = ({ children }: { children: React.ReactNode }) => (
    <div style={{
        width: "100%", backgroundColor: "#FFFFFF",
        border: "1.5px solid #E5E7EB", borderRadius: 12,
        padding: "16px 18px 6px", boxSizing: "border-box",
        marginBottom: 10,
    }}>
        {children}
    </div>
)

// ─── OrderSheet 내용 컴포넌트 ─────────────────────────────────────────
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

    // 토글 기준 표시값 분기 — 일시불이거나 이자 표시 시 이자 포함 금액 사용
    const displayInstallmentValue = (installment === 0 || showInterest)
        ? installmentPaymentStr
        : `${installmentPaymentNoInterest.toLocaleString()}원`
    const displayDescription = showInterest ? installmentPaymentDescription : ""
    const displayTotalMonthPayment = showInterest
        ? Math.round(totalMonthPayment)
        : totalMonthPaymentNoInterest

    // override 계산 완료 전 스켈레톤 표시
    const isEffectivelyLoading = isLoading || installmentPayment === ""

    if (isEffectivelyLoading) {
        return (
            <Card>
                <SkeletonRow delay={0} />
                <SkeletonRow delay={0.1} />
                <SkeletonRow delay={0.2} />
                <SkeletonRow delay={0.3} width="35%" />
            </Card>
        )
    }

    return (
        <>
            {/* 카드 1: 월 할부원금 */}
            <Card>
                <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{installmentPaymentTitle}</span>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={displayInstallmentValue}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}
                            >
                                {displayInstallmentValue}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={displayDescription || "empty-description"}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            style={{ minHeight: 18, fontSize: 12, color: "#8B95A1", lineHeight: 1.5, marginTop: 2 }}
                        >
                            {displayDescription}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <Row label="출고가" value={`${devicePrice.toLocaleString()}원`} />
                {disclosureSubsidy > 0 && (
                    <RedRow label="공시지원금" value={`-${disclosureSubsidy.toLocaleString()}원`} tooltip="이동통신사가 공시한 단말기 지원금" />
                )}
                {ktmarketSubsidy > 0 && (
                    <RedRow label="KT마켓 단독지원금" value={`-${ktmarketSubsidy.toLocaleString()}원`} tooltip="KT마켓에서만 제공하는 단독 지원금" />
                )}
                {promotionDiscount > 0 && (
                    <RedRow label="디바이스 추가지원금(단독)" value={`-${promotionDiscount.toLocaleString()}원`} tooltip="KT마켓 단독 프로모션 추가 지원금" />
                )}
                {migrationSubsidy > 0 && (
                    <RedRow label="번호이동 지원금" value={`- ${migrationSubsidy.toLocaleString()}원`} />
                )}
                {guaranteedReturnPrice > 0 && (
                    <RedRow label="미리보상 할인" value={`-${guaranteedReturnPrice.toLocaleString()}원`} tooltip="미리보상 프로그램 적용 시 단말기 가격의 50% 할인" />
                )}
                {specialPrice > 0 && (
                    <RedRow label="스페셜 할인" value={`-${specialPrice.toLocaleString()}원`} />
                )}
                {doubleStorageDiscount > 0 && (
                    <RedRow label="더블스토리지 할인" value={`-${doubleStorageDiscount.toLocaleString()}원`} />
                )}
                <Dashed />
                <Row label="할부원금" value={`${(installment === 0 ? 0 : installmentPrincipal).toLocaleString()}원`} bold large />
            </Card>

            {/* 카드 2: 월 통신요금 */}
            <Card>
                <SectionHeader label="월 통신요금" description="결합 할인 또는 복지할인은 제외된 금액" />
                {plan && (
                    <Row label={plan} value={`월 ${planPrice.toLocaleString()}원`} />
                )}
                {discount === "선택약정할인" && planDiscountAmount > 0 && (
                    <RedRow label={planDiscountLabel} value={`-${planDiscountAmount.toLocaleString()}원`} tooltip={planTooltip} />
                )}
                <Dashed />
                <Row label="월 통신요금" value={`${planAfterDiscount.toLocaleString()}원`} bold large />
            </Card>

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
                marginBottom: 10,
            }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: "#374151" }}>월 예상 금액</span>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={displayTotalMonthPayment}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        style={{ fontSize: 20, fontWeight: 700, color: "#0055FF" }}
                    >
                        {displayTotalMonthPayment.toLocaleString()}원
                    </motion.span>
                </AnimatePresence>
            </div>
        </>
    )
}

// ─── 상세 주문서 바텀시트 ─────────────────────────────────────────────
function DetailBottomSheet({
    onClose,
    onApply,
    sheetProps,
    FONT,
    showInterest,
    setShowInterest,
}: {
    onClose: () => void
    onApply: () => void
    sheetProps: any
    FONT: string
    showInterest: boolean
    setShowInterest: (v: boolean) => void
}) {
    const touchStartY = useRef(0)
    const dragControls = useDragControls()
    const handleSheetTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY
    }
    const handleSheetTouchEnd = (e: React.TouchEvent) => {
        const delta = e.changedTouches[0].clientY - touchStartY.current
        if (delta > 60) onClose()
    }

    return (
        <AnimatePresence>
            {/* 딤 오버레이 */}
            <motion.div
                key="detail-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 20000,
                }}
            />

            {/* 바텀시트 */}
            <motion.div
                key="detail-sheet"
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
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    margin: "0 auto",
                    maxWidth: 440,
                    width: "100%",
                    maxHeight: "88vh",
                    backgroundColor: "#FFFFFF",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    boxShadow: "0 -4px 28px rgba(0,0,0,0.15)",
                    zIndex: 20001,
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: FONT,
                }}
            >
                {/* 핸들 + 헤더 — 스와이프 다운으로 닫기 */}
                <div
                    style={{
                        padding: "16px 20px 12px",
                        borderBottom: "1px solid #F3F4F6",
                        flexShrink: 0,
                        cursor: "grab",
                    }}
                    onTouchStart={handleSheetTouchStart}
                    onTouchEnd={handleSheetTouchEnd}
                    onPointerDown={(event) => dragControls.start(event)}
                >
                    {/* 핸들 */}
                    <div style={{
                        width: 40, height: 4, borderRadius: 9999,
                        backgroundColor: "#E5E7EB",
                        margin: "0 auto 16px",
                    }} />
                    {/* 제목 + 토글 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: FONT }}>최종 주문서</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "#6B7280", fontFamily: FONT }}>할부이자 표시</span>
                            <ToggleSwitch checked={showInterest} onChange={setShowInterest} />
                        </div>
                    </div>
                </div>

                {/* 스크롤 가능한 내용 */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px 20px 8px",
                    boxSizing: "border-box",
                }}>
                    <OrderSheetContent {...sheetProps} showInterest={showInterest} />
                </div>

                {/* CTA 버튼 */}
                <div style={{
                    padding: "10px 16px",
                    paddingBottom: "calc(10px + env(safe-area-inset-bottom, 10px))",
                    borderTop: "1px solid #F3F4F6",
                    flexShrink: 0,
                    backgroundColor: "#FFFFFF",
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: "100%", height: 52, borderRadius: 14,
                            border: "none", backgroundColor: "#0055FF",
                            color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                            cursor: "pointer", fontFamily: FONT,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        확인
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 128
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
    const [showDetailSheet, setShowDetailSheet] = useState(false)
    const [showInterest, setShowInterest] = useInstallmentInterest()

    // 모달 열릴 때 배경 스크롤 차단
    useEffect(() => {
        if (typeof document === "undefined") return
        if (showDetailSheet) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [showDetailSheet])

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

    if (!mounted) return <div style={{ width: "100%", minHeight: 128 }} />

    const sheetProps = {
        installment,
        installmentPaymentTitle,
        installmentPaymentDescription,
        installmentPrincipal,
        installmentPayment,
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
        installmentPaymentNoInterest,
        totalMonthPaymentNoInterest,
    }

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
            {/* 상단 chevron — 탭 시 상세 신청서 열기 */}
            <button
                onClick={() => setShowDetailSheet(true)}
                style={{
                    width: "100%", padding: "10px 0 4px",
                    background: "none", border: "none",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C9D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                </svg>
            </button>

            {/* 월 예상 금액 행 */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "4px 20px 10px",
            }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                    <span style={{ fontSize: 14, color: "#374151", fontWeight: 500, fontFamily: FONT }}>
                        월 예상 금액
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}>부가세 포함</span>
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
                                        style={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONT }}
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
                        fontSize: 20,
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
                        width: 52, height: 52, borderRadius: 14,
                        border: "1.5px solid #E5E7EB",
                        backgroundColor: "#FFFFFF",
                        cursor: "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
                        flex: 1, height: 52, borderRadius: 14,
                        border: "none", backgroundColor: "#FEE500",
                        color: "#191919", fontSize: 15, fontWeight: 700,
                        cursor: "pointer", fontFamily: FONT,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        textDecoration: "none",
                        gap: 6,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
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
                        flex: 1, height: 52, borderRadius: 14,
                        border: "none", backgroundColor: "#EF4444",
                        color: "#FFFFFF", fontSize: 15, fontWeight: 700,
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
        <div style={{ width: "100%", minHeight: 128 }}>
            {/* portal 없이 직접 렌더링 — Framer 캔버스에서 portal은 에디터 외부 body에 붙음 */}
            {bar}

            {/* 상세 주문서 바텀시트 */}
            {showDetailSheet && (
                <DetailBottomSheet
                    onClose={() => setShowDetailSheet(false)}
                    onApply={() => {
                        setShowDetailSheet(false)
                        handleFormLink()
                    }}
                    sheetProps={sheetProps}
                    FONT={FONT}
                    showInterest={showInterest}
                    setShowInterest={setShowInterest}
                />
            )}
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
