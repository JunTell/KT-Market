// 이런 조건 없어요 카드
// Figma: node 1941:6285
// 비싼 요금제 / 카드 발급 / 부가서비스 / 기기반납 — 2×2 그리드

import { addPropertyControls, ControlType } from "framer"
import React from "react"

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 120
 */
export default function NoConditionCard(props) {
    const {
        title = "이런 조건 없어요",
        item1 = "비싼 요금제",
        item2 = "카드 발급",
        item3 = "부가서비스",
        item4 = "기기반납",
        icon1,
        icon2,
        icon3,
        icon4,
    } = props

    const items = [
        { icon: icon1, label: item1 },
        { icon: icon2, label: item2 },
        { icon: icon3, label: item3 },
        { icon: icon4, label: item4 },
    ]

    return (
        <div style={{
            width: "100%",
            backgroundColor: "#F8F9FB",
            borderRadius: 14,
            padding: "14px 16px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontFamily: FONT,
        }}>
            {/* 타이틀 */}
            <span style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#24292E",
                letterSpacing: -0.3,
                lineHeight: 1.4,
                fontFamily: FONT,
            }}>
                {title}
            </span>

            {/* 2×2 그리드 */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                rowGap: 10,
                columnGap: 8,
            }}>
                {items.map((item, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {item.icon && (
                            <img src={item.icon} width={24} height={24} style={{ objectFit: "contain", flexShrink: 0 }} />
                        )}
                        <span style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#3F4750",
                            letterSpacing: -0.24,
                            lineHeight: 1.4,
                            fontFamily: FONT,
                        }}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

addPropertyControls(NoConditionCard, {
    title: {
        type: ControlType.String,
        title: "타이틀",
        defaultValue: "이런 조건 없어요",
    },
    item1: {
        type: ControlType.String,
        title: "항목 1",
        defaultValue: "비싼 요금제",
    },
    item2: {
        type: ControlType.String,
        title: "항목 2",
        defaultValue: "카드 발급",
    },
    item3: {
        type: ControlType.String,
        title: "항목 3",
        defaultValue: "부가서비스",
    },
    item4: {
        type: ControlType.String,
        title: "항목 4",
        defaultValue: "기기반납",
    },
    icon1: {
        type: ControlType.Image,
        title: "아이콘 1",
    },
    icon2: {
        type: ControlType.Image,
        title: "아이콘 2",
    },
    icon3: {
        type: ControlType.Image,
        title: "아이콘 3",
    },
    icon4: {
        type: ControlType.Image,
        title: "아이콘 4",
    },
})
