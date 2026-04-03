// withRegister override와 함께 사용
// 현재 통신사 선택 — 세로 카드 리스트 UI
// 라디오 + 로고 + (통신사 | 가입유형) + 설명

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 스켈레톤 ────────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        style={{ width: "100%", height: 72, borderRadius: 12, backgroundColor: "#E5E7EB" }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
    />
)

// ─── 개별 통신사 카드 ─────────────────────────────────────────────────
function CarrierCard({
    id, displayName, joinType, description,
    logo, textLogo, textColor,
    isActive, onClick,
}: {
    id: string
    displayName: string
    joinType: string
    description: string
    logo?: string
    textLogo?: string
    textColor?: string
    isActive: boolean
    onClick: () => void
}) {
    return (
        <motion.div
            onClick={onClick}
            whileTap={{ scale: 0.985 }}
            style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                border: isActive ? "1.5px solid #0055FF" : "1px solid #E5E7EB",
                borderRadius: 12,
                backgroundColor: isActive ? "#EEF4FF" : "#FFFFFF",
                cursor: "pointer", boxSizing: "border-box",
            }}
        >
            {/* 라디오 */}
            <div style={{
                width: 22, height: 22, borderRadius: "50%",
                border: `2px solid ${isActive ? "#0055FF" : "#D1D5DB"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxSizing: "border-box",
            }}>
                {isActive && (
                    <div style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "#0055FF" }} />
                )}
            </div>

            {/* 로고 영역 (고정 너비) */}
            <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {logo ? (
                    <img src={logo} alt={displayName} style={{ maxWidth: 44, maxHeight: 28, objectFit: "contain" }} />
                ) : (
                    <span style={{
                        fontSize: id === "알뜰폰" ? 13 : 20,
                        fontWeight: 800,
                        color: textColor ?? "#111827",
                        fontFamily: FONT,
                        letterSpacing: "-0.5px",
                        lineHeight: 1,
                    }}>
                        {textLogo ?? displayName}
                    </span>
                )}
            </div>

            {/* 텍스트 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                        {displayName}
                    </span>
                    <span style={{ fontSize: 13, color: "#9CA3AF", fontFamily: FONT }}>|</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", fontFamily: FONT }}>
                        {joinType}
                    </span>
                </div>
                <span style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.5, fontFamily: FONT }}>
                    {description}
                </span>
            </div>
        </motion.div>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function CarrierSelectionContainer(props) {
    const {
        title = "현재 통신사",
        defaultCarrier = "KT",
        logoKT,
        logoSK,
        logoLG,
        onValueChange,
        showNewSubscription = false,
        isLoading = false,
    } = props

    const activeId = defaultCarrier

    const handleSelect = (id: string) => {
        if (onValueChange) onValueChange(id)
    }

    const carriers = [
        {
            id: "KT",
            displayName: "KT",
            joinType: "기기변경",
            description: "이용 중인 KT 번호 그대로 핸드폰만 바꿀 수 있어요",
            logo: logoKT,
            textLogo: "kt",
            textColor: "#0055FF",
        },
        {
            id: "SKT",
            displayName: "SKT",
            joinType: "번호이동",
            description: "쓰던 번호 그대로 통신사만 KT로 바꿀 수 있어요",
            logo: logoSK,
            textLogo: "T",
            textColor: "#EA002C",
        },
        {
            id: "LG U+",
            displayName: "U+",
            joinType: "번호이동",
            description: "쓰던 번호 그대로 통신사만 KT로 바꿀 수 있어요",
            logo: logoLG,
            textLogo: "U+",
            textColor: "#E6007E",
        },
        {
            id: "알뜰폰",
            displayName: "알뜰폰",
            joinType: "번호이동",
            description: "쓰던 번호 그대로 통신사만 KT로 바꿀 수 있어요",
            logo: undefined,
            textLogo: "알뜰폰",
            textColor: "#111827",
        },
    ]

    // ── 스켈레톤 ──
    if (isLoading) {
        return (
            <div style={wrapperStyle}>
                <motion.div
                    style={{ width: 100, height: 18, borderRadius: 6, backgroundColor: "#E5E7EB" }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
                {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} delay={i * 0.08} />)}
            </div>
        )
    }

    // ── 실제 렌더 ──
    return (
        <div style={wrapperStyle}>
            {/* 타이틀 */}
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                {title}
            </span>

            {/* 통신사 카드 목록 */}
            {carriers.map((c) => (
                <CarrierCard
                    key={c.id}
                    {...c}
                    isActive={activeId === c.id}
                    onClick={() => handleSelect(c.id)}
                />
            ))}

            {/* 신규가입 (조건부) */}
            {showNewSubscription && (
                <CarrierCard
                    id="신규가입"
                    displayName="신규가입"
                    joinType="신규가입"
                    description="KT에서 새로운 번호로 가입할 수 있어요"
                    textLogo="신규"
                    textColor="#111827"
                    isActive={activeId === "신규가입"}
                    onClick={() => handleSelect("신규가입")}
                />
            )}
        </div>
    )
}

const wrapperStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxSizing: "border-box",
    fontFamily: FONT,
}

addPropertyControls(CarrierSelectionContainer, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    title: { type: ControlType.String, title: "Title", defaultValue: "현재 통신사" },
    defaultCarrier: {
        type: ControlType.Enum,
        options: ["KT", "SKT", "LG U+", "알뜰폰", "신규가입"],
        defaultValue: "KT",
        title: "Default Carrier",
    },
    showNewSubscription: { type: ControlType.Boolean, title: "신규가입 표시", defaultValue: false },
    logoKT: { type: ControlType.Image, title: "KT Logo" },
    logoSK: { type: ControlType.Image, title: "SKT Logo" },
    logoLG: { type: ControlType.Image, title: "LG U+ Logo" },
})
