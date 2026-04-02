// withOrderSheet override와 함께 사용
// [7] 최종 주문서 — 3-카드 레이아웃

import { addPropertyControls, ControlType } from "framer"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── 툴팁 ─────────────────────────────────────────────────────────────
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
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
                            zIndex: 100,
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

const QuestionIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="6.5" stroke="#9CA3AF" />
        <text x="7" y="11" textAnchor="middle" fontSize="9" fill="#9CA3AF" fontWeight="600">?</text>
    </svg>
)

// ─── 스켈레톤 ────────────────────────────────────────────────────────
const SkeletonRow = ({ delay = 0, width = "45%" }: { delay?: number; width?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10 }}>
        <motion.div style={{ width: "50%", height: 13, borderRadius: 4, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }} />
        <motion.div style={{ width, height: 13, borderRadius: 4, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: delay + 0.08 }} />
    </div>
)

// ─── 구분선 ──────────────────────────────────────────────────────────
const Dashed = () => (
    <div style={{ width: "100%", height: 0, borderTop: "1.5px dashed #E5E7EB", margin: "10px 0 12px" }} />
)

// ─── 일반 행 ─────────────────────────────────────────────────────────
const Row = ({
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
            {tooltip && (
                <Tooltip text={tooltip}><QuestionIcon /></Tooltip>
            )}
        </div>
        <span style={{ fontSize: large ? 17 : 14, fontWeight: bold ? 700 : 500, color: valueColor }}>
            {value}
        </span>
    </div>
)

// ─── 빨간 할인 행 (기기 할인 섹션용) ─────────────────────────────────
const RedRow = ({
    label, value, tooltip,
}: {
    label: string; value: string; tooltip?: string
}) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: "#EF4444" }}>{label}</span>
            {tooltip && (
                <Tooltip text={tooltip}><QuestionIcon /></Tooltip>
            )}
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#EF4444" }}>{value}</span>
    </div>
)

// ─── 카드 컨테이너 ────────────────────────────────────────────────────
const Card = ({ children }: { children: React.ReactNode }) => (
    <div style={{
        width: "100%", backgroundColor: "#FFFFFF",
        border: "1.5px solid #E5E7EB", borderRadius: 12,
        padding: "16px 18px 6px", boxSizing: "border-box",
    }}>
        {children}
    </div>
)

