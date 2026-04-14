// framer/event/EventMainBanner.tsx
// Figma: KT마켓 준텔레콤 node-id 1820:2046
// Frame 857 (메인 배너) + Frame 838 (통계 바) = 단일 컴포넌트

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

// ─── 폰트 상수 ──────────────────────────────────────────────────────
// Cafe24 Ohsquare OTF  → Framer 프로젝트 Custom Font 필수 등록
// Reddit Sans          → Framer 프로젝트 Custom Font 필수 등록
const FONT = '"Pretendard", "Inter", sans-serif'
const FONT_CAFE24 = '"Cafe24 Ohsquare OTF", sans-serif'
const FONT_REDDIT = '"Reddit Sans", sans-serif'

// ─── 아이콘 ─────────────────────────────────────────────────────────

// 4-point 별 스파클
const SparkleIcon = ({
    size = 12,
    color = "#D5FC4E",
}: {
    size?: number
    color?: string
}) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
        <path
            d="M6 0L7.08 4.92L12 6L7.08 7.08L6 12L4.92 7.08L0 6L4.92 4.92L6 0Z"
            fill={color}
        />
    </svg>
)

// KT 로고 SVG fallback (흰색)
const KTLogoWhite = () => (
    <svg width="23" height="19" viewBox="0 0 46 34" fill="none">
        <path d="M4 2H8V14L18 2H24L13 14.5L25 32H19L10 19L8 21V32H4V2Z" fill="white" />
        <path d="M26 2H42V7H36V32H32V7H26V2Z" fill="white" />
    </svg>
)

