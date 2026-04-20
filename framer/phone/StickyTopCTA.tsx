// 스크롤 시 상단 고정 CTA + 요금제 요약 바
// iPhone 17/Pro 등 상세 페이지에서 첫 뷰포트 이탈 시 노출
// withStickyTopCTA override와 함께 사용

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function StickyTopCTA(props) {
    const {
        devicePetName = "",
        finalPrice = 0,
        monthlyPayment = 0,
        plan = "",
        ctaLabel = "신청하기",
        isSoldOut = false,
        restockLabel = "입고 알림",
        isLoading = false,
        onApplyClick,
        onRestockClick,
        showThreshold = 300,
    } = props

    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > showThreshold)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener("scroll", handleScroll)
    }, [showThreshold])

    if (isLoading) return null

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        margin: "0 auto",
                        maxWidth: 440,
                        width: "100%",
                        zIndex: 110,
                        backgroundColor: "rgba(255,255,255,0.97)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        borderBottom: "1px solid #E5E7EB",
                        fontFamily: FONT,
                        padding: "0 16px",
                        paddingTop: "env(safe-area-inset-top, 0px)",
                        boxSizing: "border-box",
                    }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        height: 52,
                        gap: 10,
                    }}>
                        {/* 기기명 + 요금제 + 가격 요약 */}
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}>
                                <span style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#24292E",
                                    letterSpacing: -0.24,
                                    lineHeight: 1.3,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}>
                                    {devicePetName}
                                </span>
                                {plan && (
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 500,
                                        color: "#868E96",
                                        letterSpacing: -0.16,
                                        lineHeight: 1.3,
                                        whiteSpace: "nowrap",
                                        flexShrink: 0,
                                    }}>
                                        {plan}
                                    </span>
                                )}
                            </div>
                            <div style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 4,
                            }}>
                                <span style={{
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: "#24292E",
                                    letterSpacing: -0.3,
                                    lineHeight: 1.3,
                                    fontVariantNumeric: "tabular-nums",
                                }}>
                                    {finalPrice.toLocaleString()}원
                                </span>
                                {monthlyPayment > 0 && (
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 500,
                                        color: "#868E96",
                                        letterSpacing: -0.16,
                                        lineHeight: 1.3,
                                    }}>
                                        월 {monthlyPayment.toLocaleString()}원
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CTA 버튼 */}
                        <button
                            type="button"
                            onClick={isSoldOut ? onRestockClick : onApplyClick}
                            style={{
                                height: 38,
                                padding: "0 20px",
                                borderRadius: 10,
                                border: "none",
                                backgroundColor: isSoldOut ? "#3F4750" : "#0066FF",
                                color: "#FFFFFF",
                                fontSize: 14,
                                fontWeight: 700,
                                letterSpacing: -0.24,
                                lineHeight: 1,
                                cursor: "pointer",
                                fontFamily: FONT,
                                flexShrink: 0,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {isSoldOut ? restockLabel : ctaLabel}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

addPropertyControls(StickyTopCTA, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    devicePetName: { type: ControlType.String, title: "기기명", defaultValue: "iPhone 17 Pro" },
    finalPrice: { type: ControlType.Number, title: "최저가", defaultValue: 857400 },
    monthlyPayment: { type: ControlType.Number, title: "월 납부금", defaultValue: 38000 },
    plan: { type: ControlType.String, title: "요금제", defaultValue: "5G 스탠다드" },
    ctaLabel: { type: ControlType.String, title: "CTA 텍스트", defaultValue: "신청하기" },
    isSoldOut: { type: ControlType.Boolean, title: "품절", defaultValue: false },
    restockLabel: { type: ControlType.String, title: "품절 CTA", defaultValue: "입고 알림" },
    showThreshold: { type: ControlType.Number, title: "노출 스크롤 위치", defaultValue: 300, min: 100, max: 800, step: 50 },
})
