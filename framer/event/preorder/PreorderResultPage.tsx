// framer/event/preorder/PreorderResultPage.tsx
// 사전예약 알리미 신청 완료 결과 페이지 (리디렉션 페이지)
// PreorderForm 제출 완료 후 이동되는 별도 페이지 — 픽셀 트래킹 설치용
//
// URL 쿼리 파라미터 예시:
//   /preorder-result?model=iPhone%2018&name=홍길동&phone=010-1234-5678&carrier=KT
//
// 픽셀 트래킹은 Framer "Custom Code" → Body End 또는 이 컴포넌트에서 useEffect 안에 삽입

import * as React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// ─── 디자인 토큰 ──────────────────────────────────────────────────────
const FONT = '"Pretendard", "Inter", sans-serif'
const C = {
    primary: "#0066FF",
    text: "#191F28",
    textSub: "#8B95A1",
    border: "#E5E8EB",
    bg: "#FFFFFF",
    bgAlt: "#F2F4F6",
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 700
 */
export default function PreorderResultPage(props) {
    const {
        homePage = "/event",
        countdownSeconds = 5,
        title = "신청이 완료되었습니다",
        notice = "출시 확정 시 전화 또는 문자로 안내드립니다.",
        homeButtonLabel = "홈으로 바로가기",
        style,
    } = props

    const [model, setModel] = useState("")
    const [phone, setPhone] = useState("")
    const [countdown, setCountdown] = useState(countdownSeconds)

    // URL 쿼리 파라미터 파싱
    useEffect(() => {
        if (typeof window === "undefined") return
        const p = new URLSearchParams(window.location.search)
        setModel(p.get("model") || "")
        setPhone(p.get("phone") || "")
    }, [])

    // 카운트다운 후 홈 자동 이동
    useEffect(() => {
        if (countdown <= 0) {
            if (typeof window !== "undefined") window.location.href = homePage
            return
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown, homePage])

    return (
        <div style={{ ...styles.container, ...style }}>
            <div style={styles.resultWrap}>
                {/* 체크 원 애니메이션 */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    style={styles.resultCircle}
                >
                    <motion.svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                    >
                        <motion.path
                            d="M14 25L21 32L34 18"
                            stroke="#FFF"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                        />
                    </motion.svg>
                </motion.div>

                {/* 텍스트 */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.5 }}
                    style={styles.resultTextWrap}
                >
                    <h2 style={styles.resultTitle}>{title}</h2>
                    {(model || phone) && (
                        <p style={styles.resultDesc}>
                            {model && (
                                <>
                                    <strong>{model}</strong> 출시 알림을
                                    {"\n"}
                                </>
                            )}
                            {phone && (
                                <>
                                    <strong>{phone}</strong>으로 보내드릴게요.
                                </>
                            )}
                        </p>
                    )}
                </motion.div>

                {/* 안내 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={styles.resultNotice}
                >
                    <span>{notice}</span>
                </motion.div>

                {/* 카운트다운 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={styles.resultCountdown}
                >
                    <span>{countdown}초 후 홈으로 이동합니다</span>
                    <motion.div
                        style={styles.countdownBar}
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: countdownSeconds, ease: "linear" }}
                    />
                </motion.div>

                {/* 즉시 이동 버튼 */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    onClick={() => {
                        if (typeof window !== "undefined")
                            window.location.href = homePage
                    }}
                    style={styles.resultBtn}
                >
                    {homeButtonLabel}
                </motion.button>
            </div>
        </div>
    )
}

// ─── 스타일 ───────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    container: {
        width: "100%",
        maxWidth: 440,
        minWidth: 320,
        height: "100%",
        minHeight: 640,
        margin: "0 auto",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: FONT,
        position: "relative",
        WebkitFontSmoothing: "antialiased",
    },
    resultWrap: {
        flex: 1,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: 28,
        textAlign: "center" as const,
    },
    resultCircle: {
        width: 88,
        height: 88,
        borderRadius: "50%",
        backgroundColor: C.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 32px rgba(0,102,255,0.3)",
    },
    resultTextWrap: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 10,
    },
    resultTitle: {
        margin: 0,
        fontSize: 26,
        fontWeight: 800,
        color: C.text,
        letterSpacing: "-0.5px",
    },
    resultDesc: {
        margin: 0,
        fontSize: 16,
        color: C.textSub,
        lineHeight: 1.6,
        whiteSpace: "pre-line" as const,
    },
    resultNotice: {
        padding: "12px 20px",
        borderRadius: 12,
        backgroundColor: C.bgAlt,
        fontSize: 14,
        color: C.textSub,
        fontWeight: 500,
    },
    resultCountdown: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: C.textSub,
        width: "60%",
    },
    countdownBar: {
        width: "100%",
        height: 3,
        borderRadius: 2,
        backgroundColor: C.primary,
        transformOrigin: "left",
    },
    resultBtn: {
        padding: "14px 32px",
        borderRadius: 12,
        backgroundColor: C.text,
        color: "#FFF",
        fontSize: 16,
        fontWeight: 700,
        border: "none",
        cursor: "pointer",
        fontFamily: FONT,
        WebkitTapHighlightColor: "transparent",
    },
}

// ─── Framer 프롭 컨트롤 ───────────────────────────────────────────────
addPropertyControls(PreorderResultPage, {
    homePage: {
        type: ControlType.String,
        title: "홈 이동 경로",
        defaultValue: "/event",
    },
    countdownSeconds: {
        type: ControlType.Number,
        title: "카운트다운(초)",
        defaultValue: 5,
        min: 1,
        max: 30,
        step: 1,
    },
    title: {
        type: ControlType.String,
        title: "결과 타이틀",
        defaultValue: "신청이 완료되었습니다",
    },
    notice: {
        type: ControlType.String,
        title: "안내 문구",
        defaultValue: "출시 확정 시 전화 또는 문자로 안내드립니다.",
    },
    homeButtonLabel: {
        type: ControlType.String,
        title: "홈 버튼 라벨",
        defaultValue: "홈으로 바로가기",
    },
})
