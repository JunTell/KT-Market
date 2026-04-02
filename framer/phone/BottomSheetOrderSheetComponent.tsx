// withOrderSheet override와 함께 사용
// 하단 고정 BottomSheet (440px 고정, flex 2버튼)
// 카카오톡으로 10초 간편 주문 + 주문하기

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

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

// ─── 기기 정보 카드 (Image #3) ────────────────────────────────────────
const DeviceCard = ({
    image, petName, color, capacity, plan,
}: {
    image: string; petName: string; color: string; capacity: string; plan: string
}) => (
    <div style={{
        display: "flex", gap: 12, padding: "14px 16px",
        backgroundColor: "#F9FAFB", borderRadius: 12,
        border: "1.5px solid #E5E7EB", marginBottom: 12,
    }}>
        <div style={{
            width: 72, height: 72, borderRadius: 10, flexShrink: 0,
            overflow: "hidden", backgroundColor: "#E5E7EB",
        }}>
            {image ? (
                <img src={image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            ) : (
                <div style={{
                    width: "100%", height: "100%",
                    background: "repeating-linear-gradient(45deg,#D1D5DB 0px,#D1D5DB 4px,#E5E7EB 4px,#E5E7EB 12px)",
                }} />
            )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{petName || "petName"}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>{color || "color"}</span>
                <div style={{ width: 1, height: 11, backgroundColor: "#D1D5DB" }} />
                <span style={{ fontSize: 13, color: "#6B7280" }}>{capacity || "capacity"}</span>
            </div>
            <span style={{ fontSize: 13, color: "#6B7280" }}>{plan || "plan"}</span>
        </div>
    </div>
)

// ─── 카카오 아이콘 (원형 배지 스타일) ────────────────────────────────
const KakaoBadge = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="17" rx="15" ry="13.5" fill="#3A1D1D" />
        <path
            d="M18 6C12.477 6 8 9.806 8 14.5c0 3.12 1.963 5.86 4.94 7.43L12.1 26l4.37-2.87c.5.07 1.01.12 1.53.12 5.523 0 10-3.806 10-8.5S23.523 6 18 6z"
            fill="#FAE100"
        />
    </svg>
)

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function BottomSheetOrderSheetComponent(props) {
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
        // 기기 정보 (withOrderSheet에서 주입)
        devicePetName = "",
        deviceImage = "",
        deviceColor = "",
        deviceCapacity = "",
        // CTA
        formLink = "",
        phoneOrderLink = "tel:15880661",
        kakaoTalkLink = "https://pf.kakao.com/_xjxhxnj",
        // withOrderSheet에서 주입되는 네비게이션 핸들러
        onKakaoOrderClick,
    } = props

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // 카카오 간편주문 버튼 클릭
    const handleKakaoOrder = () => {
        if (typeof onKakaoOrderClick === "function") {
            onKakaoOrderClick()
        } else {
            window.location.href = "/phone/user-info"
        }
    }

    const handleFormLink = () => {
        if (formLink) window.open(formLink, "_blank")
    }

    if (!mounted) return <div style={{ height: 80 }} />

    const FONT = '"Pretendard", "Inter", sans-serif'

    const sheet = (
        <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 440,
            zIndex: 120,
            backgroundColor: "#FFFFFF",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -4px 28px rgba(0,0,0,0.13)",
            fontFamily: FONT,
        }}>
            {/* 월 예상 금액 행 */}
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-end",
                padding: "14px 16px 10px",
                borderBottom: "1px solid #F3F4F6",
            }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>월 예상 금액</span>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                        {Math.round(totalMonthPayment).toLocaleString()}원
                    </div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>부가세 포함</div>
                </div>
            </div>

            {/* CTA 버튼 2종 */}
            <div style={{
                display: "flex", gap: 8,
                padding: "10px 16px",
                paddingBottom: "calc(10px + env(safe-area-inset-bottom, 10px))",
            }}>
                {/* ① 카카오톡으로 10초 간편 주문 */}
                <button
                    onClick={handleKakaoOrder}
                    style={{
                        flex: 1, height: 52, borderRadius: 14,
                        border: "none", backgroundColor: "#FAE100",
                        cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        gap: 6, fontFamily: FONT,
                    }}
                >
                    <KakaoBadge size={22} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#3A1D1D", letterSpacing: "-0.2px" }}>
                        카카오톡으로 10초 간편 주문
                    </span>
                </button>

                {/* ② 주문하기 */}
                <button
                    onClick={handleFormLink}
                    style={{
                        flex: 1, height: 52, borderRadius: 14,
                        border: "none", backgroundColor: "#0055FF",
                        color: "#FFFFFF", fontSize: 14, fontWeight: 700,
                        cursor: "pointer", fontFamily: FONT,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    주문하기
                </button>
            </div>
        </div>
    )

    return createPortal(sheet, document.body)
}

addPropertyControls(BottomSheetOrderSheetComponent, {
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
