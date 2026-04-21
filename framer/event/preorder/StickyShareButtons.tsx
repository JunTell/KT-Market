// 이벤트 페이지 우측 하단 Sticky 버튼
// 공유(드롭다운): 카카오톡 공유 + 링크 복사
// 카카오톡(TALK): 카카오톡 피드카드 공유

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'
const KAKAO_APP_KEY = "5adba4c18304c4874a0b50b94affe411"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function StickyShareButtons(props) {
    const {
        shareTitle = "KT마켓 — 사전예약 알리미",
        shareDescription = "미출시 모델도 지금 바로 등록 가능! 출시·지원금·혜택 정보를 남들보다 먼저 받아보세요",
        shareImageUrl = "https://ktmarket.co.kr/og-image.png",
        kakaoIcon,
        shareIcon,
        bottomOffset = 24,
        rightOffset = 16,
    } = props

    const [copied, setCopied] = useState(false)

    // ── 카카오 SDK 로드 ──
    useEffect(() => {
        if (typeof window === "undefined") return
        const init = (K: any) => {
            if (K && !K.isInitialized()) K.init(KAKAO_APP_KEY)
        }
        const K = (window as any).Kakao
        if (K) {
            init(K)
        } else {
            const existing = document.querySelector('script[src*="kakao_js_sdk"]')
            if (existing) return
            const script = document.createElement("script")
            script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
            script.async = true
            script.onload = () => init((window as any).Kakao)
            document.head.appendChild(script)
        }
    }, [])

    // ── 프로덕션 URL ──
    const getShareUrl = (): string => {
        if (typeof window === "undefined") return "https://ktmarket.co.kr"
        const isProduction = window.location.hostname === "ktmarket.co.kr"
        return isProduction
            ? window.location.href
            : "https://ktmarket.co.kr" + window.location.pathname
    }

    // ── 카카오톡 공유 (TALK 버튼 + 드롭다운 메뉴) ──
    const handleKakaoShare = () => {
        if (typeof window === "undefined") return
        const K = (window as any).Kakao
        if (!K || !K.isInitialized()) {
            handleCopyLink()
            return
        }
        const targetUrl = getShareUrl()
        K.Share.sendDefault({
            objectType: "feed",
            content: {
                title: shareTitle,
                description: shareDescription,
                imageUrl: shareImageUrl,
                imageWidth: 800,
                imageHeight: 400,
                link: { mobileWebUrl: targetUrl, webUrl: targetUrl },
            },
            buttons: [
                { title: "자세히 보기", link: { mobileWebUrl: targetUrl, webUrl: targetUrl } },
            ],
        })
    }

    // ── 링크 복사 ──
    const handleCopyLink = async () => {
        if (typeof window === "undefined") return
        const url = getShareUrl()
        try {
            await navigator.clipboard.writeText(url)
        } catch {
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
            position: "fixed",
            bottom: bottomOffset,
            right: rightOffset,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
        }}>
            {/* 카카오톡 공유 FAB (TALK) */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleKakaoShare}
                style={fabStyle}
                aria-label="카카오톡 공유"
            >
                {kakaoIcon ? (
                    <img src={kakaoIcon} width={28} height={28} style={{ objectFit: "contain" }} />
                ) : (
                    <KakaoTalkIcon />
                )}
            </motion.button>

            {/* 링크 복사 FAB */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyLink}
                style={{ ...fabStyle, backgroundColor: "#3B82F6" }}
                aria-label="링크 복사"
            >
                {shareIcon ? (
                    <img src={shareIcon} width={24} height={24} style={{ objectFit: "contain" }} />
                ) : (
                    <ShareIcon />
                )}
            </motion.button>

            {/* 복사 완료 토스트 */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        style={{
                            position: "absolute",
                            bottom: -36,
                            right: 0,
                            padding: "6px 12px",
                            borderRadius: 8,
                            backgroundColor: "#24292E",
                            color: "#FFF",
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: FONT,
                            whiteSpace: "nowrap",
                        }}
                    >
                        링크 복사됨!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── 스타일 ──────────────────────────────────────────────
const fabStyle: React.CSSProperties = {
    width: 52,
    height: 52,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#FEE500",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitTapHighlightColor: "transparent",
}

// ─── 아이콘 ──────────────────────────────────────────────
function KakaoTalkIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4C8.477 4 4 7.582 4 12c0 2.87 1.89 5.39 4.726 6.836-.153.56-.987 3.608-1.02 3.847 0 0-.02.173.092.238.112.066.243.015.243.015.32-.045 3.716-2.43 4.302-2.842.533.077 1.085.118 1.657.118 5.523 0 10-3.582 10-8s-4.477-8-10-8z" fill="#3C1E1E"/>
        </svg>
    )
}

function ShareIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    )
}

// ─── Property Controls ──────────────────────────────────
addPropertyControls(StickyShareButtons, {
    shareTitle: {
        type: ControlType.String,
        title: "공유 제목",
        defaultValue: "KT마켓 — 사전예약 알리미",
    },
    shareDescription: {
        type: ControlType.String,
        title: "공유 설명",
        defaultValue: "미출시 모델도 지금 바로 등록 가능! 출시·지원금·혜택 정보를 남들보다 먼저 받아보세요",
    },
    shareImageUrl: {
        type: ControlType.String,
        title: "공유 이미지 URL",
        defaultValue: "https://ktmarket.co.kr/og-image.png",
    },
    kakaoIcon: {
        type: ControlType.Image,
        title: "카카오 아이콘 (커스텀)",
    },
    shareIcon: {
        type: ControlType.Image,
        title: "공유 아이콘 (커스텀)",
    },
    bottomOffset: {
        type: ControlType.Number,
        title: "하단 여백",
        defaultValue: 24,
        min: 0, max: 100, step: 1,
    },
    rightOffset: {
        type: ControlType.Number,
        title: "우측 여백",
        defaultValue: 16,
        min: 0, max: 60, step: 1,
    },
})
