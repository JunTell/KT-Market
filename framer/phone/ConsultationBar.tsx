// 카카오톡 / 전화 상담 버튼 바
// Figma: node 2098:984 — 두 버튼 나란히 배치
// OrderFlowBottomSheet에서 분리된 상담 전용 컴포넌트

import { addPropertyControls, ControlType } from "framer"
import React, { useEffect } from "react"

const KAKAO_APP_KEY = "5adba4c18304c4874a0b50b94affe411"

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 56
 */
export default function ConsultationBar(props) {
    const {
        kakaoTalkLink = "http://pf.kakao.com/_HfItxj/chat",
        kakaoLabel = "요금제 고민되면",
        kakaoMain = "카카오톡 상담",
        phoneLabel = "바로 물어보고 싶으면",
        phoneMain = "전화 상담",
        shareTitle = "KT마켓 — 조건 없는 최저가 스마트폰",
        shareDescription = "공시지원금 최대 적용, 비싼 요금제·카드 발급 조건 없어요",
        shareImageUrl = "https://ktmarket.co.kr/og-image.png",
        useKakaoShare = false,
        onKakaoClick,
        onPhoneClick,
        onSaveOrderSession,
    } = props

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
            script.onload = () => init((window as any).Kakao)
            document.head.appendChild(script)
        }
    }, [])

    const handleKakao = () => {
        if (typeof onKakaoClick === "function") {
            onKakaoClick()
            return
        }
        if (useKakaoShare && typeof window !== "undefined") {
            const K = (window as any).Kakao
            if (K && K.isInitialized()) {
                K.Share.sendDefault({
                    objectType: "feed",
                    content: {
                        title: shareTitle,
                        description: shareDescription,
                        imageUrl: shareImageUrl,
                        link: {
                            mobileWebUrl: window.location.href,
                            webUrl: window.location.href,
                        },
                    },
                })
                return
            }
        }
        if (typeof window !== "undefined") {
            window.open(kakaoTalkLink, "_blank", "noopener,noreferrer")
        }
    }

    const handlePhone = () => {
        if (typeof onPhoneClick === "function") {
            onPhoneClick()
        } else if (typeof window !== "undefined") {
            onSaveOrderSession?.()
            window.location.href = "/phone/confirm"
        }
    }

    return (
        <div style={{
            display: "flex",
            gap: 10,
            alignItems: "stretch",
            width: "100%",
            fontFamily: FONT,
        }}>
            {/* 카카오톡 상담 버튼 */}
            <button
                onClick={handleKakao}
                style={{
                    flex: 1,
                    height: 56,
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: "#FEE500",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    padding: "7px 12px",
                    fontFamily: FONT,
                }}
            >
                <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#000000",
                    letterSpacing: 0.08,
                    lineHeight: 1.5,
                    fontFamily: FONT,
                    whiteSpace: "nowrap",
                }}>
                    {kakaoLabel}
                </span>
                <span style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#160300",
                    letterSpacing: 0.08,
                    lineHeight: 1.5,
                    fontFamily: FONT,
                    whiteSpace: "nowrap",
                }}>
                    {kakaoMain}
                </span>
            </button>

            {/* 전화 상담 버튼 */}
            <button
                onClick={handlePhone}
                style={{
                    flex: 1,
                    height: 56,
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: "#EDEDED",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    padding: "8px 12px",
                    fontFamily: FONT,
                }}
            >
                <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#24292E",
                    letterSpacing: 0.08,
                    lineHeight: 1.5,
                    fontFamily: FONT,
                    whiteSpace: "nowrap",
                }}>
                    {phoneLabel}
                </span>
                <span style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0066FF",
                    letterSpacing: 0.08,
                    lineHeight: 1.5,
                    fontFamily: FONT,
                    whiteSpace: "nowrap",
                }}>
                    {phoneMain}
                </span>
            </button>
        </div>
    )
}

addPropertyControls(ConsultationBar, {
    kakaoTalkLink: {
        type: ControlType.String,
        title: "카카오 링크",
        defaultValue: "http://pf.kakao.com/_HfItxj/chat",
    },
    kakaoLabel: {
        type: ControlType.String,
        title: "카카오 서브텍스트",
        defaultValue: "요금제 고민되면",
    },
    kakaoMain: {
        type: ControlType.String,
        title: "카카오 메인텍스트",
        defaultValue: "카카오톡 상담",
    },
    phoneLabel: {
        type: ControlType.String,
        title: "전화 서브텍스트",
        defaultValue: "바로 물어보고 싶으면",
    },
    phoneMain: {
        type: ControlType.String,
        title: "전화 메인텍스트",
        defaultValue: "전화 상담",
    },

    useKakaoShare: {
        type: ControlType.Boolean,
        title: "카카오 공유 모드",
        defaultValue: false,
        description: "ON: 카카오톡 공유 / OFF: 채널 채팅 열기",
    },
    shareTitle: {
        type: ControlType.String,
        title: "공유 제목",
        defaultValue: "KT마켓 — 조건 없는 최저가 스마트폰",
        hidden: (props) => !props.useKakaoShare,
    },
    shareDescription: {
        type: ControlType.String,
        title: "공유 설명",
        defaultValue: "공시지원금 최대 적용, 비싼 요금제·카드 발급 조건 없어요",
        hidden: (props) => !props.useKakaoShare,
    },
    shareImageUrl: {
        type: ControlType.String,
        title: "공유 이미지 URL",
        defaultValue: "https://ktmarket.co.kr/og-image.png",
        hidden: (props) => !props.useKakaoShare,
    },
})
