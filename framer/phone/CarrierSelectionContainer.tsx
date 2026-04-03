// withRegister override와 함께 사용
// 이미지6 기준: 섹션 번호 + 타이틀 + 부제 + flex 4버튼 행 + 스켈레톤

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"

// ─────────────────────────────────────────
// 스켈레톤
// ─────────────────────────────────────────
const Skeleton = ({ width, height, radius = 8, style = {} }: {
    width: string | number
    height: number
    radius?: number
    style?: React.CSSProperties
}) => (
    <motion.div
        style={{ width, height, borderRadius: radius, backgroundColor: "#E5E7EB", flexShrink: 0, ...style }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
)

// ─────────────────────────────────────────
// 개별 통신사 버튼
// ─────────────────────────────────────────
function CarrierButton({ id, logo, label, color, isActive, onClick }: {
    id: string
    logo?: string
    label: string
    color?: string
    isActive: boolean
    onClick: () => void
}) {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.96 }}
            style={{
                flex: 1,
                width: "75px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "11.77px",
                backgroundColor: "#FFFFFF",
                border: isActive ? "1.2px solid #0055FF" : "1.2px solid #E5E7EB",
                borderRadius: "7px",
                cursor: "pointer",
                padding: "8.972px 12.194px",
                boxSizing: "border-box",
                transition: "border-color 0.15s, border-width 0.15s",
            }}
        >
            {logo ? (
                <img
                    src={logo}
                    alt={id}
                    style={{
                        width: "17px",
                        height: "14px",
                        flexShrink: 0,
                        aspectRatio: "17 / 14",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <span style={{
                    fontSize: id === "알뜰폰" ? "12px" : "16px",
                    fontWeight: 700,
                    color: isActive ? "#0055FF" : (color ?? "#111827"),
                    letterSpacing: "-0.3px",
                    lineHeight: 1,
                    flexShrink: 0,
                }}>
                    {label}
                </span>
            )}
        </motion.button>
    )
}

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────
export default function CarrierSelectionContainer(props) {
    const {
        stepNumber = 3,
        title = "현재 통신사 선택",
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

    // 선택된 통신사에 따른 부제 텍스트
    const getSubtitle = () => {
        if (activeId === "KT") return "기기변경 | 이용 중인 KT 번호 그대로 핸드폰만 바꿀 수 있어요"
        if (["SKT", "LG U+", "알뜰폰"].includes(activeId)) return "번호이동 | 쓰던 번호 그대로 통신사만 KT로 바꿀 수 있어요"
        if (activeId === "신규가입") return "신규가입 | KT에서 새로운 번호로 가입할 수 있어요"
        return ""
    }

    const carriers = [
        { id: "KT", label: "kt", color: "#0055FF", logo: logoKT },
        { id: "SKT", label: "T", color: "#EA002C", logo: logoSK },
        { id: "LG U+", label: "U+", color: "#E6007E", logo: logoLG },
        { id: "알뜰폰", label: "알뜰폰", color: "#111827" },
    ]

    // ── 스켈레톤 ──
    if (isLoading) {
        return (
            <div style={wrapperStyle}>
                {/* 헤더 행 */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* 번호 배지 */}
                    <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        backgroundColor: "#111827",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                            {stepNumber}
                        </span>
                    </div>
                    <Skeleton width="40%" height={18} />
                </div>
                {/* 부제 */}
                <Skeleton width="75%" height={14} />
                {/* 버튼 행 */}
                <div style={{ display: "flex", gap: "8px" }}>
                    {[0, 1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            style={{ flex: 1, height: 42, borderRadius: 10, backgroundColor: "#E5E7EB" }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                        />
                    ))}
                </div>
            </div>
        )
    }

    // ── 실제 렌더 ──
    return (
        <div style={wrapperStyle}>
            {/* ── 섹션 헤더 ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* 번호 배지 */}
                <div style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    backgroundColor: "#111827",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                        {stepNumber}
                    </span>
                </div>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                    {title}
                </span>
            </div>

            {/* ── 부제 텍스트 (선택 상태에 따라 전환) ── */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={activeId}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.18 }}
                    style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#6B7280",
                        lineHeight: 1.5,
                    }}
                >
                    {getSubtitle()}
                </motion.p>
            </AnimatePresence>

            {/* ── 통신사 버튼 flex 행 ── */}
            <div style={{ display: "flex", gap: "8px" }}>
                {carriers.map((c) => (
                    <CarrierButton
                        key={c.id}
                        {...c}
                        isActive={activeId === c.id}
                        onClick={() => handleSelect(c.id)}
                    />
                ))}
            </div>

            {/* ── 신규가입 버튼 (조건부) ── */}
            <AnimatePresence>
                {showNewSubscription && (
                    <motion.button
                        key="new-sub"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 42 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleSelect("신규가입")}
                        style={{
                            width: "100%",
                            height: "42px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#FFFFFF",
                            border: `${activeId === "신규가입" ? "2px solid #0055FF" : "1.5px solid #E5E7EB"}`,
                            borderRadius: "10px",
                            cursor: "pointer",
                            overflow: "hidden",
                        }}
                    >
                        <span style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: activeId === "신규가입" ? "#0055FF" : "#111827",
                        }}>
                            신규가입
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

const wrapperStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxSizing: "border-box",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}

addPropertyControls(CarrierSelectionContainer, {
    isLoading: {
        type: ControlType.Boolean,
        title: "Loading",
        defaultValue: false,
    },
    stepNumber: {
        type: ControlType.Number,
        title: "Step No.",
        defaultValue: 3,
        min: 1,
        max: 9,
    },
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "현재 통신사 선택",
    },
    defaultCarrier: {
        type: ControlType.Enum,
        options: ["KT", "SKT", "LG U+", "알뜰폰", "신규가입"],
        defaultValue: "KT",
        title: "Default Carrier",
    },
    showNewSubscription: {
        type: ControlType.Boolean,
        title: "신규가입 표시",
        defaultValue: false,
    },
    logoKT: { type: ControlType.Image, title: "KT Logo" },
    logoSK: { type: ControlType.Image, title: "SKT Logo" },
    logoLG: { type: ControlType.Image, title: "LG U+ Logo" },
})
