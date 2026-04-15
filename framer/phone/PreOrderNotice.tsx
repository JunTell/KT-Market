// 신청 전 필독사항 컴포넌트
// OrderSummaryCard 하단 또는 단독으로 사용 가능

import { addPropertyControls, ControlType } from "framer"
import React from "react"

const FONT = '"Pretendard", "Inter", sans-serif'

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function PreOrderNotice(props) {
    const {
        title = "신청 전 필독사항",
        message = "최종신청 내역에는 대리점 지원금이 제외된 금액이 보여요.\n실제 개통 시 할인 금액이 반영되니 안심하세요.",
        titleColor = "#0066FF",
        backgroundColor = "#F9FAFB",
    } = props

    return (
        <div
            style={{
                width: "100%",
                backgroundColor,
                borderRadius: 12,
                padding: "14px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontFamily: FONT,
            }}
        >
            <span
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: titleColor,
                    fontFamily: FONT,
                }}
            >
                {title}
            </span>
            <span
                style={{
                    fontSize: 12,
                    color: "#374151",
                    lineHeight: 1.6,
                    fontFamily: FONT,
                    whiteSpace: "pre-line",
                }}
            >
                {message}
            </span>
        </div>
    )
}

addPropertyControls(PreOrderNotice, {
    title: {
        type: ControlType.String,
        title: "타이틀",
        defaultValue: "신청 전 필독사항",
    },
    message: {
        type: ControlType.String,
        title: "내용",
        defaultValue: "최종신청 내역에는 대리점 지원금이 제외된 금액이 보여요.\n실제 개통 시 할인 금액이 반영되니 안심하세요.",
        displayTextArea: true,
    },
    titleColor: {
        type: ControlType.Color,
        title: "타이틀 색상",
        defaultValue: "#0066FF",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "배경 색상",
        defaultValue: "#F9FAFB",
    },
})
