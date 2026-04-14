// 신청하기 버튼 아래에 배치하는 절차 안내 배너
// PlanBasicNotice.tsx에서 분리됨

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const FONT = '"Pretendard", "Inter", sans-serif'

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function ProcedureBanner(props) {
    const { style } = props

    return (
        <div style={{ ...wrapperStyle, ...style }}>
            <span style={labelStyle}>절차</span>
            <span style={flowStyle}>
                신청서 작성 &gt; 해피콜 &gt; 개통 후 발송 &gt; 수령
            </span>
        </div>
    )
}

const wrapperStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "12px",
    backgroundColor: "#F9FAFB",
    border: "1px solid #F1F3F5",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxSizing: "border-box",
    fontFamily: FONT,
}

const labelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "800",
    color: "#191F28",
    flexShrink: 0,
}

const flowStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333D4B",
    letterSpacing: "-0.3px",
}

addPropertyControls(ProcedureBanner, {})
