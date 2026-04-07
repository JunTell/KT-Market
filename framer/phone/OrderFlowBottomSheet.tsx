// withOrderSheet override와 함께 사용
// 하단 고정 BottomSheet — 신청하기 버튼 클릭 시 모달 (카카오 로그인 / 비회원)
// 상세 신청서 탭 → 위로 올라오는 바텀시트로 OrderSummarySheet UI 표시

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ─── 숫자 카운트 애니메이션 훅 (easeOutCubic, ~1초) ──────────────────
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
                            zIndex: 200,
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
            {tooltip && <Tooltip text={tooltip}><QuestionIcon /></Tooltip>}
        </div>
        <span style={{ fontSize: large ? 17 : 14, fontWeight: bold ? 700 : 500, color: valueColor }}>
            {value}
        </span>
    </div>
)

// ─── 빨간 할인 행 ─────────────────────────────────────────────────────
const RedRow = ({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: "#EF4444" }}>{label}</span>
            {tooltip && <Tooltip text={tooltip}><QuestionIcon /></Tooltip>}
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
        marginBottom: 10,
    }}>
        {children}
    </div>
)

// ─── 섹션 헤더 ────────────────────────────────────────────────────────
const SectionHeader = ({ label, value, description }: { label: string; value?: string; description?: string }) => (
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

// ─── OrderSheet 내용 컴포넌트 ─────────────────────────────────────────
function OrderSheetContent({
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
}: {
    installment: number
    installmentPaymentTitle: string
    installmentPaymentDescription: string
    installmentPrincipal: number
    installmentPayment: string | number
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

    if (isLoading) {
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
                <SectionHeader
                    label={installmentPaymentTitle}
                    value={installmentPaymentStr}
                    description={installmentPaymentDescription}
                />
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
                <Row label="할부원금" value={`${installmentPrincipal.toLocaleString()}원`} bold large />
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
                <span style={{ fontSize: 20, fontWeight: 700, color: "#0055FF" }}>
                    {Math.round(totalMonthPayment).toLocaleString()}원
                </span>
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
}: {
    onClose: () => void
    onApply: () => void
    sheetProps: any
    FONT: string
}) {
    const touchStartY = useRef(0)
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
                    zIndex: 9998,
                }}
            />

            {/* 바텀시트 */}
            <motion.div
                key="detail-sheet"
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
                    maxWidth: 440,
                    width: "100%",
                    maxHeight: "88vh",
                    backgroundColor: "#FFFFFF",
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    boxShadow: "0 -4px 28px rgba(0,0,0,0.15)",
                    zIndex: 9999,
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
                >
                    {/* 핸들 */}
                    <div style={{
                        width: 40, height: 4, borderRadius: 9999,
                        backgroundColor: "#E5E7EB",
                        margin: "0 auto 16px",
                    }} />
                    {/* 제목 + 닫기 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>최종 신청서</span>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: "none", border: "none",
                                cursor: "pointer", padding: 4,
                                color: "#6B7280", display: "flex",
                                alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* 스크롤 가능한 내용 */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px 20px 8px",
                    boxSizing: "border-box",
                }}>
                    <OrderSheetContent {...sheetProps} />
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
                        onClick={onApply}
                        style={{
                            width: "100%", height: 52, borderRadius: 14,
                            border: "none", backgroundColor: "#0055FF",
                            color: "#FFFFFF", fontSize: 15, fontWeight: 700,
                            cursor: "pointer", fontFamily: FONT,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        신청하기
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────

const API_URL = "https://kt-market-puce.vercel.app"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
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
        kakaoTalkLink = "https://pf.kakao.com/_xjxhxnj",
        onKakaoOrderClick,
        onSaveOrderSession,
    } = props

    const [mounted, setMounted] = useState(false)
    const [showDetailSheet, setShowDetailSheet] = useState(false)

    // 모달 열릴 때 배경 스크롤 차단
    useEffect(() => {
        if (showDetailSheet) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [showDetailSheet])

    // ── 금액 변동 애니메이션 ──
    const roundedPayment = Math.round(totalMonthPayment)
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
            window.location.href = "/phone/user-info"
        }
    }

    if (!mounted) return <div style={{ height: 80 }} />

    const FONT = '"Pretendard", "Inter", sans-serif'

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

            {/* 금액 + 신청하기 버튼 한 행 */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 16px",
                paddingBottom: "calc(14px + env(safe-area-inset-bottom, 10px))",
            }}>
                {/* 왼쪽: 레이블 + 금액 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 13, color: "#9CA3AF", fontFamily: FONT }}>
                        월 예상 금액 <span style={{ fontSize: 11 }}>(부가세 포함)</span>
                    </span>
                    <motion.div
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: direction === "up" ? "#EF4444" : direction === "down" ? "#0055FF" : "#111827",
                            transition: "color 0.4s ease",
                            fontVariantNumeric: "tabular-nums",
                            fontFamily: FONT,
                        }}
                    >
                        {animatedPayment.toLocaleString()}원
                    </motion.div>
                </div>

                {/* 오른쪽: 신청하기 버튼 */}
                <button
                    onClick={handleFormLink}
                    style={{
                        height: 48, paddingLeft: 28, paddingRight: 28,
                        borderRadius: 14, border: "none",
                        backgroundColor: "#0055FF",
                        color: "#FFFFFF", fontSize: 16, fontWeight: 700,
                        cursor: "pointer", fontFamily: FONT,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    신청하기
                </button>
            </div>
        </div>
    )

    return (
        <>
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
                />
            )}
        </>
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
    installment: {
        type: ControlType.Number, title: "할부", defaultValue: 24,
        options: [0, 24, 36, 48], optionTitles: ["일시불", "24개월", "36개월", "48개월"],
    },
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
    discount: {
        type: ControlType.Enum, title: "할인 유형",
        options: ["공통지원금", "선택약정할인"], defaultValue: "공통지원금",
    },
    // CTA 링크
    formLink: { type: ControlType.String, title: "신청서 링크", defaultValue: "" },
    phoneOrderLink: { type: ControlType.String, title: "전화 주문 링크", defaultValue: "tel:15880661" },
    kakaoTalkLink: { type: ControlType.String, title: "카카오톡 채널 링크", defaultValue: "https://pf.kakao.com/_xjxhxnj" },
})
