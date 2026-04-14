// withRegister override와 함께 사용
// 현재 통신사 선택 — 수평 4분할 버튼 + 하단 설명 텍스트 UI

import * as React from "react"
import { useMemo } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 통신사 데이터 ─────────────────────────────────────────────────────
const CARRIERS = [
    {
        id: "KT",
        label: "kt",
        labelColor: "#0055FF",
        fontWeight: 800,
        fontSize: 20,
        letterSpacing: "-0.5px",
        joinType: "기기변경",
        description: "이용 중인 KT 번호 그대로 핸드폰만 바꿀 수 있어요",
    },
    {
        id: "SKT",
        label: "T",
        labelColor: "#EA002C",
        fontWeight: 800,
        fontSize: 22,
        letterSpacing: "-0.5px",
        joinType: "번호이동",
        description: "쓰던 번호 그대로 통신사만 KT로 바꿀 수 있어요",
    },
    {
        id: "LG U+",
        label: "U+",
        labelColor: "#E6007E",
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: "-0.5px",
        joinType: "번호이동",
        description: "쓰던 번호 그대로 통신사만 KT로 바꿀 수 있어요",
    },
    {
        id: "알뜰폰",
        label: "알뜰폰",
        labelColor: "#374151",
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: "0",
        joinType: "번호이동",
        description: "쓰던 번호 그대로 통신사만 KT로 바꿀 수 있어요",
    },
]

// ─── 스켈레톤 ────────────────────────────────────────────────────────
const Skeleton = () => (
    <div style={wrapperStyle}>
        {/* 타이틀 스켈레톤 */}
        <motion.div
            style={{ width: 80, height: 18, borderRadius: 6, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* 버튼 4개 스켈레톤 */}
        <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    style={{ flex: 1, height: 40, borderRadius: 7, backgroundColor: "#E5E7EB" }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                />
            ))}
        </div>
        {/* 설명 텍스트 스켈레톤 */}
        <motion.div
            style={{ width: "70%", height: 14, borderRadius: 6, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
    </div>
)

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function CarrierJoinSelector(props) {
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

    // 이미지가 있으면 이미지 우선, 없으면 텍스트 로고 사용
    const logoMap: Record<string, string | undefined> = {
        KT: logoKT,
        SKT: logoSK,
        "LG U+": logoLG,
    }

    const activeId = defaultCarrier

    const handleSelect = (id: string) => {
        if (onValueChange) onValueChange(id)
    }

    const allCarriers = useMemo(() => showNewSubscription
        ? [...CARRIERS, {
            id: "신규가입",
            label: "신규",
            labelColor: "#111827",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0",
            joinType: "신규가입",
            description: "KT에서 새로운 번호로 가입할 수 있어요",
        }]
        : CARRIERS,
        [showNewSubscription])

    const activeCarrier = allCarriers.find((c) => c.id === activeId) ?? allCarriers[0]

    // 캐리어 수에 따른 폰트 스케일 (5개일 때 좁아지므로 축소)
    const fontScale = allCarriers.length >= 5 ? 0.82 : 1

    if (isLoading) return <Skeleton />

    return (
        <div style={wrapperStyle}>
            {/* 타이틀 */}
            <span style={{ fontSize: 17, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                {title}
            </span>

            {/* 수평 버튼 그리드 — flex:1로 균등 분배 */}
            <div style={{ display: "flex", gap: 6 }}>
                {allCarriers.map((c) => {
                    const isActive = activeId === c.id
                    const scaledFontSize = Math.round(c.fontSize * fontScale)
                    return (
                        <motion.button
                            key={c.id}
                            onClick={() => handleSelect(c.id)}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                display: "flex",
                                flex: 1,
                                minWidth: 0,
                                height: 40,
                                padding: "0 4px",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 8,
                                border: isActive ? "1.5px solid #0066FF" : "1.5px solid #E5E7EB",
                                backgroundColor: isActive ? "#ECF4FF" : "#FFFFFF",
                                cursor: "pointer",
                                boxSizing: "border-box",
                                fontFamily: FONT,
                                transition: "border-color 0.15s, background-color 0.15s",
                            }}
                        >
                            {logoMap[c.id] ? (
                                <img
                                    src={logoMap[c.id]}
                                    alt={c.id}
                                    style={{
                                        width: c.id === "SKT" ? 24 : c.id === "LG U+" ? 25 : "auto",
                                        height: c.id === "SKT" ? 17 : c.id === "LG U+" ? 21 : 14,
                                        maxWidth: "80%",
                                        objectFit: "contain",
                                        opacity: 1,
                                        userSelect: "none",
                                        pointerEvents: "none",
                                    }}
                                />
                            ) : (
                                <span style={{
                                    fontSize: scaledFontSize,
                                    fontWeight: c.fontWeight,
                                    color: isActive ? c.labelColor : "#9CA3AF",
                                    letterSpacing: c.letterSpacing,
                                    lineHeight: 1,
                                    fontFamily: FONT,
                                    transition: "color 0.15s",
                                    userSelect: "none",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}>
                                    {c.label}
                                </span>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* 선택된 통신사 설명 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCarrier.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT, marginTop: -4 }}
                >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
                        {activeCarrier.joinType}
                    </span>
                    <span style={{ fontSize: 12, color: "#9CA3AF", flexShrink: 0 }}>|</span>
                    <span style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.5, flex: 1 }}>
                        {activeCarrier.description}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

const wrapperStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxSizing: "border-box",
    fontFamily: FONT,
}

addPropertyControls(CarrierJoinSelector, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    title: { type: ControlType.String, title: "Title", defaultValue: "현재 통신사" },
    defaultCarrier: {
        type: ControlType.Enum,
        options: ["KT", "SKT", "LG U+", "알뜰폰", "신규가입"],
        optionTitles: ["KT", "SKT", "LG U+", "알뜰폰", "신규가입"],
        defaultValue: "KT",
        title: "Default Carrier",
    },
    showNewSubscription: { type: ControlType.Boolean, title: "신규가입 표시", defaultValue: false },
    logoKT: { type: ControlType.Image, title: "KT 로고" },
    logoSK: { type: ControlType.Image, title: "SKT 로고" },
    logoLG: { type: ControlType.Image, title: "LG U+ 로고" },
})
