// withPriceCard override와 함께 사용
// 요금제 변경 시 가격 카운트 애니메이션 + 스켈레톤 UI + 월 할부 팝업 + 최종 신청서 모달

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { createPortal } from "react-dom"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    "https://crooiozzbjwdaghqddnu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
)
import {
    FONT,
    useAnimatedNumber,
    ToggleSwitch,
    Tooltip as OSTooltip,
    QuestionIcon as OSQuestionIcon,
    SkeletonRow as OSSkeletonRow,
    Dashed as OSDashed,
    Row as OSRow,
    RedRow as OSRedRow,
    Card as OSCard,
    SectionHeader as OSSectionHeader,
    useInstallmentInterest,
} from "https://framer.com/m/OrderComponents-QLDYR7.js@hhiQilDauXuXfkuhoANY"

// ─────────────────────────────────────────
// 스켈레톤
// ─────────────────────────────────────────
const Skeleton = ({
    width,
    height,
    style = {},
}: {
    width: string | number
    height: number
    style?: React.CSSProperties
}) => (
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
    const planAfterDiscount =
        totalMonthPlanPrice > 0
            ? totalMonthPlanPrice
            : planPrice - planDiscountAmount
    const planDiscountLabel =
        discount === "선택약정할인"
            ? `요금할인 25%${installment > 0 ? ` (${installment}개월)` : ""}`
            : ""
    const planTooltip =
        discount === "선택약정할인"
            ? `월 요금제(${planPrice.toLocaleString()}원) × 25% 선택약정 할인 적용`
            : `공통지원금 선택 시 요금제 할인 없음`
    const installmentPaymentStr =
        typeof installmentPayment === "number"
            ? `${installmentPayment.toLocaleString()}원`
            : installmentPayment

    // 토글 기준 표시값 분기
    const displayInstallmentValue =
        installment === 0 || showInterest
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
                <OSRow
                    label="출고가"
                    value={`${devicePrice.toLocaleString()}원`}
                />
                {disclosureSubsidy > 0 && (
                    <OSRedRow
                        label="공시지원금"
                        value={`-${disclosureSubsidy.toLocaleString()}원`}
                        tooltip="이동통신사가 공시한 단말기 지원금"
                    />
                )}
                {ktmarketSubsidy > 0 && (
                    <OSRedRow
                        label="KT마켓 단독지원금"
                        value={`-${ktmarketSubsidy.toLocaleString()}원`}
                        tooltip="KT마켓에서만 제공하는 단독 지원금"
                    />
                )}
                {promotionDiscount > 0 && (
                    <OSRedRow
                        label="디바이스 추가지원금(단독)"
                        value={`-${promotionDiscount.toLocaleString()}원`}
                        tooltip="KT마켓 단독 프로모션 추가 지원금"
                    />
                )}
                {migrationSubsidy > 0 && (
                    <OSRedRow
                        label="번호이동 지원금"
                        value={`- ${migrationSubsidy.toLocaleString()}원`}
                    />
                )}
                {guaranteedReturnPrice > 0 && (
                    <OSRedRow
                        label="미리보상 할인"
                        value={`-${guaranteedReturnPrice.toLocaleString()}원`}
                        tooltip="미리보상 프로그램 적용 시 단말기 가격의 50% 할인"
                    />
                )}
                {specialPrice > 0 && (
                    <OSRedRow
                        label="스페셜 할인"
                        value={`-${specialPrice.toLocaleString()}원`}
                    />
                )}
                {doubleStorageDiscount > 0 && (
                    <OSRedRow
                        label="더블스토리지 할인"
                        value={`-${doubleStorageDiscount.toLocaleString()}원`}
                    />
                )}
                <OSDashed />
                <OSRow
                    label="할부원금"
                    value={`${(installment === 0 ? 0 : installmentPrincipal).toLocaleString()}원`}
                    bold
                    large
                />
            </OSCard>

            {/* 카드 2: 월 통신요금 */}
            <OSCard>
                <OSSectionHeader
                    label="월 통신요금"
                    description="결합 할인 또는 복지할인은 제외된 금액"
                />
                {plan && (
                    <OSRow
                        label={plan}
                        value={`월 ${planPrice.toLocaleString()}원`}
                    />
                )}
                {discount === "선택약정할인" && planDiscountAmount > 0 && (
                    <OSRedRow
                        label={planDiscountLabel}
                        value={`-${planDiscountAmount.toLocaleString()}원`}
                        tooltip={planTooltip}
                    />
                )}
                <OSDashed />
                <OSRow
                    label="월 통신요금"
                    value={`${planAfterDiscount.toLocaleString()}원`}
                    bold
                    large
                />
            </OSCard>

            {/* 카드 3: 월 예상 금액 */}
            <div
                style={{
                    width: "100%",
                    backgroundColor: "#F9FAFB",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "16px 18px",
                    boxSizing: "border-box" as const,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span
                    style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#3F4750",
                        letterSpacing: -0.3,
                        lineHeight: 1.4,
                    }}
                >
                    월 예상 금액
                </span>
                <span
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#0055FF",
                        letterSpacing: -0.4,
                        lineHeight: 1.3,
                    }}
                >
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
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#24292E",
                                fontFamily: FONT,
                                letterSpacing: -0.3,
                                lineHeight: 1.5,
                            }}
                        >
                            최종 주문서
                        </span>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 12,
                                    color: "#868E96",
                                    fontFamily: FONT,
                                    letterSpacing: -0.24,
                                    lineHeight: 1.5,
                                    wordBreak: "keep-all",
                                }}
                            >
                                할부이자 표시
                            </span>
                            <ToggleSwitch
                                checked={showInterest}
                                onChange={onShowInterestChange}
                            />
                        </div>
                    </div>

                    <OrderSheetContent
                        {...sheetProps}
                        showInterest={showInterest}
                    />
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
    const isYakjeong = discount === "선택약정할인" || discount === "선택약정"

    const planAfterDiscount = planPrice - planDiscountAmount
    const displayMonthlyPayment =
        installment === 0
            ? 0
            : showInterest
                ? monthlyPayment
                : installmentPaymentNoInterest
    const totalMonthly = displayMonthlyPayment + planAfterDiscount
    const installmentLabel =
        installment > 0 ? `월 할부금 (${installment}개월)` : "결제 금액"
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
                    padding:
                        "28px 20px calc(36px + env(safe-area-inset-bottom, 0px))",
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

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: "12px",
                    }}
                >
                    <p
                        style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#24292E",
                            margin: 0,
                            letterSpacing: -0.36,
                            lineHeight: 1.3,
                        }}
                    >
                        월 납부금액 안내
                    </p>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 12,
                                color: "#868E96",
                                fontFamily: FONT,
                                letterSpacing: -0.24,
                                lineHeight: 1.5,
                                wordBreak: "keep-all",
                            }}
                        >
                            할부이자 표시
                        </span>
                        <ToggleSwitch
                            checked={showInterest}
                            onChange={onShowInterestChange}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <span
                        style={{
                            display: "inline-block",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: isYakjeong ? "#7C3AED" : "#0055FF",
                            backgroundColor: isYakjeong ? "#F5F3FF" : "#EFF6FF",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            letterSpacing: -0.24,
                            lineHeight: 1.5,
                        }}
                    >
                        {isYakjeong ? "선택약정할인 (25%)" : "공통지원금"}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        marginBottom: "20px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "14px",
                                color: "#868E96",
                                letterSpacing: -0.24,
                                lineHeight: 1.4,
                            }}
                        >
                            할부원금
                        </span>
                        <span
                            style={{
                                fontSize: "14px",
                                color: "#24292E",
                                letterSpacing: -0.24,
                                lineHeight: 1.4,
                            }}
                        >
                            {finalPrice.toLocaleString()}원
                        </span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "14px",
                                    color: "#868E96",
                                    letterSpacing: -0.24,
                                    lineHeight: 1.4,
                                }}
                            >
                                {installmentLabel}
                            </span>
                            {installment > 0 && (
                                <span
                                    style={{
                                        fontSize: "11px",
                                        color: "#868E96",
                                        letterSpacing: -0.16,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {interestLabel}
                                </span>
                            )}
                        </div>
                        <span
                            style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#24292E",
                                letterSpacing: -0.24,
                                lineHeight: 1.4,
                            }}
                        >
                            {displayMonthlyPayment.toLocaleString()}원
                        </span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "14px",
                                color: "#868E96",
                                letterSpacing: -0.24,
                                lineHeight: 1.4,
                            }}
                        >
                            월 요금제
                        </span>
                        <span
                            style={{
                                fontSize: "14px",
                                color: "#24292E",
                                letterSpacing: -0.24,
                                lineHeight: 1.4,
                            }}
                        >
                            {planPrice.toLocaleString()}원
                        </span>
                    </div>
                    {isYakjeong && planDiscountAmount > 0 && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "14px",
                                    color: "#7C3AED",
                                    letterSpacing: -0.24,
                                    lineHeight: 1.4,
                                }}
                            >
                                └ 선택약정 25% 할인
                            </span>
                            <span
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#7C3AED",
                                    letterSpacing: -0.24,
                                    lineHeight: 1.4,
                                }}
                            >
                                -{planDiscountAmount.toLocaleString()}원
                            </span>
                        </div>
                    )}
                    {!isYakjeong && (
                        <div
                            style={{
                                fontSize: "12px",
                                color: "#868E96",
                                backgroundColor: "#F9FAFB",
                                borderRadius: "8px",
                                padding: "8px 10px",
                                letterSpacing: -0.24,
                                lineHeight: 1.5,
                                wordBreak: "keep-all",
                            }}
                        >
                            공통지원금 선택 시 요금제 별도 할인 없음
                        </div>
                    )}
                </div>

                <div
                    style={{
                        height: "1px",
                        backgroundColor: "#F3F4F6",
                        marginBottom: "16px",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <div>
                        <span
                            style={{
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#24292E",
                                letterSpacing: -0.3,
                                lineHeight: 1.4,
                            }}
                        >
                            월 예상 납부금
                        </span>
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#868E96",
                                marginTop: "2px",
                                letterSpacing: -0.16,
                                lineHeight: 1.4,
                            }}
                        >
                            부가세 포함, 결합할인 미적용 기준 · {interestLabel}
                        </div>
                    </div>
                    <span
                        style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            color: "#0055FF",
                            letterSpacing: -0.4,
                            lineHeight: 1.3,
                        }}
                    >
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
                        letterSpacing: -0.3,
                        lineHeight: 1.4,
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
        totalMonthPlanPrice = 0,
        totalMonthPayment = 0,
        installmentPaymentNoInterest = 0,
        totalMonthPaymentNoInterest = 0,
        totalDeviceDiscountAmount = 0,
        // Mobile CTA props
        isSoldOut = false,
        onRestockClick,
        onConsultClick,
        onWishClick,
        isWished = false,
        kakaoTalkLink = "http://pf.kakao.com/_HfItxj/chat",
        onSaveOrderSession,
    } = props

    const [isMounted, setIsMounted] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [showOrderSheet, setShowOrderSheet] = useState(false)
    const [showInterest, setShowInterest] = useInstallmentInterest()
    const prevFinalPrice = useRef(finalPrice)
    const [direction, setDirection] = useState<"up" | "down" | null>(null)
    const [isBefore3PM, setIsBefore3PM] = useState(true)
    const [isWeekend, setIsWeekend] = useState(false)
    const [viewerCount, setViewerCount] = useState(0)
    // 마운트 시 1회 고정 — 10~19 랜덤 베이스
    const randomViewerBase = useRef(Math.floor(Math.random() * 10) + 10)

    const HOLIDAYS = new Set([
        // 2026년
        "2026-01-01", // 신정
        "2026-01-28", // 설날 연휴
        "2026-01-29", // 설날
        "2026-01-30", // 설날 연휴
        "2026-03-01", // 삼일절
        "2026-05-05", // 어린이날
        "2026-05-25", // 부처님오신날
        "2026-06-06", // 현충일
        "2026-08-15", // 광복절
        "2026-09-24", // 추석 연휴
        "2026-09-25", // 추석
        "2026-09-26", // 추석 연휴
        "2026-10-03", // 개천절
        "2026-10-09", // 한글날
        "2026-12-25", // 성탄절
        // 2027년
        "2027-01-01", // 신정
        "2027-02-17", // 설날 연휴
        "2027-02-18", // 설날
        "2027-02-19", // 설날 연휴
        "2027-03-01", // 삼일절
        "2027-05-05", // 어린이날
        "2027-05-13", // 부처님오신날
        "2027-06-06", // 현충일
        "2027-08-15", // 광복절
        "2027-10-03", // 개천절
        "2027-10-04", // 추석 연휴
        "2027-10-05", // 추석
        "2027-10-06", // 추석 연휴
        "2027-10-09", // 한글날
        "2027-12-25", // 성탄절
    ])

    useEffect(() => {
        setIsMounted(true)
        const checkTime = () => {
            const now = new Date()
            const day = now.getDay() // 0: 일요일, 6: 토요일
            const today = now.toISOString().slice(0, 10) // "2026-04-14"
            setIsWeekend(day === 0 || day === 6 || HOLIDAYS.has(today))
            setIsBefore3PM(now.getHours() < 15)
        }
        checkTime()
        const timer = setInterval(checkTime, 60000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        // 페이지별 독립 채널: URL 경로 마지막 세그먼트를 채널명에 포함
        const pagePath =
            typeof window !== "undefined"
                ? window.location.pathname
                    .replace(/\//g, "-")
                    .replace(/^-|-$/g, "") || "home"
                : "home"
        const channelName = `ktmarket-viewers-${pagePath}`
        const sessionId = Math.random().toString(36).slice(2, 10)

        const channel = supabase.channel(channelName)

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState()
                setViewerCount(Object.keys(state).length)
            })
            .on("presence", { event: "join" }, () => {
                const state = channel.presenceState()
                setViewerCount(Object.keys(state).length)
            })
            .on("presence", { event: "leave" }, () => {
                const state = channel.presenceState()
                setViewerCount(Object.keys(state).length)
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        session_id: sessionId,
                        joined_at: Date.now(),
                    })
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
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

    const discountMan =
        totalDeviceDiscountAmount > 0
            ? Math.round(totalDeviceDiscountAmount / 10000)
            : originPrice > 0 && originPrice > finalPrice
                ? Math.round((originPrice - finalPrice) / 10000)
                : 0

    if (!isMounted) return <div style={{ width: "100%", height: "120px" }} />

    if (isLoading) {
        return (
            <div style={{ ...wrapperStyle, gap: "16px" }}>
                <Skeleton
                    width="52%"
                    height={28}
                    style={{ borderRadius: 20 }}
                />
                <Skeleton width="40%" height={18} />
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Skeleton width="55%" height={28} />
                    <Skeleton width="22%" height={16} />
                </div>
                <Skeleton
                    width="100%"
                    height={52}
                    style={{ borderRadius: 12 }}
                />
            </div>
        )
    }

    return (
        <>
            <div style={wrapperStyle}>
                {/* ── 배송 배지 + 실시간 조회자 수 (flex row) ── */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "8px",
                        minHeight: "26.948px",
                    }}
                >
                    {/* 배송 배지 (주말 숨김) */}
                    {!isWeekend && (
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4.9px",
                                height: "26.948px",
                                padding: "2.945px 10px",
                                backgroundColor: "#EFF6FF",
                                borderRadius: "6.737px",
                                fontFamily: FONT,
                            }}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <rect
                                    x="1"
                                    y="3"
                                    width="15"
                                    height="13"
                                    rx="1"
                                    stroke="#3B82F6"
                                    strokeWidth="1.8"
                                />
                                <path
                                    d="M16 8h4l3 4v4h-7V8z"
                                    stroke="#3B82F6"
                                    strokeWidth="1.8"
                                    strokeLinejoin="round"
                                />
                                <circle
                                    cx="5.5"
                                    cy="18.5"
                                    r="2"
                                    stroke="#3B82F6"
                                    strokeWidth="1.8"
                                />
                                <circle
                                    cx="18.5"
                                    cy="18.5"
                                    r="2"
                                    stroke="#3B82F6"
                                    strokeWidth="1.8"
                                />
                            </svg>
                            <span
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "#3B82F6",
                                    letterSpacing: -0.24,
                                    lineHeight: 1.5,
                                    wordBreak: "keep-all",
                                }}
                            >
                                {isBefore3PM
                                    ? "오후 3시 전 주문시 당일 출발"
                                    : "내일 출발"}
                            </span>
                        </div>
                    )}

                    {/* 실시간 조회자 수 */}
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4.9px",
                            height: "26.948px",
                            padding: "2.945px 10px",
                            backgroundColor: "#FEF2F2",
                            borderRadius: "6.737px",
                            fontFamily: FONT,
                        }}
                    >
                        <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                backgroundColor: "#EF4444",
                                flexShrink: 0,
                            }}
                        />
                        <span
                            style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#EF4444",
                                letterSpacing: -0.24,
                                lineHeight: 1.5,
                                fontFamily: FONT,
                            }}
                        >
                            현재{" "}
                            {randomViewerBase.current +
                                Math.max(0, viewerCount - 1)}
                            명이 보는 중
                        </span>
                    </motion.div>
                </div>

                {/* ── 기기명 + 가격 행 ── */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                    }}
                >
                    {devicePetName && (
                        <span
                            style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#24292E",
                                fontFamily: FONT,
                                letterSpacing: -0.24,
                                lineHeight: 1.4,
                            }}
                        >
                            {devicePetName}
                        </span>
                    )}

                    {/* ── 가격 행 ── */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "4px",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "14px",
                                    color: "#0066FF",
                                    fontWeight: 600,
                                    letterSpacing: -0.24,
                                    lineHeight: 1.4,
                                }}
                            >
                                최저가
                            </span>
                            <motion.span
                                key={animatedPrice}
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 800,
                                    color: "#24292E",
                                    letterSpacing: "-1px",
                                    fontVariantNumeric: "tabular-nums",
                                    fontFamily: FONT,
                                }}
                            >
                                {animatedPrice.toLocaleString()}
                            </motion.span>
                            <span
                                style={{
                                    fontSize: "22px",
                                    fontWeight: 700,
                                    color: "#24292E",
                                    fontFamily: FONT,
                                    letterSpacing: -0.44,
                                    lineHeight: 1.2,
                                }}
                            >
                                원
                            </span>
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
                                color: "#868E96",
                                fontSize: "15px",
                                fontWeight: 500,
                                fontFamily: FONT,
                                flexShrink: 0,
                                letterSpacing: -0.3,
                                lineHeight: 1.4,
                            }}
                        >
                            월 납부금 확인
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>

                    {/* ── 출고가 + 할인 인라인 문장 ── */}
                    {discountMan > 0 && (
                        <p
                            style={{
                                margin: 0,
                                display: "flex",
                                alignItems: "baseline",
                                gap: "4px",
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 400,
                                    color: "#868E96",
                                    fontFamily: FONT,
                                    letterSpacing: -0.24,
                                    lineHeight: 1.5,
                                }}
                            >
                                출고가{" "}
                                {(originPrice > 0
                                    ? originPrice
                                    : devicePrice
                                ).toLocaleString()}
                                원에서
                            </span>
                            <span
                                style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#EF4444",
                                    fontFamily: FONT,
                                    letterSpacing: -0.24,
                                    lineHeight: 1.5,
                                }}
                            >
                                {discountMan}만원 할인
                            </span>
                        </p>
                    )}
                </div>

                {/* ── 신청 전 필독사항 (PreOrderNotice 컴포넌트로 분리) ── */}

                {/* ── Mobile CTA 버튼 (찜 · 문의 · 신청하기) ── */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                    }}
                >
                    {/* 찜 버튼 */}
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof onWishClick === "function") onWishClick()
                        }}
                        aria-label={isWished ? "찜 해제" : "찜하기"}
                        aria-pressed={isWished}
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 12,
                            border: isWished ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                            backgroundColor: isWished ? "#FEF2F2" : "#FFFFFF",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                            flexShrink: 0,
                            padding: 0,
                            fontFamily: FONT,
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={isWished ? "#EF4444" : "none"}
                            stroke={isWished ? "#EF4444" : "#868E96"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 500,
                                color: isWished ? "#EF4444" : "#868E96",
                                lineHeight: 1,
                                letterSpacing: -0.1,
                            }}
                        >
                            찜
                        </span>
                    </button>

                    {/* 문의 버튼 */}
                    <button
                        type="button"
                        onClick={() => {
                            if (typeof onConsultClick === "function") {
                                onConsultClick()
                            } else if (typeof window !== "undefined") {
                                window.open(kakaoTalkLink, "_blank", "noopener,noreferrer")
                            }
                        }}
                        aria-label="카카오톡 상담"
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 12,
                            border: "1.5px solid #E5E7EB",
                            backgroundColor: "#FFFFFF",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                            flexShrink: 0,
                            padding: 0,
                            fontFamily: FONT,
                        }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#868E96"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 500,
                                color: "#868E96",
                                lineHeight: 1,
                                letterSpacing: -0.1,
                            }}
                        >
                            문의
                        </span>
                    </button>

                    {/* 신청하기 / 입고알림 버튼 */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isSoldOut && typeof onRestockClick === "function") {
                                onRestockClick()
                            } else if (typeof onApplyClick === "function") {
                                onApplyClick()
                            } else {
                                onSaveOrderSession?.()
                                if (typeof window !== "undefined") {
                                    window.location.href = "/phone/user-info"
                                }
                            }
                        }}
                        style={{
                            flex: 1,
                            height: 50,
                            borderRadius: 12,
                            border: "none",
                            backgroundColor: isSoldOut ? "#3F4750" : "#0066FF",
                            color: "#FFFFFF",
                            cursor: "pointer",
                            fontFamily: FONT,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 17,
                                fontWeight: 700,
                                letterSpacing: -0.3,
                                lineHeight: 1.2,
                            }}
                        >
                            {isSoldOut ? "입고 알림" : (ctaTitle || "신청하기")}
                        </span>
                        {!isSoldOut && monthlyPayment > 0 && (
                            <span
                                style={{
                                    fontSize: 12,
                                    fontWeight: 400,
                                    opacity: 0.85,
                                    letterSpacing: -0.16,
                                    lineHeight: 1.2,
                                }}
                            >
                                월 {monthlyPayment.toLocaleString()}원
                            </span>
                        )}
                    </button>
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
                    installmentPaymentDescription={
                        installmentPaymentDescription
                    }
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
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
        defaultValue: "할부 이자 포함",
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
