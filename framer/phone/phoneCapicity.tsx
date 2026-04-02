// withCapacity override와 함께 사용
// 이미지9 기준: [2] 용량 선택 헤더 + flex 버튼 행 + 스켈레톤

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

// ─────────────────────────────────────────
// 스켈레톤 버튼
// ─────────────────────────────────────────
const SkeletonButton = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        style={{ flex: 1, minWidth: 0, height: "31.855px", borderRadius: "6.197px", backgroundColor: "#E5E7EB" }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
    />
)

// ─────────────────────────────────────────
// 개별 용량 버튼
// ─────────────────────────────────────────
const CapacityButton = ({ capacity, path, currentModelId, onCapacitySelect }) => {
    const isActive = currentModelId === path

    return (
        <motion.div
            onClick={() => onCapacitySelect && onCapacitySelect(path)}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            style={{
                flex: 1,
                minWidth: 0,
                height: "31.855px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                padding: "9.915px",
                gap: "9.915px",
                border: isActive ? "1.5px solid #0055FF" : "0.6px solid #EAEBEC",
                borderRadius: "6.197px",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                boxSizing: "border-box",
                userSelect: "none",
            }}
        >
            {/* 라디오 서클 */}
            <div
                style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "9999px",
                    border: `2px solid ${isActive ? "#0055FF" : "#D1D5DB"}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                }}
            >
                {isActive && (
                    <div
                        style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "9999px",
                            backgroundColor: "#0055FF",
                        }}
                    />
                )}
            </div>

            {/* 용량 텍스트 */}
            <span
                style={{
                    fontSize: "13px",
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#0055FF" : "#374151",
                    letterSpacing: "-0.2px",
                    transition: "color 0.15s",
                    lineHeight: 1,
                }}
            >
                {capacity}
            </span>
        </motion.div>
    )
}

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function PhoneCapacitySectionComponent(props) {
    const {
        capacities = [],
        currentModelId,
        isLoading = false,
        onCapacitySelect,
        stepNumber = 2,
        title = "용량 선택",
    } = props

    const skeletonCount = capacities.length > 0 ? capacities.length : 2

    // ── 스켈레톤 ──
    if (isLoading) {
        return (
            <div style={wrapperStyle}>
                {/* 헤더 */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                    <motion.div
                        style={{ width: 80, height: 18, borderRadius: 6, backgroundColor: "#E5E7EB" }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                    />
                </div>
                {/* 버튼 행 */}
                <div style={rowStyle}>
                    {Array.from({ length: skeletonCount }).map((_, i) => (
                        <SkeletonButton key={i} delay={i * 0.08} />
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
                <span style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#111827",
                    fontFamily: '"Pretendard", "Inter", sans-serif',
                }}>
                    {title}
                </span>
            </div>

            {/* ── 버튼 행 ── */}
            <div style={rowStyle}>
                {capacities.map((item, index) => (
                    <CapacityButton
                        key={`capacity-${index}`}
                        capacity={item.capacity}
                        path={item.path}
                        currentModelId={currentModelId}
                        onCapacitySelect={onCapacitySelect}
                    />
                ))}
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

const rowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: "8px",
    alignItems: "stretch",
}

addPropertyControls(PhoneCapacitySectionComponent, {
    isLoading: {
        type: ControlType.Boolean,
        title: "Loading",
        defaultValue: false,
    },
    stepNumber: {
        type: ControlType.Number,
        title: "Step No.",
        defaultValue: 2,
        min: 1,
        max: 9,
    },
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "용량 선택",
    },
    currentModelId: {
        type: ControlType.String,
        title: "Current Model ID",
    },
    capacities: {
        type: ControlType.Array,
        title: "Capacities",
        defaultValue: [
            { capacity: "256GB", path: "256" },
            { capacity: "512GB", path: "512" },
            { capacity: "1TB",   path: "1tb" },
            { capacity: "2TB",   path: "2tb" },
        ],
        propertyControl: {
            type: ControlType.Object,
            controls: {
                capacity: { type: ControlType.String, title: "Capacity" },
                path:     { type: ControlType.String, title: "Path" },
            },
        },
    },
})
