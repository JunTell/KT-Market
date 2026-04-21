import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * 탭 클릭 시 Framer 캔버스의 해당 섹션으로 스크롤합니다.
 * 각 탭의 "섹션 ID" 값을 Framer에서 섹션 프레임의 ID와 일치시켜주세요.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 50
 */
export default function BenefitCategoryTabs(props) {
    const {
        style,
        benefitTitle = "혜택 확인",
        noticeTitle = "유의사항",
        reviewTitle = "구매후기",
        benefitSectionId = "benefit",
        noticeSectionId = "notice",
        reviewSectionId = "review",
        scrollOffset = 0,
        // override에서 주입 — 제공 시 내부 스크롤 대신 이 콜백 호출
        onTabClick = null,
    } = props

    const [activeTab, setActiveTab] = React.useState<string | null>(null)

    const tabs = [
        { key: "benefit", label: benefitTitle, sectionId: benefitSectionId },
        { key: "notice",  label: noticeTitle,  sectionId: noticeSectionId },
        { key: "review",  label: reviewTitle,  sectionId: reviewSectionId },
    ]

    const handleClick = (key: string, sectionId: string) => {
        setActiveTab(key)
        if (onTabClick) {
            onTabClick(key, sectionId, scrollOffset)
        } else {
            const el = document.getElementById(sectionId)
            if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset
                window.scrollTo({ top, behavior: "smooth" })
            }
        }
    }

    return (
        <div style={{ ...containerStyle, ...style }}>
            <div style={tabRowStyle}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleClick(tab.key, tab.sectionId)}
                            style={{
                                ...tabButtonStyle,
                                color: isActive ? "#24292E" : "#868E96",
                                borderBottomColor: isActive ? "#0055FF" : "transparent",
                                fontWeight: isActive ? 700 : 500,
                            }}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

const containerStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 360,
    maxWidth: 440,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}

const tabRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 0,
    borderBottom: "1px solid #E5E7EB",
}

const tabButtonStyle: React.CSSProperties = {
    appearance: "none",
    flex: 1,
    border: "none",
    background: "transparent",
    minHeight: 52,
    padding: "0 12px 14px",
    margin: 0,
    fontSize: 15,
    letterSpacing: -0.3,
    lineHeight: 1.4,
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "color 0.2s ease, border-color 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    whiteSpace: "nowrap",
}

addPropertyControls(BenefitCategoryTabs, {
    benefitTitle: {
        type: ControlType.String,
        title: "혜택 탭명",
        defaultValue: "혜택 확인",
    },
    noticeTitle: {
        type: ControlType.String,
        title: "유의 탭명",
        defaultValue: "유의사항",
    },
    reviewTitle: {
        type: ControlType.String,
        title: "후기 탭명",
        defaultValue: "구매후기",
    },
    benefitSectionId: {
        type: ControlType.String,
        title: "혜택 섹션 ID",
        defaultValue: "benefit",
    },
    noticeSectionId: {
        type: ControlType.String,
        title: "유의 섹션 ID",
        defaultValue: "notice",
    },
    reviewSectionId: {
        type: ControlType.String,
        title: "후기 섹션 ID",
        defaultValue: "review",
    },
    scrollOffset: {
        type: ControlType.Number,
        title: "스크롤 오프셋",
        defaultValue: 0,
        description: "상단 고정 요소 높이만큼 보정 (px)",
    },
})
