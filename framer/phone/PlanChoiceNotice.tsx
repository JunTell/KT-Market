import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

// 노출 허용 요금제 ID 목록
const ALLOWED_PPL_IDS = [
    "ppllistobj_0994",
    "ppllistobj_0993",
    "ppllistobj_0992",
    "ppllistobj_0863",
    "ppllistobj_0864",
    "ppllistobj_0865",
    "ppllistobj_0852",
    "ppllistobj_0850",
    "ppllistobj_0851",
]

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function PlanChoiceNotice(props) {
    const { notices, pplId, style } = props

    // 입력받은 pplId가 허용 목록에 없으면 아무것도 렌더링하지 않음
    if (!ALLOWED_PPL_IDS.includes(pplId)) {
        return null
    }

    return (
        <div style={{ ...containerStyle, ...style }}>
            <div style={noticeBoxStyle}>
                <div style={headerStyle}>
                    <div style={iconBadgeStyle}>!</div>
                    <h3 style={titleStyle}>초이스 유의사항 안내</h3>
                </div>
                <ul style={listStyle}>
                    {notices.map((notice, index) => {
                        const cleanNotice = notice.replace(/^[※·-]\s*/, "")
                        return (
                            <li key={index} style={listItemStyle}>
                                <span style={bulletStyle}>·</span>
                                <span style={descStyle}>{cleanNotice}</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
// 기본 프롭스
// ----------------------------------------------------------------------
PlanChoiceNotice.defaultProps = {
    pplId: "ppllistobj_0994", // Framer 캔버스에서 확인용 기본값
    notices: [
        "삼성/디바이스/가전구독 초이스는 1회선만 개통 가능합니다.",
        "개인 신용등급/보증보험 한도에 따라 할부 불가할 수 있습니다.",
        "초이스 요금제 외 타 요금제로 변경/정지/해지 시 → 초이스 디바이스(사은품) 할부금이 정상 청구됩니다.",
    ],
}

// ----------------------------------------------------------------------
// Framer 속성 컨트롤
// ----------------------------------------------------------------------
addPropertyControls(PlanChoiceNotice, {
    pplId: {
        type: ControlType.String,
        title: "요금제 ID (pplId)",
        defaultValue: "ppllistobj_0994",
    },
    notices: {
        type: ControlType.Array,
        title: "유의사항",
        control: { type: ControlType.String },
    },
})

// ----------------------------------------------------------------------
// 스타일 설정
// ----------------------------------------------------------------------
const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "400px",
    padding: "8px 0",
    boxSizing: "border-box",
}

const noticeBoxStyle: React.CSSProperties = {
    borderRadius: "12px",
    backgroundColor: "#F8FAFC",
    padding: "16px",
}

const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "12px",
}

const iconBadgeStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#333D4B",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "bold",
    flexShrink: 0,
}

const titleStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: "bold",
    fontFamily: "'Samsung Sharp Sans', sans-serif",
    color: "#191F28",
    margin: 0,
}

const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: 0,
    margin: 0,
    listStyleType: "none",
}

const listItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
}

const bulletStyle: React.CSSProperties = {
    marginRight: "4px",
    marginTop: "0px",
    fontWeight: "bold",
    color: "#8B95A1",
    fontSize: "12px",
    flexShrink: 0,
}

const descStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#4E5968",
    lineHeight: "1.4",
    margin: 0,
    wordBreak: "keep-all",
}
