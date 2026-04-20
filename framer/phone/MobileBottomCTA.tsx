// 모바일 고정 하단 CTA 바 — 주문하기 · 문의하기 · 담기
// 모바일 89.5% + iPhone 상세 이탈 직접 대응
// OrderFlowBottomSheet와 함께 또는 대체로 사용

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 66
 */
export default function MobileBottomCTA(props) {
    const {
        // 메인 CTA
        ctaLabel = "신청하기",
        onApplyClick,
        // 상담
        consultLabel = "문의",
        onConsultClick,
        kakaoTalkLink = "http://pf.kakao.com/_HfItxj/chat",
        // 찜하기
        wishLabel = "찜",
        onWishClick,
        isWished = false,
        // 상태
        isSoldOut = false,
        restockLabel = "입고 알림",
        onRestockClick,
        isLoading = false,
        // 가격 표시
        monthlyPayment = 0,
    } = props

    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    if (!mounted) return <div style={{ width: "100%", minHeight: 66 }} />

    const handleConsult = () => {
        if (typeof onConsultClick === "function") {
            onConsultClick()
        } else if (typeof window !== "undefined") {
            window.open(kakaoTalkLink, "_blank", "noopener,noreferrer")
        }
    }

    const handleWish = () => {
        if (typeof onWishClick === "function") {
            onWishClick()
        }
    }

    const handleApply = () => {
        if (isSoldOut && typeof onRestockClick === "function") {
            onRestockClick()
        } else if (typeof onApplyClick === "function") {
            onApplyClick()
        }
    }

    return (
        <div style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            margin: "0 auto",
            maxWidth: 440,
            width: "100%",
            zIndex: 120,
            backgroundColor: "#FFFFFF",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -2px 12px rgba(0,0,0,0.10)",
            fontFamily: FONT,
            boxSizing: "border-box",
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                paddingBottom: "calc(10px + env(safe-area-inset-bottom, 10px))",
                gap: 8,
            }}>
                {/* 찜 버튼 */}
                <button
                    type="button"
                    onClick={handleWish}
                    aria-label={isWished ? "찜 해제" : "찜하기"}
                    aria-pressed={isWished}
                    style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        border: "1.5px solid #E5E7EB",
                        backgroundColor: "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        flexShrink: 0,
                        padding: 0,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24"
                        fill={isWished ? "#EF4444" : "none"}
                        stroke={isWished ? "#EF4444" : "#868E96"}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span style={{ fontSize: 9, fontWeight: 500, color: "#868E96", lineHeight: 1 }}>{wishLabel}</span>
                </button>

                {/* 문의 버튼 */}
                <button
                    type="button"
                    onClick={handleConsult}
                    aria-label="카카오톡 문의"
                    style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        border: "1.5px solid #E5E7EB",
                        backgroundColor: "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        flexShrink: 0,
                        padding: 0,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="#868E96"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span style={{ fontSize: 9, fontWeight: 500, color: "#868E96", lineHeight: 1 }}>{consultLabel}</span>
                </button>

                {/* 메인 CTA */}
                <button
                    type="button"
                    onClick={handleApply}
                    style={{
                        flex: 1,
                        height: 46,
                        borderRadius: 12,
                        border: "none",
                        backgroundColor: isSoldOut ? "#3F4750" : "#0066FF",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        fontFamily: FONT,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                    }}
                >
                    <span style={{
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: -0.3,
                        lineHeight: 1.2,
                    }}>
                        {isSoldOut ? restockLabel : ctaLabel}
                    </span>
                    {!isSoldOut && monthlyPayment > 0 && (
                        <span style={{
                            fontSize: 11,
                            fontWeight: 400,
                            opacity: 0.8,
                            letterSpacing: -0.16,
                            lineHeight: 1.2,
                        }}>
                            월 {monthlyPayment.toLocaleString()}원
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}

addPropertyControls(MobileBottomCTA, {
    ctaLabel: { type: ControlType.String, title: "CTA 텍스트", defaultValue: "신청하기" },
    consultLabel: { type: ControlType.String, title: "문의 텍스트", defaultValue: "문의" },
    wishLabel: { type: ControlType.String, title: "찜 텍스트", defaultValue: "찜" },
    isSoldOut: { type: ControlType.Boolean, title: "품절", defaultValue: false },
    restockLabel: { type: ControlType.String, title: "품절 CTA", defaultValue: "입고 알림" },
    isWished: { type: ControlType.Boolean, title: "찜 상태", defaultValue: false },
    monthlyPayment: { type: ControlType.Number, title: "월 납부금", defaultValue: 0 },
    kakaoTalkLink: { type: ControlType.String, title: "카카오 링크", defaultValue: "http://pf.kakao.com/_HfItxj/chat" },
})