// ─── 통계 바 아이템 타입 ─────────────────────────────────────────────
type StatItem = {
    value: string   // "1,419" / "5" / "100%"
    label: string   // "현재 대기 중 고객" 등
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 360
 */
export default function EventMainBanner(props) {
    const {
        // 헤더
        headerLabel = "KT공식대리점",
        ktLogoImage,

        // 메인 콘텐츠
        megaphoneImage,
        mainTitle = "KT마켓에서\n남들보다 먼저",
        subTitle = "사전예약 알리미",
        desc1 = "미출시 모델도 지금 바로 등록 가능",
        desc2 = "출시·지원금·혜택 정보를 남들보다 먼저 받아보세요",

        // 버튼
        btn1Text = "간편 사전예약하기",
        btn1Link = "",
        btn2Text = "출시 예정 모델 보러가기",
        btn2Link = "",

        // 통계 바 (Frame 838)
        showStatBar = true,
        stat1Value = "1,419",
        stat1Label = "현재 대기 중 고객",
        stat2Value = "5",
        stat2Label = "접수 가능 모델",
        stat3Value = "100%",
        stat3Label = "무료·취소 가능",

        style,
    } = props

    const handleBtn1 = () => {
        if (btn1Link && typeof window !== "undefined") window.location.href = btn1Link
    }
    const handleBtn2 = () => {
        if (btn2Link && typeof window !== "undefined") window.location.href = btn2Link
    }

    const stats: StatItem[] = [
        { value: stat1Value, label: stat1Label },
        { value: stat2Value, label: stat2Label },
        { value: stat3Value, label: stat3Label },
    ]

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 360,
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
                    gap: 32,
                    padding: "26px 27px",
                    background:
                        "linear-gradient(160deg, #1A7DFF 6.42%, #96BEFF 93.76%)",
                    boxSizing: "border-box",
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

                {/* ── 메인 콘텐츠 ── */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        position: "relative",
                        width: "100%",
                    }}
                >
                    {/* 스파클 데코 — 위치는 Figma 기준 근사값 */}
                    <div style={{ position: "absolute", top: 6, left: 6, pointerEvents: "none" }}>
                        <SparkleIcon size={10} />
                    </div>
                    <div style={{ position: "absolute", top: -6, right: 18, pointerEvents: "none" }}>
                        <SparkleIcon size={8} />
                    </div>
                    <div style={{ position: "absolute", bottom: 32, right: 4, pointerEvents: "none" }}>
                        <SparkleIcon size={14} />
                    </div>
                    <div style={{ position: "absolute", top: 56, left: 0, pointerEvents: "none" }}>
                        <SparkleIcon size={7} color="#B8E0FF" />
                    </div>

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

                    {/* 서브 타이틀 (#D5FC4E 라임) + 메가폰 */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            marginTop: 2,
                        }}
                    >
                        <span
                            style={{
                                color: "#D5FC4E",   // ← 라임 컬러 (흰색 아님)
                                fontFamily: FONT,
                                fontSize: 18,
                                fontWeight: 900,
                                lineHeight: "145.5%",
                                letterSpacing: "0.36px",
                            }}
                        >
                            {subTitle}
                        </span>
                        {/* 메가폰: Figma SVG 업로드 시 이미지로 교체, 없으면 emoji */}
                        {megaphoneImage ? (
                            <img
                                src={megaphoneImage}
                                alt=""
                                style={{ width: 28, height: 28, objectFit: "contain" }}
                            />
                        ) : (
                            <span
                                style={{ fontSize: 20, lineHeight: 1, userSelect: "none" }}
                                aria-hidden="true"
                            >
                                📣
                            </span>
                        )}
                    </div>

                    {/* 설명 텍스트 */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginTop: 6,
                        }}
                    >
                        <span
                            style={{
                                color: "#FFF",
                                fontFamily: FONT,
                                fontSize: 14.989,
                                fontWeight: 600,
                                lineHeight: "145.5%",
                                letterSpacing: "0.3px",
                                textAlign: "center",
                            }}
                        >
                            {desc1}
                        </span>
                        <span
                            style={{
                                color: "#FFF",
                                fontFamily: FONT,
                                fontSize: 14.989,
                                fontWeight: 600,
                                lineHeight: "145.5%",
                                letterSpacing: "0.3px",
                                textAlign: "center",
                            }}
                        >
                            {desc2}
                        </span>
                    </div>
                </div>

                {/* ── 버튼 ── */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        alignSelf: "stretch",
                    }}
                >
                    {/* 버튼 1 — 흰 배경 */}
                    <button
                        onClick={handleBtn1}
                        style={{
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
                            fontSize: 20,
                            fontWeight: 700,
                            lineHeight: "117%",
                            letterSpacing: "0.4px",
                            boxSizing: "border-box",
                        }}
                    >
                        {btn1Text} ›
                    </button>

                    {/* 버튼 2 — 파랑 배경 */}
                    <button
                        onClick={handleBtn2}
                        style={{
                            display: "flex",
                            width: "100%",
                            padding: "10px 18px",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 7,
                            borderRadius: 8.962,
                            background: "#0066FF",
                            boxShadow: "0 3.585px 4.481px 0 rgba(0,0,0,0.15)",
                            border: "none",
                            cursor: "pointer",
                            color: "#FFF",
                            fontFamily: FONT,
                            fontSize: 20,
                            fontWeight: 700,
                            lineHeight: "117%",
                            letterSpacing: "0.4px",
                            boxSizing: "border-box",
                        }}
                    >
                        {btn2Text} ›
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════
                Frame 838 — 통계 바
                padding: 10px 30px / gap: 12px / bg: #0066FF
            ════════════════════════════════════════ */}
            {showStatBar && (
                <div
                    style={{
                        display: "flex",
                        padding: "10px 30px",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 0,
                        background: "#0066FF",
                        boxSizing: "border-box",
                        width: "100%",
                    }}
                >
                    {stats.map((stat, i) => (
                        <React.Fragment key={i}>
                            {/* 세로 구분선 */}
                            {i > 0 && (
                                <div
                                    style={{
                                        width: 1,
                                        height: 32,
                                        backgroundColor: "rgba(255,255,255,0.3)",
                                        flexShrink: 0,
                                        margin: "0 16px",
                                    }}
                                />
                            )}

                            {/* 통계 아이템 */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 2,
                                    flex: 1,
                                }}
                            >
                                {/* 숫자: Reddit Sans 800, #D5FC4E */}
                                <span
                                    style={{
                                        color: "#D5FC4E",
                                        textAlign: "center",
                                        fontFamily: FONT_REDDIT,
                                        fontSize: 23,
                                        fontWeight: 800,
                                        lineHeight: "117%",
                                        letterSpacing: "0.46px",
                                    }}
                                >
                                    {stat.value}
                                </span>
                                {/* 레이블: Pretendard 700, #FFF */}
                                <span
                                    style={{
                                        color: "#FFF",
                                        textAlign: "center",
                                        fontFamily: FONT,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        lineHeight: "117%",
                                        letterSpacing: "0.28px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {stat.label}
                                </span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    )
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
    megaphoneImage: {
        type: ControlType.Image,
        title: "메가폰 이미지 (SVG 권장)",
    },
    mainTitle: {
        type: ControlType.String,
        title: "메인 타이틀",
        displayTextArea: true,
        defaultValue: "KT마켓에서\n남들보다 먼저",
    },
    subTitle: {
        type: ControlType.String,
        title: "서브 타이틀",
        defaultValue: "사전예약 알리미",
    },
    desc1: {
        type: ControlType.String,
        title: "설명 1",
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

    // 통계 바 (Frame 838)
    showStatBar: {
        type: ControlType.Boolean,
        title: "통계 바 표시",
        defaultValue: true,
    },
    stat1Value: {
        type: ControlType.String,
        title: "통계1 숫자",
        defaultValue: "1,419",
    },
    stat1Label: {
        type: ControlType.String,
        title: "통계1 레이블",
        defaultValue: "현재 대기 중 고객",
    },
    stat2Value: {
        type: ControlType.String,
        title: "통계2 숫자",
        defaultValue: "5",
    },
    stat2Label: {
        type: ControlType.String,
        title: "통계2 레이블",
        defaultValue: "접수 가능 모델",
    },
    stat3Value: {
        type: ControlType.String,
        title: "통계3 숫자",
        defaultValue: "100%",
    },
    stat3Label: {
        type: ControlType.String,
        title: "통계3 레이블",
        defaultValue: "무료·취소 가능",
    },
})
