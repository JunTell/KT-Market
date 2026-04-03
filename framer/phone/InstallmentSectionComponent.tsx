// withInstallmentSection override와 함께 사용
// [6] 단말기 할부 기간 — 일시불 / 24개월 / 36개월 / 48개월

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const OPTIONS: { label: string; value: number }[] = [
    { label: "일시불", value: 0 },
    { label: "24개월", value: 24 },
    { label: "36개월", value: 36 },
    { label: "48개월", value: 48 },
]

// ─── 스켈레톤 ────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <div style={{ display: "flex", gap: 8 }}>
        {OPTIONS.map((_, i) => (
            <motion.div
                key={i}
                style={{ flex: 1, height: 44, borderRadius: 8, backgroundColor: "#E5E7EB" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.07 }}
            />
        ))}
    </div>
)

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function InstallmentSectionComponent(props) {
    const {
        installment = 24,                           // 현재 선택된 할부 개월 (withInstallmentSection에서 주입)
        onInstallmentChange = null,                 // 선택 콜백
        isGuaranteedReturn = false,                 // 미리보상 여부 (true면 컴포넌트 숨김)
        isLoading = false,
        stepNumber = 6,
        title = "단말기 할부 기간",
    } = props

    // 미리보상 선택 시 숨김 (withInstallmentSection이 null 반환하므로 이중 방어)
    if (isGuaranteedReturn) return null

    const handleClick = (value: number) => {
        if (isGuaranteedReturn && value !== 0 && value !== 24) {
            alert(
                "미리보상을 선택하신 고객님의 경우\n일시불 혹은 24개월 할부만 선택하실 수 있습니다."
            )
            return
        }
        onInstallmentChange?.(value)
    }

    return (
        <div style={wrapperStyle}>
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={stepBadge}>
                    <span style={stepText}>{stepNumber}</span>
                </div>
                <span style={titleStyle}>{title}</span>
            </div>

            {/* 버튼 행 */}
            {isLoading ? (
                <SkeletonRow />
            ) : (
                <div style={{ display: "flex", gap: 8 }}>
                    {OPTIONS.map(({ label, value }) => {
                        const isActive = installment === value
                        return (
                            <motion.button
                                key={value}
                                onClick={() => handleClick(value)}
                                whileTap={{ scale: 0.96 }}
                                style={{
                                    flex: 1,
                                    height: 44,
                                    border: isActive ? "2px solid #0055FF" : "1.5px solid #E5E7EB",
                                    borderRadius: 8,
                                    backgroundColor: "#FFFFFF",
                                    color: isActive ? "#0055FF" : "#374151",
                                    fontSize: 14,
                                    fontWeight: isActive ? 700 : 400,
                                    cursor: "pointer",
                                    transition: "border-color 0.15s, color 0.15s",
                                    fontFamily: '"Pretendard", "Inter", sans-serif',
                                }}
                            >
                                {label}
                            </motion.button>
                        )
                    })}
                </div>
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
const stepText: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#FFFFFF" }
const titleStyle: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: "#111827",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}

addPropertyControls(InstallmentSectionComponent, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    stepNumber: { type: ControlType.Number, title: "Step No.", defaultValue: 6, min: 1, max: 9 },
    title: { type: ControlType.String, title: "Title", defaultValue: "단말기 할부 기간" },
    installment: {
        type: ControlType.Number,
        title: "Installment",
        defaultValue: 24,
        options: [0, 24, 36, 48],
        optionTitles: ["일시불", "24개월", "36개월", "48개월"],
    },
})
