// 블로그 하단 고정 바텀 버튼 — 카카오톡 문의 · 최저가 휴대폰 보러가기
// absolute bottom: 20px, width 90%, border-radius 12px

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect } from "react"

const FONT = '"Pretendard", "Inter", sans-serif'

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 120
 */
export default function BottomButtons(props) {
    const {
        kakaoLabel = "카카오톡 문의",
        kakaoLink = "http://pf.kakao.com/_HfItxj/chat",
        phoneLabel = "최저가 휴대폰 보러가기",
        phoneLink = "https://ktmarket.co.kr/phone",
        bottomOffset = 20,
        widthPercent = 90,
        radius = 12,
        gap = 8,
    } = props

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const open = (url: string) => {
        if (typeof window !== "undefined" && url) {
            window.open(url, "_blank", "noopener,noreferrer")
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                left: "50%",
                bottom: bottomOffset,
                transform: "translateX(-50%)",
                width: `${widthPercent}%`,
                maxWidth: 440,
                display: "flex",
                flexDirection: "row",
                gap,
                zIndex: 120,
                fontFamily: FONT,
                boxSizing: "border-box",
            }}
        >
            {/* 카카오톡 문의 */}
            <button
                type="button"
                onClick={() => open(kakaoLink)}
                aria-label="카카오톡 문의"
                style={{
                    flex: 1,
                    minWidth: 0,
                    height: 52,
                    borderRadius: radius,
                    border: "none",
                    backgroundColor: "#FEE500",
                    color: "#181600",
                    cursor: "pointer",
                    fontFamily: FONT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#181600"
                    aria-hidden="true"
                >
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.86 5.33 4.66 6.78l-1.17 4.28c-.1.37.29.66.61.46l5.14-3.4c.25.02.5.03.76.03 5.52 0 10-3.58 10-8.15S17.52 3 12 3z" />
                </svg>
                {kakaoLabel}
            </button>

            {/* 최저가 휴대폰 보러가기 */}
            <button
                type="button"
                onClick={() => open(phoneLink)}
                aria-label="최저가 휴대폰 보러가기"
                style={{
                    flex: 1,
                    minWidth: 0,
                    height: 52,
                    borderRadius: radius,
                    border: "none",
                    backgroundColor: "#0066FF",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontFamily: FONT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    boxShadow: "0 2px 8px rgba(0, 102, 255, 0.25)",
                }}
            >
                {phoneLabel}
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M9 6l6 6-6 6" />
                </svg>
            </button>
        </div>
    )
}

addPropertyControls(BottomButtons, {
    kakaoLabel: {
        type: ControlType.String,
        title: "카카오 텍스트",
        defaultValue: "카카오톡 문의",
    },
    kakaoLink: {
        type: ControlType.String,
        title: "카카오 링크",
        defaultValue: "http://pf.kakao.com/_HfItxj/chat",
    },
    phoneLabel: {
        type: ControlType.String,
        title: "휴대폰 텍스트",
        defaultValue: "최저가 휴대폰 보러가기",
    },
    phoneLink: {
        type: ControlType.String,
        title: "휴대폰 링크",
        defaultValue: "https://ktmarket.co.kr/phone",
    },
    bottomOffset: {
        type: ControlType.Number,
        title: "하단 여백",
        defaultValue: 20,
        min: 0,
        max: 80,
        step: 1,
        unit: "px",
    },
    widthPercent: {
        type: ControlType.Number,
        title: "너비",
        defaultValue: 90,
        min: 50,
        max: 100,
        step: 1,
        unit: "%",
    },
    radius: {
        type: ControlType.Number,
        title: "라운드",
        defaultValue: 12,
        min: 0,
        max: 32,
        step: 1,
        unit: "px",
    },
    gap: {
        type: ControlType.Number,
        title: "버튼 간격",
        defaultValue: 8,
        min: 0,
        max: 24,
        step: 1,
        unit: "px",
    },
})
