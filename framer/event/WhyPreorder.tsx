// framer/event/WhyPreorder.tsx
// Figma: KT마켓 준텔레콤 node-id 1816:1522
// "사전예약 알리미가 좋은 이유" 섹션

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 혜택 카드 ──────────────────────────────────────────────────────
function BenefitCard({
    number,
    title,
    desc,
}: {
    number: string
    title: string
    desc: string
}) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px 20px",
                borderRadius: 12,
                background: "#FFF",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    textAlign: "center",
                    lineHeight: 1.425,
                }}
            >
                <span
                    style={{
                        fontFamily: FONT,
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#2A86FF",
                        letterSpacing: "0.4px",
                        whiteSpace: "nowrap",
                    }}
                >
                    {number}. {title}
                </span>
                <span
                    style={{
                        fontFamily: FONT,
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#000",
                        letterSpacing: "0.32px",
                        whiteSpace: "pre-line",
                    }}
                >
                    {desc}
                </span>
            </div>
        </div>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function WhyPreorder(props) {
    const {
        titleLine1 = "사전예약 알리미가",
        titleLine2 = "좋은 이유",

        card1Title = "빠른 출시 정보",
        card1Desc = "신제품 일정·스펙을\n가장 먼저 확인할 수 있어요",
        card2Title = "최대 혜택 & 할인",
        card2Desc = "사전예약 전용 조건으로\n더 좋은 가격에 구매할 수 있어요",
        card3Title = "물량 선점",
        card3Desc = "인기 모델을 먼저 확보하고\n빠르게 수령할 수 있어요",

        style,
    } = props

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "30px 0",
                background:
                    "linear-gradient(180deg, #F8F8F8 0%, #F2F2F2 100%)",
                fontFamily: FONT,
                boxSizing: "border-box",
                ...style,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                    width: 320,
                    padding: "0 13px",
                    borderRadius: 28,
                    boxSizing: "border-box",
                    position: "relative",
                }}
            >
                {/* ══ 타이틀 ══ */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: 298,
                        position: "relative",
                    }}
                >
                    {/* 형광 밑줄 */}
                    <div
                        style={{
                            position: "absolute",
                            top: 36,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 130,
                            height: 19,
                            background: "#D5F85D",
                            zIndex: 0,
                        }}
                    />
                    <div
                        style={{
                            position: "relative",
                            zIndex: 1,
                            textAlign: "center",
                            letterSpacing: "0.716px",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: FONT,
                                fontSize: 28,
                                fontWeight: 700,
                                color: "#000",
                                lineHeight: 1.25,
                            }}
                        >
                            {titleLine1}
                        </div>
                        <div
                            style={{
                                fontFamily: FONT,
                                fontSize: 32,
                                fontWeight: 800,
                                color: "#2A86FF",
                                lineHeight: 1.25,
                            }}
                        >
                            {titleLine2}
                        </div>
                    </div>
                </div>

                {/* ══ 카드 리스트 ══ */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 14,
                        width: 296,
                    }}
                >
                    <BenefitCard
                        number="01"
                        title={card1Title}
                        desc={card1Desc}
                    />
                    <BenefitCard
                        number="02"
                        title={card2Title}
                        desc={card2Desc}
                    />
                    <BenefitCard
                        number="03"
                        title={card3Title}
                        desc={card3Desc}
                    />
                </div>
            </div>
        </div>
    )
}

// ─── Framer 프롭 컨트롤 ───────────────────────────────────────────────
addPropertyControls(WhyPreorder, {
    titleLine1: {
        type: ControlType.String,
        title: "타이틀 1줄",
        defaultValue: "사전예약 알리미가",
    },
    titleLine2: {
        type: ControlType.String,
        title: "타이틀 2줄 (파란색)",
        defaultValue: "좋은 이유",
    },
    card1Title: {
        type: ControlType.String,
        title: "카드1 제목",
        defaultValue: "빠른 출시 정보",
    },
    card1Desc: {
        type: ControlType.String,
        title: "카드1 설명",
        displayTextArea: true,
        defaultValue: "신제품 일정·스펙을\n가장 먼저 확인할 수 있어요",
    },
    card2Title: {
        type: ControlType.String,
        title: "카드2 제목",
        defaultValue: "최대 혜택 & 할인",
    },
    card2Desc: {
        type: ControlType.String,
        title: "카드2 설명",
        displayTextArea: true,
        defaultValue:
            "사전예약 전용 조건으로\n더 좋은 가격에 구매할 수 있어요",
    },
    card3Title: {
        type: ControlType.String,
        title: "카드3 제목",
        defaultValue: "물량 선점",
    },
    card3Desc: {
        type: ControlType.String,
        title: "카드3 설명",
        displayTextArea: true,
        defaultValue:
            "인기 모델을 먼저 확보하고\n빠르게 수령할 수 있어요",
    },
})
