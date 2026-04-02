// withColor override와 함께 사용
// 이미지7 기준: [1] 색상 선택 헤더 + 컬러 서클 행 + 스켈레톤

import { addPropertyControls, ControlType } from "framer"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Color {
    kr: string
    en: string
    code: string
    isSoldOut: boolean
    urls: string[]
}

// ─────────────────────────────────────────
// 품절 사선 오버레이
// ─────────────────────────────────────────
const SoldOutLine = () => (
    <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: "50%" }}
        viewBox="0 0 36 36"
    >
        <line x1="7" y1="7" x2="29" y2="29" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

// ─────────────────────────────────────────
// 스켈레톤
// ─────────────────────────────────────────
const Pulse = ({ w, h, r = 8, delay = 0 }: { w: number | string; h: number; r?: number; delay?: number }) => (
    <motion.div
        style={{ width: w, height: h, borderRadius: r, backgroundColor: "#E5E7EB", flexShrink: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
    />
)

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function PhoneColorComponent(props) {
    const {
        colors = [] as Color[],
        onColorChange,
        isLoading = false,
        stepNumber = 1,
        title = "색상 선택",
        circleSize = 30,
    } = props

    const [selectedIndex, setSelectedIndex] = useState(0)

    const handleClick = (index: number, color: Color) => {
        if (color.isSoldOut) return
        setSelectedIndex(index)
        if (onColorChange) onColorChange(color)
    }

    // ── 스켈레톤 ──
    if (isLoading) {
        return (
            <div style={wrapperStyle}>
                {/* 헤더 */}
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
                    <Pulse w={80} h={18} r={6} delay={0.1} />
                </div>
                {/* 서클 3개 */}
                <div style={{ display: "flex", gap: "10px" }}>
                    {[0, 1, 2, 3].map((i) => (
                        <Pulse key={i} w={circleSize} h={circleSize} r={9999} delay={i * 0.1} />
                    ))}
                </div>
            </div>
        )
    }

    const selectedColor = colors[selectedIndex]

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
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#111827", fontFamily: '"Pretendard", "Inter", sans-serif' }}>
                    {title}
                </span>
            </div>

            {/* ── 색상 서클 행 ── */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {colors.map((color, index) => {
                    const isActive = selectedIndex === index

                    return (
                        <motion.div
                            key={index}
                            onClick={() => handleClick(index, color)}
                            title={color.kr}
                            whileTap={color.isSoldOut ? {} : { scale: 0.9 }}
                            style={{
                                position: "relative",
                                width: `${circleSize}px`,
                                height: `${circleSize}px`,
                                borderRadius: "50%",
                                backgroundColor: color.code || "#E5E7EB",
                                cursor: color.isSoldOut ? "not-allowed" : "pointer",
                                // 선택: 흰 틈 + 파란 외곽선
                                boxShadow: isActive
                                    ? "0 0 0 2.5px #ffffff, 0 0 0 4.5px #0055FF"
                                    : "0 0 0 1px rgba(0,0,0,0.12)",
                                opacity: color.isSoldOut ? 0.4 : 1,
                                transition: "box-shadow 0.18s ease, opacity 0.18s ease",
                                flexShrink: 0,
                            }}
                        >
                            {color.isSoldOut && <SoldOutLine />}
                        </motion.div>
                    )
                })}
            </div>
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

addPropertyControls(PhoneColorComponent, {
    isLoading: {
        type: ControlType.Boolean,
        title: "Loading",
        defaultValue: false,
    },
    stepNumber: {
        type: ControlType.Number,
        title: "Step No.",
        defaultValue: 1,
        min: 1,
        max: 9,
    },
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "색상 선택",
    },
    circleSize: {
        type: ControlType.Number,
        title: "Circle Size",
        defaultValue: 30,
        min: 24,
        max: 56,
        step: 2,
    },
    colors: {
        type: ControlType.Array,
        title: "Colors",
        defaultValue: [
            { kr: "팬텀 블랙", en: "Phantom Black", code: "#1C1C1E", isSoldOut: false, urls: [] },
            { kr: "클라우드 화이트", en: "Cloud White", code: "#D6D3CE", isSoldOut: false, urls: [] },
            { kr: "스카이 블루", en: "Sky Blue", code: "#9CC8D5", isSoldOut: false, urls: [] },
            { kr: "버건디", en: "Burgundy", code: "#7D2E3E", isSoldOut: false, urls: [] },
        ],
        propertyControl: {
            type: ControlType.Object,
            controls: {
                kr: { type: ControlType.String, title: "한국어" },
                en: { type: ControlType.String, title: "English" },
                code: { type: ControlType.Color, title: "Color" },
                isSoldOut: { type: ControlType.Boolean, title: "품절", defaultValue: false },
            },
        },
    },
})
