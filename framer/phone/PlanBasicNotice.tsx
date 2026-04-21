// withPlanBasicNotice 코드 오버라이드 사용

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function PlanBasicNotice(props) {
    const { style, officialMonthlyPrice = 0 } = props
    const monthlyPriceText =
        officialMonthlyPrice > 0
            ? `${officialMonthlyPrice.toLocaleString()}원`
            : "월할부금"

    return (
        <div style={{ ...containerStyle, ...style }}>
            {/* 1. 신청 전 필독사항 박스 */}
            <div style={newNoticeBoxStyle}>
                <div style={redTitleStyle}>신청 전 필독사항</div>
                <div style={mainTextStyle}>
                    공식신청서에는 {monthlyPriceText},
                    <br />
                    KT마켓지원금을 제외한 금액이 보여도 놀라지 마세요
                </div>
                <div style={subTextStyle}>
                    *신청서에는 KT마켓지원금이 제외된 금액이 먼저 보여요.
                    <br />
                    실제 개통 시 할인 금액이 반영되니 안심하세요.
                </div>
            </div>

        </div>
    )
}

// ----------------------------------------------------------------------
// 스타일 설정
// ----------------------------------------------------------------------
const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "400px",
    gap: "12px",
    boxSizing: "border-box",
}

const newNoticeBoxStyle: React.CSSProperties = {
    borderRadius: "12px",
    backgroundColor: "#F9FAFB",
    border: "1px solid #F1F3F5",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
}

const redTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "800",
    color: "#E51928",
    letterSpacing: "-0.5px",
}

const mainTextStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: "600",
    color: "#24292E",
    lineHeight: "1.4",
    letterSpacing: "-0.5px",
    wordBreak: "keep-all",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}

const subTextStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: "500",
    color: "#3F4750",
    lineHeight: "1.5",
    letterSpacing: "-0.3px",
    wordBreak: "keep-all",
    marginTop: "6px",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}


addPropertyControls(PlanBasicNotice, {
    officialMonthlyPrice: {
        type: ControlType.Number,
        title: "월할부금",
        defaultValue: 115131,
    },
})
