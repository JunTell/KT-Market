// 온라인 대리점이 싼 이유 카드
// Figma: node 2093:722
// 아이템 배열로 사유 목록을 렌더링

import { addPropertyControls, ControlType } from "framer"
import React from "react"

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

// ── 체크 아이콘 (파란 원 + 흰 체크) ─────────────────────────
function CheckBadge() {
    return (
        <div style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            backgroundColor: "#0066FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                    d="M3 6.5L5.5 9L10 4"
                    stroke="#FFFFFF"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}

type Item = { title: string; description: string }

const DEFAULT_ITEMS: Item[] = [
    {
        title: "오프라인 매장 비용이 없어요",
        description: "임대료·인테리어·인건비 → 전부 고객 지원금으로",
    },
    {
        title: "KT 공식 계약 대리점이에요",
        description: "개통·AS·보증 모두 정식 처리돼요",
    },
]

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 120
 */
export default function WhyCheapCard(props) {
    const {
        cardTitle = "온라인 대리점이 싼 이유",
        item1Title = "오프라인 매장 비용이 없어요",
        item1Description = "임대료·인테리어·인건비 → 전부 고객 지원금으로",
        item2Title = "KT 공식 계약 대리점이에요",
        item2Description = "개통·AS·보증 모두 정식 처리돼요",
        showItem2 = true,
        item3Title = "",
        item3Description = "",
        showItem3 = false,
    } = props

    const items: Item[] = [
        { title: item1Title, description: item1Description },
        ...(showItem2 ? [{ title: item2Title, description: item2Description }] : []),
        ...(showItem3 && item3Title ? [{ title: item3Title, description: item3Description }] : []),
    ]

    return (
        <div style={{
            width: "100%",
            backgroundColor: "#F0F6FF",
            borderRadius: 13,
            padding: "14px 13px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontFamily: FONT,
        }}>
            {/* 카드 제목 */}
            <p style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: "#24292E",
                letterSpacing: -0.24,
                lineHeight: 1.4,
                fontFamily: FONT,
            }}>
                {cardTitle}
            </p>

            {/* 아이템 목록 */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 9,
            }}>
                {items.map((item, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                        }}
                    >
                        <CheckBadge />
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                            flex: 1,
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#0066FF",
                                letterSpacing: -0.24,
                                lineHeight: 1.4,
                                wordBreak: "keep-all",
                                fontFamily: FONT,
                            }}>
                                {item.title}
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
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

addPropertyControls(WhyCheapCard, {
    cardTitle: {
        type: ControlType.String,
        title: "카드 제목",
        defaultValue: "온라인 대리점이 싼 이유",
    },
    item1Title: {
        type: ControlType.String,
        title: "항목 1 제목",
        defaultValue: "오프라인 매장 비용이 없어요",
    },
    item1Description: {
        type: ControlType.String,
        title: "항목 1 설명",
        defaultValue: "임대료·인테리어·인건비 → 전부 고객 지원금으로",
        displayTextArea: true,
    },
    showItem2: {
        type: ControlType.Boolean,
        title: "항목 2 표시",
        defaultValue: true,
    },
    item2Title: {
        type: ControlType.String,
        title: "항목 2 제목",
        defaultValue: "KT 공식 계약 대리점이에요",
        hidden: (props) => !props.showItem2,
    },
    item2Description: {
        type: ControlType.String,
        title: "항목 2 설명",
        defaultValue: "개통·AS·보증 모두 정식 처리돼요",
        displayTextArea: true,
        hidden: (props) => !props.showItem2,
    },
    showItem3: {
        type: ControlType.Boolean,
        title: "항목 3 표시",
        defaultValue: false,
    },
    item3Title: {
        type: ControlType.String,
        title: "항목 3 제목",
        defaultValue: "",
        hidden: (props) => !props.showItem3,
    },
    item3Description: {
        type: ControlType.String,
        title: "항목 3 설명",
        defaultValue: "",
        displayTextArea: true,
        hidden: (props) => !props.showItem3,
    },
})
