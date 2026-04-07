// withColorCapacity override와 함께 사용
// 용량 + 색상 통합 선택 컴포넌트
// 평소: 요약 카드 (이미지 + 색상명 + 용량 + 화살표)
// 클릭 시: 바텀시트 모달 (용량 세그먼트 탭 + 색상 리스트)

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Color {
    kr: string
    en: string
    code: string
    isSoldOut: boolean
    urls: string[]
}

interface Capacity {
    capacity: string
    path: string
}

const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 스켈레톤 ────────────────────────────────────────────────────────
const Pulse = ({ w = "100%", h = 18, r = 8 }: { w?: string | number; h?: number; r?: number }) => (
    <motion.div
        style={{ width: w, height: h, borderRadius: r, backgroundColor: "#E5E7EB", flexShrink: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    />
)

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function ColorCapacitySelector(props) {
    const {
        colors = [] as Color[],
        capacities = [] as Capacity[],
        currentModelId = "",
        selectedColor = null as Color | null,
        onColorChange,
        onCapacitySelect,
        isLoading = false,
        title = "용량 및 색상",
    } = props

    const [showModal, setShowModal] = useState(false)
    const touchStartY = useRef(0)

    // 모달 열릴 때 배경 스크롤 차단
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [showModal])

    const handleSheetTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY
    }
    const handleSheetTouchEnd = (e: React.TouchEvent) => {
        const delta = e.changedTouches[0].clientY - touchStartY.current
        if (delta > 60) setShowModal(false)
    }

    const activeColor: Color | null = selectedColor ?? (colors.length > 0 ? colors[0] : null)
    const activeCapacity: Capacity | null =
        capacities.find((c) => c.path === currentModelId) ?? capacities[0] ?? null

    const handleColorSelect = (color: Color) => {
        if (color.isSoldOut) return
        onColorChange?.(color)
        setShowModal(false)
    }

    const handleCapacitySelect = (path: string) => {
        onCapacitySelect?.(path)
    }

    // ── 스켈레톤 ──
    if (isLoading) {
        return (
            <div style={wrapperStyle}>
                <Pulse w={80} h={16} r={4} />
                <div style={{
                    width: "100%", height: 72,
                    borderRadius: 10.526, border: "1px solid #DADADA",
                    backgroundColor: "#FFF", padding: "0 16px",
                    display: "flex", alignItems: "center", gap: 14, boxSizing: "border-box",
                }}>
                    <Pulse w={48} h={48} r={8} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                        <Pulse w={60} h={14} r={4} />
                        <Pulse w={40} h={12} r={4} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div style={wrapperStyle}>
                {/* 섹션 타이틀 */}
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                    {title}
                </span>

                {/* 요약 카드 */}
                <motion.div
                    onClick={() => setShowModal(true)}
                    whileTap={{ scale: 0.985 }}
                    style={{
                        width: "100%", height: 72,
                        borderRadius: 10.526,
                        border: "1px solid #DADADA",
                        backgroundColor: "#FFF",
                        display: "flex", alignItems: "center",
                        padding: "0 16px", gap: 14,
                        boxSizing: "border-box", cursor: "pointer",
                    }}
                >
                    {/* 기기 이미지 */}
                    {activeColor?.urls?.[0] ? (
                        <img
                            src={activeColor.urls[0]}
                            alt={activeColor.kr}
                            style={{ width: 48, height: 48, objectFit: "contain", flexShrink: 0 }}
                        />
                    ) : (
                        <div style={{
                            width: 48, height: 48, borderRadius: 8,
                            backgroundColor: activeColor?.code || "#F3F4F6", flexShrink: 0,
                        }} />
                    )}

                    {/* 색상명 + 용량 */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: FONT }}>
                            {activeColor?.kr ?? "색상 선택"}
                        </span>
                        <span style={{ fontSize: 13, color: "#9CA3AF", fontFamily: FONT }}>
                            {activeCapacity?.capacity ?? ""}
                        </span>
                    </div>

                    {/* 화살표 */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </motion.div>
            </div>

            {/* ── 바텀시트 모달 ── */}
            <AnimatePresence>
                {showModal && (
                    <>
                        {/* 딤 오버레이 */}
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setShowModal(false)}
                            style={{
                                position: "fixed", inset: 0,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                zIndex: 9998,
                            }}
                        />

                        {/* 시트 */}
                        <motion.div
                            key="sheet"
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 340, damping: 32 }}
                            style={{
                                position: "fixed", bottom: 0, left: 0, right: 0,
                                margin: "0 auto", maxWidth: 440, width: "100%",
                                backgroundColor: "#FFF",
                                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                                boxShadow: "0 -4px 28px rgba(0,0,0,0.15)",
                                zIndex: 9999,
                                display: "flex", flexDirection: "column",
                                maxHeight: "80vh", fontFamily: FONT,
                            }}
                        >
                            {/* 핸들 — 스와이프 다운으로 닫기 */}
                            <div
                                style={{ padding: "14px 20px 0", flexShrink: 0, cursor: "grab" }}
                                onTouchStart={handleSheetTouchStart}
                                onTouchEnd={handleSheetTouchEnd}
                            >
                                <div style={{
                                    width: 40, height: 4, borderRadius: 9999,
                                    backgroundColor: "#E5E7EB", margin: "0 auto",
                                }} />
                            </div>

                            {/* 용량 세그먼트 탭 */}
                            {capacities.length > 1 && (
                                <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
                                    <div style={{
                                        display: "flex", backgroundColor: "#F3F4F6",
                                        borderRadius: 10, padding: 4, gap: 4,
                                    }}>
                                        {capacities.map((cap) => {
                                            const isActive = cap.path === currentModelId
                                            return (
                                                <motion.button
                                                    key={cap.path}
                                                    onClick={() => handleCapacitySelect(cap.path)}
                                                    whileTap={{ scale: 0.97 }}
                                                    style={{
                                                        flex: 1, height: 36, border: "none",
                                                        borderRadius: 7,
                                                        backgroundColor: isActive ? "#FFFFFF" : "transparent",
                                                        boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                                                        color: isActive ? "#111827" : "#9CA3AF",
                                                        fontSize: 14, fontWeight: isActive ? 700 : 400,
                                                        cursor: "pointer", fontFamily: FONT,
                                                    }}
                                                >
                                                    {cap.capacity}
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 색상 리스트 */}
                            <div style={{
                                flex: 1, overflowY: "auto",
                                padding: "12px 20px 32px",
                                display: "flex", flexDirection: "column", gap: 8,
                            }}>
                                {colors.map((color, index) => {
                                    const isActive = activeColor?.en === color.en
                                    return (
                                        <motion.div
                                            key={index}
                                            onClick={() => !color.isSoldOut && handleColorSelect(color)}
                                            whileTap={color.isSoldOut ? {} : { scale: 0.98 }}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 14,
                                                padding: "10px 16px",
                                                border: isActive ? "1.5px solid #0055FF" : "1px solid #E5E7EB",
                                                borderRadius: 12,
                                                backgroundColor: isActive ? "#EEF4FF" : "#FFF",
                                                cursor: color.isSoldOut ? "not-allowed" : "pointer",
                                                opacity: color.isSoldOut ? 0.45 : 1,
                                                boxSizing: "border-box",
                                            }}
                                        >
                                            {/* 라디오 */}
                                            <div style={{
                                                width: 20, height: 20, borderRadius: "50%",
                                                border: `2px solid ${isActive ? "#0055FF" : "#D1D5DB"}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0, boxSizing: "border-box",
                                            }}>
                                                {isActive && (
                                                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#0055FF" }} />
                                                )}
                                            </div>

                                            {/* 기기 이미지 */}
                                            {color.urls?.[0] ? (
                                                <img
                                                    src={color.urls[0]}
                                                    alt={color.kr}
                                                    style={{ width: 60, height: 60, objectFit: "contain", flexShrink: 0 }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: 60, height: 60, borderRadius: 8,
                                                    backgroundColor: color.code || "#F3F4F6", flexShrink: 0,
                                                }} />
                                            )}

                                            {/* 색상명 */}
                                            <div style={{ flex: 1 }}>
                                                <span style={{
                                                    fontSize: 15,
                                                    fontWeight: isActive ? 700 : 400,
                                                    color: isActive ? "#111827" : "#374151",
                                                    fontFamily: FONT,
                                                }}>
                                                    {color.kr}
                                                </span>
                                                {color.isSoldOut && (
                                                    <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 6 }}>품절</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
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

addPropertyControls(ColorCapacitySelector, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    title: { type: ControlType.String, title: "Title", defaultValue: "용량 및 색상" },
    currentModelId: { type: ControlType.String, title: "Current Model ID" },
    capacities: {
        type: ControlType.Array,
        title: "Capacities",
        defaultValue: [
            { capacity: "256GB", path: "sm-s948nk" },
            { capacity: "512GB", path: "sm-s948nk512" },
        ],
        propertyControl: {
            type: ControlType.Object,
            controls: {
                capacity: { type: ControlType.String, title: "Capacity" },
                path: { type: ControlType.String, title: "Path" },
            },
        },
    },
    colors: {
        type: ControlType.Array,
        title: "Colors",
        defaultValue: [
            { kr: "블랙", en: "Black", code: "#1C1C1E", isSoldOut: false, urls: [] },
            { kr: "화이트", en: "White", code: "#F5F5F5", isSoldOut: false, urls: [] },
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