// ─── 섹션 헤더 ────────────────────────────────────────────────────────
const SectionHeader = ({
    label, value, description,
}: {
    label: string; value?: string; description?: string
}) => (
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

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function OrderSheetComponent(props) {
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
        stepNumber = 7,
        title = "최종 주문서",
    } = props

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

    return (
        <div style={wrapperStyle}>
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={stepBadge}><span style={stepNumText}>{stepNumber}</span></div>
                <span style={titleStyle}>{title}</span>
            </div>

            {isLoading ? (
                <Card>
                    <SkeletonRow delay={0} />
                    <SkeletonRow delay={0.1} />
                    <SkeletonRow delay={0.2} />
                    <SkeletonRow delay={0.3} width="35%" />
                </Card>
            ) : (
                <>
                    {/* ── 카드 1: 월 할부원금 ── */}
                    <Card>
                        <SectionHeader
                            label={installmentPaymentTitle}
                            value={installmentPaymentStr}
                            description={installmentPaymentDescription}
                        />

                        {/* 출고가 */}
                        <Row label="출고가" value={`${devicePrice.toLocaleString()}원`} />

                        {/* 공시지원금 */}
                        {disclosureSubsidy > 0 && (
                            <RedRow
                                label="공시지원금"
                                value={`${disclosureSubsidy.toLocaleString()}원`}
                                tooltip="이동통신사가 공시한 단말기 지원금"
                            />
                        )}

                        {/* KT마켓 단독지원금 */}
                        {ktmarketSubsidy > 0 && (
                            <RedRow
                                label="KT마켓 단독지원금"
                                value={`${ktmarketSubsidy.toLocaleString()}원`}
                                tooltip="KT마켓에서만 제공하는 단독 지원금"
                            />
                        )}

                        {/* 디바이스 추가지원금(단독) */}
                        {promotionDiscount > 0 && (
                            <RedRow
                                label="디바이스 추가지원금(단독)"
                                value={`${promotionDiscount.toLocaleString()}원`}
                                tooltip="KT마켓 단독 프로모션 추가 지원금"
                            />
                        )}

                        {/* 번호이동 지원금 */}
                        {migrationSubsidy > 0 && (
                            <RedRow label="번호이동 지원금" value={`${migrationSubsidy.toLocaleString()}원`} />
                        )}

                        {/* 미리보상 할인 */}
                        {guaranteedReturnPrice > 0 && (
                            <RedRow
                                label="미리보상 할인"
                                value={`${guaranteedReturnPrice.toLocaleString()}원`}
                                tooltip="미리보상 프로그램 적용 시 단말기 가격의 50% 할인"
                            />
                        )}

                        {/* 스페셜 할인 */}
                        {specialPrice > 0 && (
                            <RedRow label="스페셜 할인" value={`${specialPrice.toLocaleString()}원`} />
                        )}

                        {/* 더블스토리지 할인 */}
                        {doubleStorageDiscount > 0 && (
                            <RedRow label="더블스토리지 할인" value={`${doubleStorageDiscount.toLocaleString()}원`} />
                        )}

                        <Dashed />

                        {/* 할부원금 */}
                        <Row
                            label="할부원금"
                            value={`${installmentPrincipal.toLocaleString()}원`}
                            bold large
                        />
                    </Card>

                    {/* ── 카드 2: 월 통신요금 ── */}
                    <Card>
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
                    </Card>

                    {/* ── 카드 3: 월 예상 금액 ── */}
                    <div style={totalCardStyle}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: "#374151" }}>월 예상 금액</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: "#0055FF" }}>
                            {Math.round(totalMonthPayment).toLocaleString()}원
                        </span>
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
const totalCardStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#F9FAFB",
    border: "1.5px solid #E5E7EB",
    borderRadius: 12,
    padding: "16px 18px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}

addPropertyControls(OrderSheetComponent, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    stepNumber: { type: ControlType.Number, title: "Step No.", defaultValue: 7, min: 1, max: 9 },
    title: { type: ControlType.String, title: "Title", defaultValue: "최종 주문서" },
    installmentPaymentTitle: { type: ControlType.String, title: "할부 타이틀", defaultValue: "월 할부원금 (24개월)" },
    installmentPaymentDescription: { type: ControlType.String, title: "할부 설명", defaultValue: "분할 상환 수수료 5.9% 포함" },
    installmentPayment: { type: ControlType.String, title: "월 할부금", defaultValue: "32,631원" },
    installment: {
        type: ControlType.Number, title: "할부", defaultValue: 24,
        options: [0, 24, 36, 48], optionTitles: ["일시불", "24개월", "36개월", "48개월"],
    },
    devicePrice: { type: ControlType.Number, title: "출고가", defaultValue: 1287000 },
    disclosureSubsidy: { type: ControlType.Number, title: "공시지원금", defaultValue: 0 },
    ktmarketSubsidy: { type: ControlType.Number, title: "KT마켓 단독지원금", defaultValue: 470000 },
    promotionDiscount: { type: ControlType.Number, title: "디바이스 추가지원금", defaultValue: 80000 },
    installmentPrincipal: { type: ControlType.Number, title: "할부원금", defaultValue: 737000 },
    plan: { type: ControlType.String, title: "요금제명", defaultValue: "가전구독 초이스 스페셜" },
    planPrice: { type: ControlType.Number, title: "요금제 금액", defaultValue: 110000 },
    planDiscountAmount: { type: ControlType.Number, title: "요금제 할인액", defaultValue: 27500 },
    totalMonthPlanPrice: { type: ControlType.Number, title: "월 통신요금(할인 후)", defaultValue: 82500 },
    totalMonthPayment: { type: ControlType.Number, title: "월 예상 금액", defaultValue: 115131 },
    discount: {
        type: ControlType.Enum, title: "할인 유형",
        options: ["공통지원금", "선택약정할인"], defaultValue: "선택약정할인",
    },
})
