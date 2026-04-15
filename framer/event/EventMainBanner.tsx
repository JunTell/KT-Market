// framer/event/EventMainBanner.tsx
// Figma: KT마켓 준텔레콤 node-id 2013:684
// Frame 857 (메인 배너) + Frame 838 (통계 바) = 단일 컴포넌트
//
// 이미지 에셋(확성기, 데코, 밑줄 등)은 Framer 캔버스에서 직접 배치합니다.
// 이 컴포넌트는 텍스트 · 버튼 · 통계 바 · 모션만 담당합니다.

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useInView } from "framer-motion"

// ─── 폰트 상수 ──────────────────────────────────────────────────────
const FONT = '"Pretendard", "Inter", sans-serif'
const FONT_CAFE24 = '"Cafe24 Ohsquare OTF", sans-serif'
const FONT_BAGEL = '"Bagel Fat One", sans-serif'
const FONT_REDDIT = '"Reddit Sans", sans-serif'

// ─── 아이콘 ─────────────────────────────────────────────────────────

const KTLogoWhite = () => (
    <svg width="23" height="19" viewBox="0 0 46 34" fill="none">
        <path d="M4 2H8V14L18 2H24L13 14.5L25 32H19L10 19L8 21V32H4V2Z" fill="white" />
        <path d="M26 2H42V7H36V32H32V7H26V2Z" fill="white" />
    </svg>
)

const CaretRight = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <path d="M7.5 5L12.5 10L7.5 15" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

// ─── 숫자 카운트업 훅 ─────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, start = false) {
    const [value, setValue] = useState(0)
    const rafRef = useRef<number>(0)

    useEffect(() => {
        if (!start) { setValue(0); return }
        const startTime = performance.now()
        const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(target * eased))
            if (progress < 1) rafRef.current = requestAnimationFrame(animate)
        }
        rafRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(rafRef.current)
    }, [target, duration, start])

    return value
}

function parseStatValue(val: string): { num: number; suffix: string } {
    const match = val.match(/^([\d,]+)(.*)$/)
    if (!match) return { num: 0, suffix: val }
    return { num: parseInt(match[1].replace(/,/g, ""), 10), suffix: match[2] }
}

