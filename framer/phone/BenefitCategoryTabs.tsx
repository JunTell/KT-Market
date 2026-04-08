import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type TabKey = "benefit" | "notice" | "review"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 320
 */
export default function BenefitCategoryTabs(props) {
    const {
        style,
        benefitTitle = "혜택 확인",
        noticeTitle = "유의사항",
        reviewTitle = "구매후기",
        benefitImage,
        noticeText,
        reviewText,
        emptyBenefitText = "혜택 이미지를 추가해주세요.",
    } = props

    const [activeTab, setActiveTab] = React.useState<TabKey>("benefit")

    const tabs: Array<{ key: TabKey; label: string }> = [
        { key: "benefit", label: benefitTitle },
        { key: "notice", label: noticeTitle },
        { key: "review", label: reviewTitle },
    ]

    return (
        <div style={{ ...containerStyle, ...style }}>
            <div style={tabRowStyle}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                ...tabButtonStyle,
                                color: isActive ? "#111827" : "#8B95A1",
                                borderBottomColor: isActive
                                    ? "#0055FF"
                                    : "transparent",
                                fontWeight: isActive ? 700 : 500,
                            }}
                        >
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            <div style={contentStyle}>
                {activeTab === "benefit" && (
                    <>
                        {benefitImage ? (
                            <img
                                src={benefitImage}
                                alt={benefitTitle}
                                style={benefitImageStyle}
                            />
                        ) : (
                            <div style={emptyStateStyle}>{emptyBenefitText}</div>
                        )}
                    </>
                )}

                {activeTab === "notice" && (
                    <div style={textContentStyle}>{noticeText}</div>
                )}

                {activeTab === "review" && (
                    <div style={textContentStyle}>{reviewText}</div>
                )}
            </div>
        </div>
    )
}

const containerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxSizing: "border-box",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}

const tabRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 24,
    borderBottom: "1px solid #E5E7EB",
}

const tabButtonStyle: React.CSSProperties = {
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: "0 0 12px",
    margin: 0,
    fontSize: 15,
    lineHeight: 1.2,
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "color 0.2s ease, border-color 0.2s ease",
}

const contentStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 220,
    boxSizing: "border-box",
}

const benefitImageStyle: React.CSSProperties = {
    width: "100%",
    display: "block",
    borderRadius: 16,
    objectFit: "cover",
}

const emptyStateStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 220,
    borderRadius: 16,
    border: "1px dashed #D1D5DB",
    backgroundColor: "#F9FAFB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    boxSizing: "border-box",
    color: "#8B95A1",
    fontSize: 14,
    textAlign: "center",
    wordBreak: "keep-all",
}

const textContentStyle: React.CSSProperties = {
    minHeight: 220,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    border: "1px solid #EEF1F4",
    boxSizing: "border-box",
    color: "#333D4B",
    fontSize: 14,
    lineHeight: 1.7,
    whiteSpace: "pre-line",
    wordBreak: "keep-all",
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
    benefitImage: {
        type: ControlType.Image,
        title: "혜택 이미지",
    },
    emptyBenefitText: {
        type: ControlType.String,
        title: "빈 안내문구",
        defaultValue: "혜택 이미지를 추가해주세요.",
    },
    noticeText: {
        type: ControlType.String,
        title: "유의사항",
        displayTextArea: true,
        defaultValue:
            "개통 이후 혜택이 반영됩니다.\n상세 조건은 신청서와 해피콜 안내를 함께 확인해주세요.",
    },
    reviewText: {
        type: ControlType.String,
        title: "구매후기",
        displayTextArea: true,
        defaultValue:
            "구매후기 내용을 여기에 입력해주세요.\n추후 실제 후기 카드 형태로 교체해도 됩니다.",
    },
})
