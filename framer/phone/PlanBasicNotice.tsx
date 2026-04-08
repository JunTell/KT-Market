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

            {/* 2. 절차 안내 박스 */}
            <div style={procedureBoxStyle}>
                <span style={procedureLabelStyle}>절차</span>
                <span style={procedureFlowStyle}>
                    신청서 작성 &gt; 해피콜 &gt; 개통 후 발송 &gt; 수령
                </span>
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
    padding: "8px 0",
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
    color: "#191F28",
    lineHeight: "1.4",
    letterSpacing: "-0.5px",
    wordBreak: "keep-all",
}

// 💡 가독성을 높이기 위해 폰트 크기, 굵기, 색상 진하기를 조정했습니다.
const subTextStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: "500",
    color: "#4E5968", // 기존보다 더 진한 회색 (가독성 향상)
    lineHeight: "1.5",
    letterSpacing: "-0.3px",
    wordBreak: "keep-all",
    marginTop: "6px",
}

const procedureBoxStyle: React.CSSProperties = {
    borderRadius: "12px",
    backgroundColor: "#F9FAFB",
    border: "1px solid #F1F3F5",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
}

const procedureLabelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "800",
    color: "#191F28",
}

const procedureFlowStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333D4B",
    letterSpacing: "-0.3px",
}

addPropertyControls(PlanBasicNotice, {
    officialMonthlyPrice: {
        type: ControlType.Number,
        title: "월할부금",
        defaultValue: 115131,
    },
})
