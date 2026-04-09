// withOrderSheet override와 함께 사용
// [7] 최종 주문서 — 3-카드 레이아웃

import { addPropertyControls, ControlType } from "framer"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Tooltip, QuestionIcon, SkeletonRow, Dashed, ToggleSwitch,
    Row, RedRow, SectionHeader,
} from "./shared/orderComponents"

const INSTALLMENT_INTEREST_STORAGE_KEY = "phone_installment_interest_visible"
const INSTALLMENT_INTEREST_EVENT = "phone-installment-interest-change"

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function OrderSummarySheet(props) {
    const {
        installment = 24,
        installmentPaymentTitle = "월 할부원금 (24개월)",
        installmentPaymentDescription = "분할 상환 수수료 5.9% 포함",
        installmentPrincipal = 0,
        installmentPayment = "0원",
        installmentPaymentNoInterest = 0,
        totalMonthPaymentNoInterest = 0,
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
        title = "최종 주문서",
    } = props

    const [showInterest, setShowInterest] = useState(false)

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const readValue = () => {
            const savedValue = window.sessionStorage.getItem(
                INSTALLMENT_INTEREST_STORAGE_KEY
            )
            setShowInterest(savedValue === "true")
        }

        const handleSync = () => readValue()
        const handleStorage = (event: StorageEvent) => {
            if (event.key === INSTALLMENT_INTEREST_STORAGE_KEY) {
                readValue()
            }
        }

        readValue()
        window.addEventListener(INSTALLMENT_INTEREST_EVENT, handleSync)
        window.addEventListener("storage", handleStorage)

        return () => {
            window.removeEventListener(INSTALLMENT_INTEREST_EVENT, handleSync)
            window.removeEventListener("storage", handleStorage)
        }
    }, [])

    const handleShowInterestChange = (nextValue: boolean) => {
        setShowInterest(nextValue)
        if (typeof window === "undefined") return
        window.sessionStorage.setItem(
            INSTALLMENT_INTEREST_STORAGE_KEY,
            String(nextValue)
        )
        window.dispatchEvent(new Event(INSTALLMENT_INTEREST_EVENT))
    }

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
        <div style={wrapperStyle}>
            {/* 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={titleStyle}>{title}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>할부이자 표시</span>
                    <ToggleSwitch checked={showInterest} onChange={handleShowInterestChange} />
                </div>
            </div>

            {isEffectivelyLoading ? (
                <div style={sectionStyle}>
                    <SkeletonRow delay={0} />
                    <SkeletonRow delay={0.1} />
                    <SkeletonRow delay={0.2} />
                    <SkeletonRow delay={0.3} width="35%" />
                </div>
            ) : (
                <>
                    {/* ── 카드 1: 월 할부원금 ── */}
                    <div style={sectionStyle}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                                <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                                    {installmentPaymentTitle}
                                </span>
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={displayInstallmentValue}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        style={{ fontSize: 18, fontWeight: 700, color: "#111827", textAlign: "right" }}
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
                                    style={{
                                        minHeight: 18,
                                        fontSize: 12,
                                        color: "#8B95A1",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {displayDescription}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* 출고가 */}
                        <Row label="출고가" value={`${devicePrice.toLocaleString()}원`} />

                        {/* 공시지원금 */}
                        {disclosureSubsidy > 0 && (
                            <RedRow
                                label="단말할인(공통)"
                                value={`-${disclosureSubsidy.toLocaleString()}원`}
                                tooltip="이동통신사가 공시한 단말기 지원금"
                            />
                        )}

                        {/* KT마켓 단독지원금 */}
                        {ktmarketSubsidy > 0 && (
                            <RedRow
                                label="KT마켓 단독지원금"
                                value={`-${ktmarketSubsidy.toLocaleString()}원`}
                                tooltip="KT마켓에서만 제공하는 단독 지원금"
                            />
                        )}

                        {/* 디바이스 추가지원금(단독) */}
                        {promotionDiscount > 0 && (
                            <RedRow
                                label="디바이스 추가지원금(단독)"
                                value={`-${promotionDiscount.toLocaleString()}원`}
                                tooltip="KT마켓 단독 프로모션 추가 지원금"
                            />
                        )}

                        {/* 번호이동 지원금 */}
                        {migrationSubsidy > 0 && (
                            <RedRow label="번호이동 지원금" value={`- ${migrationSubsidy.toLocaleString()}원`} />
                        )}

                        {/* 미리보상 할인 */}
                        {guaranteedReturnPrice > 0 && (
                            <RedRow
                                label="미리보상 할인"
                                value={`-${guaranteedReturnPrice.toLocaleString()}원`}
                                tooltip="미리보상 프로그램 적용 시 단말기 가격의 50% 할인"
                            />
                        )}

                        {/* 스페셜 할인 */}
                        {specialPrice > 0 && (
                            <RedRow label="스페셜 할인" value={`-${specialPrice.toLocaleString()}원`} />
                        )}

                        {/* 더블스토리지 할인 */}
                        {doubleStorageDiscount > 0 && (
                            <RedRow label="더블스토리지 할인" value={`-${doubleStorageDiscount.toLocaleString()}원`} />
                        )}

                        <Dashed />

                        {/* 할부원금 */}
                        <Row
                            label="할부원금"
                            value={`${installmentPrincipal.toLocaleString()}원`}
                            bold large
                        />
                    </div>

                    {/* ── 카드 2: 월 통신요금 ── */}
                    <div style={sectionStyle}>
                        <SectionHeader
                            label="월 통신요금"
                            description="결합 할인 또는 복지할인은 제외된 금액"
                        />

                        {/* 요금제명 */}
                        {plan && (
                            <Row
                                label={plan}
                                value={`월 ${planPrice.toLocaleString()}원`}
                            />
                        )}

                        {/* 요금할인 (선택약정) */}
                        {discount === "선택약정할인" && planDiscountAmount > 0 && (
                            <RedRow
                                label={planDiscountLabel}
                                value={`-${planDiscountAmount.toLocaleString()}원`}
                                tooltip={planTooltip}
                            />
                        )}

                        <Dashed />

                        {/* 월 통신요금 합계 */}
                        <Row
                            label="월 통신요금"
                            value={`${planAfterDiscount.toLocaleString()}원`}
                            bold large
                        />
                    </div>

                    {/* ── 카드 3: 월 예상 금액 ── */}
                    <div style={totalCardStyle}>
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
            )}
        </div>
    )
}

