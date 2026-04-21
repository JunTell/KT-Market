// Instagram/Facebook 등 인앱 브라우저 감지 시 외부 브라우저 안내 배너
// 인앱 브라우저에서는 쿠키/결제 SDK 호환 문제가 발생할 수 있음

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

function isInAppBrowser(): boolean {
    if (typeof navigator === "undefined") return false
    const ua = navigator.userAgent || navigator.vendor || ""
    return (
        /FBAN|FBAV/i.test(ua) ||       // Facebook
        /Instagram/i.test(ua) ||        // Instagram
        /NAVER/i.test(ua) ||            // Naver
        /KAKAOTALK/i.test(ua) ||        // KakaoTalk
        /DaumApps/i.test(ua) ||         // Daum
        /GSA/i.test(ua)                 // Google Search App
    )
}

function getExternalBrowserUrl(): string {
    if (typeof window === "undefined") return ""
    const url = window.location.href
    const ua = navigator.userAgent || ""

    // iOS: Safari로 열기
    if (/iPhone|iPad|iPod/i.test(ua)) {
        // intent scheme으로 Safari 열기 시도
        return url
    }
    // Android: Chrome intent
    if (/Android/i.test(ua)) {
        return `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`
    }
    return url
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function InAppBrowserBanner(props) {
    const {
        message = "원활한 주문을 위해 외부 브라우저에서 열어주세요",
        buttonLabel = "브라우저에서 열기",
        dismissible = true,
    } = props

    const [show, setShow] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        // 세션 내 한 번만 표시
        const key = "inapp_banner_dismissed"
        if (sessionStorage.getItem(key) === "1") return
        if (isInAppBrowser()) {
            setShow(true)
        }
    }, [])

    const handleDismiss = () => {
        setDismissed(true)
        if (typeof window !== "undefined") {
            sessionStorage.setItem("inapp_banner_dismissed", "1")
        }
    }

    const handleOpenExternal = () => {
        if (typeof window === "undefined") return
        const ua = navigator.userAgent || ""
        const url = window.location.href

        if (/Android/i.test(ua)) {
            // Android: Chrome intent
            window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`
        } else {
            // iOS: clipboard + 안내
            navigator.clipboard?.writeText(url).catch(() => {})
            window.open(url, "_blank")
        }
    }

    if (!show || dismissed) return null

    return (
        <AnimatePresence>
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
                    zIndex: 200,
                    backgroundColor: "#1F2937",
                    color: "#FFFFFF",
                    fontFamily: FONT,
                    padding: "0 16px",
                    paddingTop: "env(safe-area-inset-top, 0px)",
                    boxSizing: "border-box",
                }}
            >
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    height: 48,
                    gap: 10,
                }}>
                    {/* 아이콘 */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0 }} aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>

                    {/* 메시지 */}
                    <span style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: -0.2,
                        lineHeight: 1.4,
                    }}>
                        {message}
                    </span>

                    {/* 열기 버튼 */}
                    <button
                        type="button"
                        onClick={handleOpenExternal}
                        style={{
                            height: 30,
                            padding: "0 12px",
                            borderRadius: 6,
                            border: "1px solid rgba(255,255,255,0.3)",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "#FFFFFF",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: FONT,
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            letterSpacing: -0.16,
                        }}
                    >
                        {buttonLabel}
                    </button>

                    {/* 닫기 */}
                    {dismissible && (
                        <button
                            type="button"
                            onClick={handleDismiss}
                            aria-label="닫기"
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 4,
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#9CA3AF",
                                fontSize: 18,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                padding: 0,
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

addPropertyControls(InAppBrowserBanner, {
    message: { type: ControlType.String, title: "안내 문구", defaultValue: "원활한 주문을 위해 외부 브라우저에서 열어주세요" },
    buttonLabel: { type: ControlType.String, title: "버튼 텍스트", defaultValue: "브라우저에서 열기" },
    dismissible: { type: ControlType.Boolean, title: "닫기 가능", defaultValue: true },
})