function StatValue({ value, started }: { value: string; started: boolean }) {
    const { num, suffix } = parseStatValue(value)
    const animated = useCountUp(num, 1400, started)

    return (
        <span
            style={{
                color: "#D5FC4E",
                textAlign: "center",
                fontFamily: FONT_REDDIT,
                fontSize: 23,
                fontWeight: 800,
                lineHeight: "117%",
                letterSpacing: "0.46px",
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {animated.toLocaleString()}{suffix}
        </span>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function EventMainBanner(props) {
    const {
        // 헤더
        headerLabel = "KT공식대리점",
        ktLogoImage,

        // 메인 콘텐츠
        mainTitle = "KT마켓에서\n남들보다 먼저",
        subTitle = "사전예약 알리미",
        desc1 = "미출시 모델도 지금 바로 등록 가능",
        desc2 = "출시·지원금·혜택 정보를 남들보다 먼저 받아보세요",

        // 버튼
        btn1Text = "간편 사전예약하기",
        btn1Link = "",
        btn1OnClick,
        btn2Text = "출시 예정 모델 보러가기",
        btn2Link = "",
        btn2OnClick,

        // 통계 바
        showStatBar = true,
        stat1Value = "1,419",
        stat1Label1 = "현재 대기 중",
        stat1Label2 = "고객",
        stat2Value = "5",
        stat2Label1 = "접수 가능",
        stat2Label2 = "모델",
        stat3Value = "100%",
        stat3Label1 = "무료 · 취소",
        stat3Label2 = "가능",

        style,
    } = props

    const handleBtn1 = useCallback(() => {
        if (typeof btn1OnClick === "function") return btn1OnClick()
        if (btn1Link && typeof window !== "undefined") window.location.href = btn1Link
    }, [btn1OnClick, btn1Link])

    const handleBtn2 = useCallback(() => {
        if (typeof btn2OnClick === "function") return btn2OnClick()
        if (btn2Link && typeof window !== "undefined") window.location.href = btn2Link
    }, [btn2OnClick, btn2Link])

    const stats = [
        { value: stat1Value, line1: stat1Label1, line2: stat1Label2 },
        { value: stat2Value, line1: stat2Label1, line2: stat2Label2 },
        { value: stat3Value, line1: stat3Label1, line2: stat3Label2 },
    ]

    const statRef = useRef<HTMLDivElement>(null)
    const statInView = useInView(statRef, { once: true, margin: "-40px" })

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                fontFamily: FONT,
                boxSizing: "border-box",
                overflow: "hidden",
                ...style,
            }}
        >
            {/* ════════════════════════════════════════
                Frame 857 — 메인 배너
            ════════════════════════════════════════ */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 35,
                    padding: "26px 27px",
                    background: "linear-gradient(156.13deg, #1A7DFF 6.42%, #96BEFF 93.76%)",
                    boxSizing: "border-box",
                }}
            >
                {/* ══ 헤더 + 콘텐츠 그룹 (gap: 27px) ══ */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 27,
                        alignSelf: "stretch",
                    }}
                >
                    {/* ── 헤더: KT공식대리점 + 로고 ── */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            alignSelf: "stretch",
                        }}
                    >
                        <span
                            style={{
                                color: "#FFF",
                                fontFamily: FONT,
                                fontSize: 13.612,
                                fontWeight: 600,
                                letterSpacing: "-0.681px",
                                textShadow: "0 0 4.537px rgba(0,0,0,0.25)",
                            }}
                        >
                            {headerLabel}
                        </span>
                        {ktLogoImage ? (
                            <img
                                src={ktLogoImage}
                                alt="KT"
                                style={{ width: 23, height: 19, objectFit: "contain" }}
                            />
                        ) : (
                            <KTLogoWhite />
                        )}
                    </div>

                    {/* ── 타이틀 블록 + 설명 (gap: 28px) ── */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 28,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {/* ── 메인 타이틀 + 서브 타이틀 (gap: 1px) ── */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            {/* 대 타이틀 — Cafe24 Ohsquare OTF */}
                            <div
                                style={{
                                    color: "#FFF",
                                    textAlign: "center",
                                    fontFamily: FONT_CAFE24,
                                    fontSize: 40.122,
                                    fontWeight: 400,
                                    lineHeight: "117%",
                                    letterSpacing: "0.802px",
                                    textShadow: "0 4.585px 7.314px rgba(0,0,0,0.58)",
                                    whiteSpace: "pre-line",
                                }}
                            >
                                {mainTitle}
                            </div>

                            {/* 서브 타이틀 — Bagel Fat One, 그라디언트 */}
                            <div
                                style={{
                                    fontFamily: FONT_BAGEL,
                                    fontSize: 45,
                                    fontWeight: 400,
                                    lineHeight: "117%",
                                    letterSpacing: "0.9px",
                                    textShadow: "0 4px 6.381px rgba(0,0,0,0.58)",
                                    background: "linear-gradient(180deg, #FEE900 0%, #8BFF61 79.25%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    textAlign: "center",
                                }}
                            >
                                {subTitle}
                            </div>
                        </div>

                        {/* 설명 텍스트 */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "#FFF",
                                fontFamily: FONT,
                                textAlign: "center",
                                letterSpacing: "0.23px",
                            }}
                        >
                            <span style={{ fontSize: 13.901, fontWeight: 900, lineHeight: "145.5%" }}>
                                {desc1}
                            </span>
                            <span style={{ fontSize: 11.575, fontWeight: 600, lineHeight: "145.5%" }}>
                                {desc2}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ══ 버튼 그룹 (gap: 16px) ══ */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        alignSelf: "stretch",
                    }}
                >
                    <button onClick={handleBtn1} style={btn1Style}>
                        {btn1Text} <CaretRight size={20} color="#2C2C2C" />
                    </button>
                    <button onClick={handleBtn2} style={btn2Style}>
                        {btn2Text} <CaretRight size={17} color="#FFF" />
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════
                Frame 838 — 통계 바
            ════════════════════════════════════════ */}
            {showStatBar && (
                <div
                    ref={statRef}
                    style={{
                        display: "flex",
                        padding: "10px 30px",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 12,
                        background: "#0066FF",
                        boxSizing: "border-box",
                        width: "100%",
                        overflow: "clip",
                    }}
                >
                    {stats.map((stat, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && (
                                <div
                                    style={{
                                        width: 1.5,
                                        height: 77,
                                        backgroundColor: "rgba(255,255,255,0.3)",
                                        flexShrink: 0,
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    width: 92,
                                    flexShrink: 0,
                                    borderRadius: 11,
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <StatValue value={stat.value} started={statInView} />
                                <div
                                    style={{
                                        color: "#FFF",
                                        textAlign: "center",
                                        fontFamily: FONT,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        lineHeight: "117%",
                                        letterSpacing: "0.28px",
                                    }}
                                >
                                    <div>{stat.line1}</div>
                                    <div>{stat.line2}</div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── 버튼 스타일 ────────────────────────────────────────────────────
const btn1Style: React.CSSProperties = {
    display: "flex",
    width: "100%",
    padding: "9px 15px",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    background: "#FFF",
    boxShadow: "0 4px 5px 0 rgba(0,0,0,0.15)",
    border: "none",
    cursor: "pointer",
    color: "#2C2C2C",
    fontFamily: FONT,
    fontSize: 21.739,
    fontWeight: 700,
    lineHeight: "117%",
    letterSpacing: "0.435px",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
}

const btn2Style: React.CSSProperties = {
    display: "flex",
    width: "100%",
    padding: "10px 18px",
    justifyContent: "center",
    alignItems: "center",
    gap: 7.17,
    borderRadius: 8.962,
    background: "#0066FF",
    boxShadow: "0 3.585px 4.481px 0 rgba(0,0,0,0.15)",
    border: "none",
    cursor: "pointer",
    color: "#FFF",
    fontFamily: FONT,
    fontSize: 18.928,
    fontWeight: 700,
    lineHeight: "117%",
    letterSpacing: "0.379px",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
}

// ─── Framer 프롭 컨트롤 ───────────────────────────────────────────────
addPropertyControls(EventMainBanner, {
    // 헤더
    headerLabel: {
        type: ControlType.String,
        title: "헤더 텍스트",
        defaultValue: "KT공식대리점",
    },
    ktLogoImage: {
        type: ControlType.Image,
        title: "KT 로고 (PNG/SVG)",
    },

    // 메인 콘텐츠
    mainTitle: {
        type: ControlType.String,
        title: "메인 타이틀",
        displayTextArea: true,
        defaultValue: "KT마켓에서\n남들보다 먼저",
    },
    subTitle: {
        type: ControlType.String,
        title: "서브 타이틀 (그라디언트)",
        defaultValue: "사전예약 알리미",
    },
    desc1: {
        type: ControlType.String,
        title: "설명 1 (굵게)",
        defaultValue: "미출시 모델도 지금 바로 등록 가능",
    },
    desc2: {
        type: ControlType.String,
        title: "설명 2",
        defaultValue: "출시·지원금·혜택 정보를 남들보다 먼저 받아보세요",
    },

    // 버튼
    btn1Text: {
        type: ControlType.String,
        title: "버튼1 텍스트",
        defaultValue: "간편 사전예약하기",
    },
    btn1Link: {
        type: ControlType.String,
        title: "버튼1 링크",
        defaultValue: "",
    },
    btn2Text: {
        type: ControlType.String,
        title: "버튼2 텍스트",
        defaultValue: "출시 예정 모델 보러가기",
    },
    btn2Link: {
        type: ControlType.String,
        title: "버튼2 링크",
        defaultValue: "",
    },

    // 통계 바
    showStatBar: {
        type: ControlType.Boolean,
        title: "통계 바 표시",
        defaultValue: true,
    },
    stat1Value: {
        type: ControlType.String,
        title: "통계1 숫자",
        defaultValue: "1,419",
        hidden: (p) => !p.showStatBar,
    },
    stat1Label1: {
        type: ControlType.String,
        title: "통계1 레이블 1줄",
        defaultValue: "현재 대기 중",
        hidden: (p) => !p.showStatBar,
    },
    stat1Label2: {
        type: ControlType.String,
        title: "통계1 레이블 2줄",
        defaultValue: "고객",
        hidden: (p) => !p.showStatBar,
    },
    stat2Value: {
        type: ControlType.String,
        title: "통계2 숫자",
        defaultValue: "5",
        hidden: (p) => !p.showStatBar,
    },
    stat2Label1: {
        type: ControlType.String,
        title: "통계2 레이블 1줄",
        defaultValue: "접수 가능",
        hidden: (p) => !p.showStatBar,
    },
    stat2Label2: {
        type: ControlType.String,
        title: "통계2 레이블 2줄",
        defaultValue: "모델",
        hidden: (p) => !p.showStatBar,
    },
    stat3Value: {
        type: ControlType.String,
        title: "통계3 숫자",
        defaultValue: "100%",
        hidden: (p) => !p.showStatBar,
    },
    stat3Label1: {
        type: ControlType.String,
        title: "통계3 레이블 1줄",
        defaultValue: "무료 · 취소",
        hidden: (p) => !p.showStatBar,
    },
    stat3Label2: {
        type: ControlType.String,
        title: "통계3 레이블 2줄",
        defaultValue: "가능",
        hidden: (p) => !p.showStatBar,
    },
})
