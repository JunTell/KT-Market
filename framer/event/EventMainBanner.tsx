// framer/event/EventMainBanner.tsx
// 배너 이미지 + 인터랙티브 오버레이(확성기 모션, 버튼) + 통계 바(카운트업)
//
// 정적 디자인(그라디언트, 텍스트, 데코 등)은 bannerImage 한 장으로 처리.
// 코드는 인터랙션이 필요한 요소만 담당합니다.

import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useInView } from "framer-motion"

// ─── 폰트 ───────────────────────────────────────────────────────────
const FONT = '"Pretendard", "Inter", sans-serif'
const FONT_REDDIT = '"Reddit Sans", sans-serif'

// ─── 아이콘 ─────────────────────────────────────────────────────────
const CaretRight = ({
    size = 20,
    color = "currentColor",
}: {
    size?: number
    color?: string
}) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <path
            d="M7.5 5L12.5 10L7.5 15"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

// ─── 숫자 카운트업 훅 ─────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, start = false) {
    const [value, setValue] = useState(0)
    const rafRef = useRef<number>(0)

    useEffect(() => {
        if (!start) {
            setValue(0)
            return
        }
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
            {animated.toLocaleString()}
            {suffix}
        </span>
    )
}

// ─── 컨테이너 너비 훅 ─────────────────────────────────────────────────
function useContainerWidth(ref: React.RefObject<HTMLElement | null>) {
    const [width, setWidth] = useState(360)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const ro = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return width
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function EventMainBanner(props) {
    const {
        // 배너 이미지 (정적 디자인 전체)
        bannerImage,

        // 확성기 (모션 오버레이)
        megaphoneImage,
        megaphoneTop = 28,
        megaphoneRight = 4,
        megaphoneSize = 60,

        // 버튼
        btn1Text = "간편 사전예약하기",
        btn1Link = "",
        btn1OnClick,
        btn2Text = "출시 예정 모델 보러가기",
        btn2Link = "",
        btn2OnClick,
        btnBottomOffset = 26,
        btnSideOffset = 27,

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
        if (btn1Link && typeof window !== "undefined")
            window.location.href = btn1Link
    }, [btn1OnClick, btn1Link])

    const handleBtn2 = useCallback(() => {
        if (typeof btn2OnClick === "function") return btn2OnClick()
        if (btn2Link && typeof window !== "undefined")
            window.location.href = btn2Link
    }, [btn2OnClick, btn2Link])

    const stats = [
        { value: stat1Value, line1: stat1Label1, line2: stat1Label2 },
        { value: stat2Value, line1: stat2Label1, line2: stat2Label2 },
        { value: stat3Value, line1: stat3Label1, line2: stat3Label2 },
    ]

    const containerRef = useRef<HTMLDivElement>(null)
    const w = useContainerWidth(containerRef)
    // 0 at 360px, 1 at 440px
    const t = Math.min(Math.max((w - 360) / 80, 0), 1)

    const statRef = useRef<HTMLDivElement>(null)
    const statInView = useInView(statRef, { once: true, margin: "-40px" })

    return (
        <div
            ref={containerRef}
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
                배너 영역 — 이미지 + 인터랙티브 오버레이
            ════════════════════════════════════════ */}
            <div style={{ position: "relative" }}>
                {/* 배경 이미지 */}
                {bannerImage ? (
                    <img
                        src={bannerImage}
                        alt="배너"
                        style={{
                            width: "100%",
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            aspectRatio: "360 / 460",
                            background:
                                "linear-gradient(156deg, #1A7DFF 6%, #96BEFF 94%)",
                        }}
                    />
                )}

                {/* 확성기 — 모션 오버레이 */}
                {megaphoneImage && (
                    <motion.img
                        src={megaphoneImage}
                        alt=""
                        animate={{
                            rotate: [0, -12, 10, -8, 6, -3, 0],
                            scale: [1, 1.08, 1.05, 1.08, 1.03, 1.05, 1],
                        }}
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            repeatDelay: 2.4,
                            ease: "easeInOut",
                        }}
                        style={{
                            position: "absolute",
                            top: `calc(${megaphoneTop}% - ${5 * (1 - t)}px)`,
                            right: `calc(${megaphoneRight}% - ${5 * (1 - t)}px)`,
                            width: megaphoneSize,
                            height: megaphoneSize,
                            objectFit: "contain",
                            transformOrigin: "bottom left",
                            pointerEvents: "none",
                        }}
                    />
                )}

                {/* 버튼 — 하단 오버레이 */}
                <div
                    style={{
                        position: "absolute",
                        bottom: btnBottomOffset,
                        left: btnSideOffset,
                        right: btnSideOffset,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        boxSizing: "border-box",
                    }}
                >
                    <button
                        onClick={handleBtn1}
                        style={{
                            ...btn1Style,
                            padding: `9px ${24 + 16 * t}px`,
                        }}
                    >
                        {btn1Text} <CaretRight size={20} color="#2C2C2C" />
                    </button>
                    <button onClick={handleBtn2} style={btn2Style}>
                        {btn2Text} <CaretRight size={17} color="#FFF" />
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════
                통계 바 — 카운트업 애니메이션
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
                                        backgroundColor:
                                            "rgba(255,255,255,0.3)",
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
                                <StatValue
                                    value={stat.value}
                                    started={statInView}
                                />
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
    padding: "9px 24px",
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
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "117%",
    letterSpacing: "0.4px",
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
    // 배너 이미지
    bannerImage: {
        type: ControlType.Image,
        title: "배너 이미지",
    },

    // 확성기 모션
    megaphoneImage: {
        type: ControlType.Image,
        title: "확성기 이미지",
    },
    megaphoneTop: {
        type: ControlType.Number,
        title: "확성기 위치 (top %)",
        defaultValue: 28,
        min: 0,
        max: 100,
        step: 1,
        hidden: (p) => !p.megaphoneImage,
    },
    megaphoneRight: {
        type: ControlType.Number,
        title: "확성기 위치 (right %)",
        defaultValue: 4,
        min: 0,
        max: 100,
        step: 1,
        hidden: (p) => !p.megaphoneImage,
    },
    megaphoneSize: {
        type: ControlType.Number,
        title: "확성기 크기 (px)",
        defaultValue: 60,
        min: 16,
        max: 120,
        step: 1,
        hidden: (p) => !p.megaphoneImage,
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
    btnBottomOffset: {
        type: ControlType.Number,
        title: "버튼 하단 여백 (px)",
        defaultValue: 26,
        min: 0,
        max: 100,
        step: 1,
    },
    btnSideOffset: {
        type: ControlType.Number,
        title: "버튼 좌우 여백 (px)",
        defaultValue: 27,
        min: 0,
        max: 60,
        step: 1,
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
