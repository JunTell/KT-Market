// withOrderSheet override와 함께 사용
// [7] 최종 주문서 — 3-카드 레이아웃

import { addPropertyControls, ControlType } from "framer"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Tooltip, QuestionIcon, SkeletonRow, ToggleSwitch,
    Row, RedRow,
    useInstallmentInterest,
} from "https://framer.com/m/OrderComponents-QLDYR7.js@hhiQilDauXuXfkuhoANY"

// ─── 로컬 점선 구분선 ──────────────────────────────────────────────────────
const DashedLine = () => (
    <div style={{ width: "100%", margin: "14px 0 12px", boxSizing: "border-box" }}>
        <svg width="100%" height="1" style={{ display: "block" }}>
            <line
                x1="0" y1="0.5" x2="100%" y2="0.5"
                stroke="#A8B2BF"
                strokeWidth="1.5"
                strokeDasharray="12 6"
            />
        </svg>
    </div>
)

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function OrderSummarySheet(props) {
    const {
        installment = 24,
        installmentPaymentTitle = "월 할부금 (24개월)",
        installmentPaymentDescription = "분할 상환 수수료 5.9% 포함",
        installmentPrincipal = 0,
        installmentPayment = "0원",
        installmentPaymentNoInterest = 0,
        totalMonthPaymentNoInterest = 0,
        devicePrice = 0,
        disclosureSubsidy = 0,
        ktmarketSubsidy = 0,
        youtubePremiumBonus = 0,
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
        title = "최종 주문서",
    } = props

    const [showInterest, handleShowInterestChange] = useInstallmentInterest()

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

    // 일시불이거나 이자 표시 시: 이자 포함 금액 / 할부이자 미표시 시: 무이자 금액
    const displayInstallmentValue = (installment === 0 || showInterest)
        ? installmentPaymentStr
        : `${installmentPaymentNoInterest.toLocaleString()}원`
    const displayDescription = showInterest ? installmentPaymentDescription : ""
    const displayTotalMonthPayment = showInterest
        ? Math.round(totalMonthPayment)
        : installment === 0
            ? Math.round(totalMonthPayment)
            : totalMonthPaymentNoInterest

    // 아직 override 계산이 완료되지 않은 경우 스켈레톤 표시
    const isEffectivelyLoading = isLoading || installmentPayment === ""

    return (
        <div style={containerStyle}>
            {/* 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={titleStyle}>{title}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: "#70737C", letterSpacing: -0.3, fontFamily: '"Pretendard", "Inter", sans-serif' }}>할부이자 표시</span>
                    <ToggleSwitch checked={showInterest} onChange={handleShowInterestChange} />
                </div>
            </div>

            {/* 카드 컨테이너 */}
            <div style={cardStyle}>
                {isEffectivelyLoading ? (
                    <div style={{ padding: "16px 16px" }}>
                        <SkeletonRow delay={0} />
                        <SkeletonRow delay={0.1} />
                        <SkeletonRow delay={0.2} />
                        <SkeletonRow delay={0.3} width="35%" />
                    </div>
                ) : (
                    <>
                        {/* ── 섹션 1: 월 할부금 ── */}
                        <div style={section1Style}>
                            {/* 헤더: 타이틀+설명(왼쪽) + 금액(오른쪽) */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={sectionTitleStyle}>{installmentPaymentTitle}</span>
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.span
                                            key={displayDescription || "empty-desc"}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                            style={sectionDescStyle}
                                        >
                                            {displayDescription}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={displayInstallmentValue}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        style={sectionTitleStyle}
                                    >
                                        {displayInstallmentValue}
                                    </motion.span>
                                </AnimatePresence>
                            </div>

                            {/* 행 목록 */}
                            <div style={rowsContainerStyle}>
                                <Row label="출고가" value={`${devicePrice.toLocaleString()}원`} />

                                {disclosureSubsidy > 0 && (
                                    <RedRow
                                        label="단말할인(공통)"
                                        value={`-${disclosureSubsidy.toLocaleString()}원`}
                                        tooltip="이동통신사가 공시한 단말기 지원금"
                                    />
                                )}

                                {ktmarketSubsidy > 0 && (
                                    <RedRow
                                        label="대리점 지원금"
                                        value={`-${ktmarketSubsidy.toLocaleString()}원`}
                                        tooltip="KT마켓 대리점에서 제공하는 추가 지원금"
                                    />
                                )}

                                {youtubePremiumBonus > 0 && (
                                    <RedRow
                                        label="유튜브 프리미엄 추가지원금"
                                        value={`-${youtubePremiumBonus.toLocaleString()}원`}
                                        tooltip="유튜브 프리미엄 요금제 선택 시 추가 제공되는 지원금"
                                    />
                                )}

                                {promotionDiscount > 0 && (
                                    <RedRow
                                        label="디바이스 추가지원금(단독)"
                                        value={`-${promotionDiscount.toLocaleString()}원`}
                                        tooltip="KT마켓 단독 프로모션 추가 지원금"
                                    />
                                )}

                                {migrationSubsidy > 0 && (
                                    <RedRow label="번호이동 지원금" value={`-${migrationSubsidy.toLocaleString()}원`} />
                                )}

                                {guaranteedReturnPrice > 0 && (
                                    <RedRow
                                        label="미리보상 할인"
                                        value={`-${guaranteedReturnPrice.toLocaleString()}원`}
                                        tooltip="미리보상 프로그램 적용 시 단말기 가격의 50% 할인"
                                    />
                                )}

                                {specialPrice > 0 && (
                                    <RedRow label="스페셜 할인" value={`-${specialPrice.toLocaleString()}원`} />
                                )}

                                {doubleStorageDiscount > 0 && (
                                    <RedRow label="더블스토리지 할인" value={`-${doubleStorageDiscount.toLocaleString()}원`} />
                                )}

                                <DashedLine />

                                <Row
                                    label="할부원금"
                                    value={`${(installment === 0 ? 0 : installmentPrincipal).toLocaleString()}원`}
                                    bold large
                                />
                            </div>
                        </div>

                        {/* ── 섹션 2: 월 통신요금 ── */}
                        <div style={section2Style}>
                            {/* 헤더 */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span style={sectionTitleStyle}>월 통신요금</span>
                                <span style={sectionDescStyle}>결합 할인 또는 복지할인은 제외된 금액</span>
                            </div>

                            {/* 행 목록 */}
                            <div style={rowsContainerStyle}>
                                {plan && (
                                    <Row
                                        label={plan}
                                        value={`월 ${planPrice.toLocaleString()}원`}
                                    />
                                )}

                                {discount === "선택약정할인" && (
                                    <RedRow
                                        label={planDiscountLabel}
                                        value={`-${planDiscountAmount.toLocaleString()}원`}
                                        tooltip={planTooltip}
                                    />
                                )}

                                <DashedLine />

                                <Row
                                    label="월 통신요금"
                                    value={`${planAfterDiscount.toLocaleString()}원`}
                                    bold large
                                />
                            </div>
                        </div>

                        {/* ── 섹션 3: 월 예상 금액 ── */}
                        <div style={section3Style}>
                            <span style={{ fontSize: 17, fontWeight: 700, color: "#000", letterSpacing: -0.34, fontFamily: '"Pretendard", "Inter", sans-serif' }}>
                                월 예상 금액
                            </span>
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={displayTotalMonthPayment}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    style={{ fontSize: 21, fontWeight: 700, color: "#0066FF", letterSpacing: -0.42, fontFamily: '"Pretendard", "Inter", sans-serif' }}
                                >
                                    {displayTotalMonthPayment.toLocaleString()}원
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ─── 스타일 ────────────────────────────────────────────────────────────
const containerStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    fontFamily: '"Pretendard", "Inter", sans-serif',
    display: "flex",
    flexDirection: "column",
    gap: 13,
}

const cardStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#F8F9FB",
    borderRadius: 22,
    overflow: "hidden",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
}

const section1Style: React.CSSProperties = {
    padding: "15px 16px 11px",
    borderBottom: "1.5px solid #A8B2BF",
    display: "flex",
    flexDirection: "column",
    gap: 11,
    boxSizing: "border-box",
}

const section2Style: React.CSSProperties = {
    padding: "11px 16px 11px",
    borderBottom: "1.5px solid #A8B2BF",
    display: "flex",
    flexDirection: "column",
    gap: 11,
    boxSizing: "border-box",
}

const section3Style: React.CSSProperties = {
    padding: "12px 16px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
}

const titleStyle: React.CSSProperties = {
    fontSize: 17,
    fontWeight: 700,
    color: "#171719",
    letterSpacing: -0.34,
    fontFamily: '"Pretendard", "Inter", sans-serif',
}

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    color: "#000",
    letterSpacing: -0.3,
    lineHeight: 1.445,
    fontFamily: '"Pretendard", "Inter", sans-serif',
    whiteSpace: "nowrap",
}

const sectionDescStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: "#939393",
    letterSpacing: -0.24,
    lineHeight: 1.445,
    fontFamily: '"Pretendard", "Inter", sans-serif',
}

const rowsContainerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 2,
}

addPropertyControls(OrderSummarySheet, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    title: { type: ControlType.String, title: "Title", defaultValue: "최종 주문서" },
    installmentPaymentTitle: { type: ControlType.String, title: "할부 타이틀", defaultValue: "월 할부금 (24개월)" },
    installmentPaymentDescription: { type: ControlType.String, title: "할부 설명", defaultValue: "분할 상환 수수료 5.9% 포함" },
    installmentPayment: { type: ControlType.String, title: "월 할부금", defaultValue: "32,631원" },
    installmentPaymentNoInterest: { type: ControlType.Number, title: "월 할부금(무이자표시)", defaultValue: 30800 },
    installment: {
        type: ControlType.Number, title: "할부", defaultValue: 24,
        options: [0, 24, 36, 48], optionTitles: ["일시불", "24개월", "36개월", "48개월"],
    },
    devicePrice: { type: ControlType.Number, title: "출고가", defaultValue: 1287000 },
    disclosureSubsidy: { type: ControlType.Number, title: "단말할인(공통)", defaultValue: 0 },
    ktmarketSubsidy: { type: ControlType.Number, title: "대리점 지원금", defaultValue: 0 },
    promotionDiscount: { type: ControlType.Number, title: "디바이스 추가지원금", defaultValue: 80000 },
    installmentPrincipal: { type: ControlType.Number, title: "할부원금", defaultValue: 737000 },
    plan: { type: ControlType.String, title: "요금제명", defaultValue: "가전구독 초이스 스페셜" },
    planPrice: { type: ControlType.Number, title: "요금제 금액", defaultValue: 110000 },
    planDiscountAmount: { type: ControlType.Number, title: "요금제 할인액", defaultValue: 27500 },
    totalMonthPlanPrice: { type: ControlType.Number, title: "월 통신요금(할인 후)", defaultValue: 82500 },
    totalMonthPayment: { type: ControlType.Number, title: "월 예상 금액", defaultValue: 115131 },
    totalMonthPaymentNoInterest: { type: ControlType.Number, title: "월 예상 금액(무이자표시)", defaultValue: 113300 },
    discount: {
        type: ControlType.Enum, title: "할인 유형",
        options: ["공통지원금", "선택약정할인"], defaultValue: "선택약정할인",
    },
})