// ─── 스타일 ────────────────────────────────────────────────────────────
const wrapperStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxSizing: "border-box",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}
const stepBadge: React.CSSProperties = {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: "#111827",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
}
const stepNumText: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#FFFFFF" }
const titleStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: "#111827",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}
const sectionStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#F9FAFB",
    border: "none",
    borderRadius: 12,
    padding: "16px 18px 6px",
    boxSizing: "border-box",
}
const totalCardStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "rgb(249, 250, 251)",
    border: "none",
    borderRadius: 12,
    padding: "16px 18px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}

addPropertyControls(OrderSummarySheet, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    title: { type: ControlType.String, title: "Title", defaultValue: "최종 주문서" },
    installmentPaymentTitle: { type: ControlType.String, title: "할부 타이틀", defaultValue: "월 할부원금 (24개월)" },
    installmentPaymentDescription: { type: ControlType.String, title: "할부 설명", defaultValue: "분할 상환 수수료 5.9% 포함" },
    installmentPayment: { type: ControlType.String, title: "월 할부금", defaultValue: "32,631원" },
    installmentPaymentNoInterest: { type: ControlType.Number, title: "월 할부금(무이자표시)", defaultValue: 30800 },
    installment: {
        type: ControlType.Number, title: "할부", defaultValue: 24,
        options: [0, 24, 36, 48], optionTitles: ["일시불", "24개월", "36개월", "48개월"],
    },
    devicePrice: { type: ControlType.Number, title: "출고가", defaultValue: 1287000 },
    disclosureSubsidy: { type: ControlType.Number, title: "단말할인(공통)", defaultValue: 0 },
    ktmarketSubsidy: { type: ControlType.Number, title: "KT마켓 단독지원금", defaultValue: 0 },
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
