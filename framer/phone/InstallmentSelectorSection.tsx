// withInstallmentSection override와 함께 사용
// 단말기 할부 기간 — 기본 3개(일시불/24/36) + + 버튼으로 전체 확장

import { addPropertyControls, ControlType } from "framer"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

// 기본 노출 3개
const PRIMARY: { label: string; value: number }[] = [
    { label: "일시불", value: 0 },
    { label: "24개월", value: 24 },
    { label: "36개월", value: 36 },
]

// + 눌렀을 때 추가로 보이는 옵션 (전체 7개 그리드)
const ALL: { label: string; value: number }[] = [
    { label: "일시불", value: 0 },
    { label: "24개월", value: 24 },
    { label: "36개월", value: 36 },
    { label: "6개월", value: 6 },
    { label: "12개월", value: 12 },
    { label: "30개월", value: 30 },
    { label: "48개월", value: 48 },
]

// ─── 스켈레톤 ────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2, 3].map((i) => (
            <motion.div
                key={i}
                style={{ flex: 1, height: 50, borderRadius: 10, backgroundColor: "#E5E7EB" }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.07 }}
            />
        ))}
    </div>
)

// ─── 개별 버튼 ────────────────────────────────────────────────────────
function InstallmentBtn({
    label, value, isActive, onClick,
}: {
    label: string; value: number; isActive: boolean; onClick: () => void
}) {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.96 }}
            style={{
                flex: 1,
                height: 50,
                border: isActive ? "1.5px solid #0055FF" : "1.5px solid #E5E7EB",
                borderRadius: 10,
                backgroundColor: "#FFFFFF",
                color: isActive ? "#0055FF" : "#9CA3AF",
                fontSize: 15,
                fontWeight: isActive ? 700 : 400,
                cursor: "pointer",
                fontFamily: FONT,
                boxSizing: "border-box",
            }}
        >
            {label}
        </motion.button>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function InstallmentSelectorSection(props) {
    const {
        installment = 24,
        onInstallmentChange = null,
        isGuaranteedReturn = false,
        isLoading = false,
        title = "단말기 할부 기간",
    } = props

    const [isExpanded, setIsExpanded] = useState(false)

    if (isGuaranteedReturn) return null

    const handleClick = (value: number) => {
        onInstallmentChange?.(value)
    }

    return (
        <div style={wrapperStyle}>
            {/* 타이틀 */}
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                {title}
            </span>

            {isLoading ? (
                <SkeletonRow />
            ) : (
                <AnimatePresence initial={false} mode="wait">
                    {!isExpanded ? (
                        // ── 접힌 상태: 3개 + + 버튼 ──
                        <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{ display: "flex", gap: 8 }}
                        >
                            {PRIMARY.map(({ label, value }) => (
                                <InstallmentBtn
                                    key={value}
                                    label={label}
                                    value={value}
                                    isActive={installment === value}
                                    onClick={() => handleClick(value)}
                                />
                            ))}

                            {/* + 버튼 */}
                            <motion.button
                                onClick={() => setIsExpanded(true)}
                                whileTap={{ scale: 0.96 }}
                                style={{
                                    flex: 1,
                                    height: 50,
                                    border: "1.5px solid #E5E7EB",
                                    borderRadius: 10,
                                    backgroundColor: "#FFFFFF",
                                    color: "#9CA3AF",
                                    fontSize: 20,
                                    fontWeight: 300,
                                    cursor: "pointer",
                                    fontFamily: FONT,
                                    boxSizing: "border-box",
                                }}
                            >
                                +
                            </motion.button>
                        </motion.div>
                    ) : (
                        // ── 펼친 상태: 3열 그리드 ──
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 8,
                            }}
                        >
                            {ALL.map(({ label, value }) => (
                                <InstallmentBtn
                                    key={value}
                                    label={label}
                                    value={value}
                                    isActive={installment === value}
                                    onClick={() => {
                                        handleClick(value)
                                        setIsExpanded(false)
                                    }}
                                />
                            ))}

                            {/* − 접기 버튼 (마지막 빈 자리) */}
                            <motion.button
                                onClick={() => setIsExpanded(false)}
                                whileTap={{ scale: 0.96 }}
                                style={{
                                    height: 50,
                                    border: "1.5px solid #E5E7EB",
                                    borderRadius: 10,
                                    backgroundColor: "#FFFFFF",
                                    color: "#9CA3AF",
                                    fontSize: 20,
                                    fontWeight: 300,
                                    cursor: "pointer",
                                    fontFamily: FONT,
                                    boxSizing: "border-box",
                                }}
                            >
                                −
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
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

addPropertyControls(InstallmentSelectorSection, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    title: { type: ControlType.String, title: "Title", defaultValue: "단말기 할부 기간" },
    installment: {
        type: ControlType.Enum,
        title: "Installment",
        options: [0, 6, 12, 24, 30, 36, 48],
        optionTitles: ["일시불", "6개월", "12개월", "24개월", "30개월", "36개월", "48개월"],
        defaultValue: 24,
    },
})
