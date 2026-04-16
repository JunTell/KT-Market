// 지인 공유 카드 컴포넌트
// Figma: node 2098:934
// 카카오톡 공유 + 링크 복사 기능 포함

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect } from "react"

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 110
 */
export default function ShareCard(props) {
    const {
        title = "주변에 폰 바꾸는 지인이 있다면 알려주세요",
        description = "여기서 사면 싸다고 나만 아는 정보를 공유할 수 있어요",
        kakaoAppKey = "",
        kakaoIcon,
        shareTitle = "KT마켓 — 폰 최저가로 바꾸는 곳",
        shareDescription = "여기서 사면 싸다고 나만 아는 정보를 공유할 수 있어요",
        shareImageUrl = "https://ktmarket.co.kr/og-image.png",
        shareUrl = "",
    } = props

    const [copied, setCopied] = useState(false)
    const [kakaoReady, setKakaoReady] = useState(false)

    // ── 카카오 SDK 로드 ─────────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined") return
        const K = (window as any).Kakao

        const init = (sdk: any) => {
            if (sdk && !sdk.isInitialized() && kakaoAppKey) {
                sdk.init(kakaoAppKey)
            }
            setKakaoReady(true)
        }

        if (K) {
            init(K)
        } else {
            const existing = document.querySelector(
                'script[src*="kakao_js_sdk"]'
            )
            if (existing) {
                existing.addEventListener("load", () =>
                    init((window as any).Kakao)
                )
                return
            }
            const script = document.createElement("script")
            script.src =
                "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
            script.async = true
            script.onload = () => init((window as any).Kakao)
            document.head.appendChild(script)
        }
    }, [kakaoAppKey])

    // ── 프로덕션 URL 변환 (ktmarket.co.kr 외 모든 환경에서 경로 보존) ──
    // Kakao 스크랩 캐시 우회용 cache-buster 파라미터 부착
    const toProductionUrl = (url?: string): string => {
        const withBuster = (u: string) => {
            const sep = u.includes("?") ? "&" : "?"
            return `${u}${sep}_kt=${Date.now()}`
        }
        if (url) return withBuster(url)
        const BASE = "https://ktmarket.co.kr"
        const isProduction = window.location.hostname === "ktmarket.co.kr"
        const base = isProduction
            ? window.location.origin + window.location.pathname + window.location.search
            : BASE + window.location.pathname + window.location.search
        return withBuster(base)
    }

    // ── 카카오톡 공유 ────────────────────────────────────────
    const handleKakaoShare = () => {
        if (typeof window === "undefined") return
        const K = (window as any).Kakao
        if (!K || !K.isInitialized()) {
            alert("카카오 SDK가 아직 로드되지 않았어요. 잠시 후 다시 시도해주세요.")
            return
        }

        const targetUrl = toProductionUrl(shareUrl || undefined)

        // ── [DEBUG v3] 카톡 전달 직전 실제 URL 강제 노출 ──
        const confirmed = window.confirm(
            "[v3-cache-buster] 이 URL로 카톡에 전달합니다:\n\n" +
                targetUrl +
                "\n\n" +
                "※ URL이 https://ktmarket.co.kr/... 면 OK 누르세요.\n" +
                "※ localhost면 취소 누르세요."
        )
        if (!confirmed) return

        K.Share.sendDefault({
            objectType: "feed",
            content: {
                title: shareTitle,
                description: shareDescription,
                imageUrl: shareImageUrl,
                imageWidth: 800,
                imageHeight: 400,
                link: {
                    mobileWebUrl: targetUrl,
                    webUrl: targetUrl,
                },
            },
            buttons: [
                {
                    title: "자세히 보기",
                    link: {
                        mobileWebUrl: targetUrl,
                        webUrl: targetUrl,
                    },
                },
            ],
        })
    }

    // ── 링크 복사 ────────────────────────────────────────────
    const handleCopyLink = async () => {
        if (typeof window === "undefined") return
        const url = toProductionUrl(shareUrl || undefined)

        try {
            await navigator.clipboard.writeText(url)
        } catch {
            // clipboard API 미지원 환경 fallback
            const ta = document.createElement("textarea")
            ta.value = url
            ta.style.position = "fixed"
            ta.style.opacity = "0"
            document.body.appendChild(ta)
            ta.focus()
            ta.select()
            document.execCommand("copy")
            document.body.removeChild(ta)
        }

        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{
            width: "100%",
            backgroundColor: "#E9F1FF",
            borderRadius: 14,
            padding: "14px 13px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontFamily: FONT,
            position: "relative",
        }}>
            {/* 텍스트 영역 */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
            }}>
                <p style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0066FF",
                    letterSpacing: -0.24,
                    lineHeight: 1.5,
                    wordBreak: "keep-all",
                    fontFamily: FONT,
                }}>
                    {title}
                </p>
                <p style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#24292E",
                    letterSpacing: -0.24,
                    lineHeight: 1.5,
                    wordBreak: "keep-all",
                    fontFamily: FONT,
                }}>
                    {description}
                </p>
            </div>

            {/* 버튼 영역 */}
            <div style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
            }}>
                {/* 카카오톡 공유 버튼 */}
                <button
                    onClick={handleKakaoShare}
                    style={{
                        flex: 1,
                        height: 36,
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #D7D7D7",
                        borderRadius: 10,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "0 12px",
                        fontFamily: FONT,
                        transition: "background-color 0.15s",
                    }}
                    onMouseEnter={e =>
                        ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F9FAFB")
                    }
                    onMouseLeave={e =>
                        ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFFFFF")
                    }
                >
                    {/* 카카오 아이콘 */}
                    {kakaoIcon && (
                        <img src={kakaoIcon} width={18} height={18} style={{ objectFit: "contain", flexShrink: 0 }} />
                    )}
                    <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#160300",
                        letterSpacing: 0.05,
                        lineHeight: 1.5,
                        fontFamily: FONT,
                        whiteSpace: "nowrap",
                    }}>
                        카카오톡 공유
                    </span>
                </button>

                {/* 링크 복사 버튼 */}
                <button
                    onClick={handleCopyLink}
                    style={{
                        flex: 1,
                        height: 36,
                        backgroundColor: copied ? "#E9F1FF" : "#FFFFFF",
                        border: `1px solid ${copied ? "#0066FF" : "#D7D7D7"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "0 12px",
                        fontFamily: FONT,
                        transition: "all 0.15s",
                    }}
                >
                    {/* 링크/복사 아이콘 */}
                    {copied ? (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l3.5 3.5 6.5-7" stroke="#0066FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L7.5 3.5" stroke="#3F4750" strokeWidth="1.4" strokeLinecap="round" />
                            <path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5L8.5 12.5" stroke="#3F4750" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    )}
                    <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: copied ? "#0066FF" : "#160300",
                        letterSpacing: 0.05,
                        lineHeight: 1.5,
                        fontFamily: FONT,
                        whiteSpace: "nowrap",
                        transition: "color 0.15s",
                    }}>
                        {copied ? "복사됐어요!" : "링크 복사"}
                    </span>
                </button>
            </div>
        </div>
    )
}

addPropertyControls(ShareCard, {
    title: {
        type: ControlType.String,
        title: "타이틀",
        defaultValue: "주변에 폰 바꾸는 지인이 있다면 알려주세요",
        displayTextArea: true,
    },
    description: {
        type: ControlType.String,
        title: "설명",
        defaultValue: "나만 알기 아까운 정보, 주변 지인들과 함께 공유해요",
        displayTextArea: true,
    },
    kakaoAppKey: {
        type: ControlType.String,
        title: "카카오 앱키",
        defaultValue: "",
        placeholder: "JavaScript 앱 키 입력",
    },
    kakaoIcon: {
        type: ControlType.Image,
        title: "카카오 아이콘",
    },
    shareTitle: {
        type: ControlType.String,
        title: "공유 제목",
        defaultValue: "KT마켓 — 폰 최저가로 바꾸는 곳",
    },
    shareDescription: {
        type: ControlType.String,
        title: "공유 설명",
        defaultValue: "여기서 사면 싸다고 나만 아는 정보를 공유할 수 있어요",
    },
    shareImageUrl: {
        type: ControlType.String,
        title: "공유 이미지 URL",
        defaultValue: "https://ktmarket.co.kr/og-image.png",
    },
    shareUrl: {
        type: ControlType.String,
        title: "공유 URL",
        defaultValue: "",
        placeholder: "비워두면 현재 페이지 URL 사용",
    },
})
