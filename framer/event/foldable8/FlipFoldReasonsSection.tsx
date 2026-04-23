// Flip · Fold 사전예약 — KT마켓 이유 3카드
// 01 즉시 할인 혜택 · 02 자유롭게 이용 가능 · 03 비교 상담 가능
// 라벨 2줄 중 두 번째 줄은 블루 강조 (#0066FF)

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const FONT = '"Cafe24 Ohsquare", "Cafe24 Ohsquare OTF", sans-serif'
const BLUE = "#0066FF"
const DARK = "#111827"

const fade = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

// "상단 텍스트\n블루 텍스트" 형식을 두 줄로 분리 렌더
function TwoLineLabel({ label, size = 12.5 }) {
    const [line1, ...rest] = (label || "").split("\n")
    const line2 = rest.join("\n")
    return (
        <span
            style={{
                fontSize: size,
                fontWeight: 500,
                textAlign: "center",
                lineHeight: 1.4,
                letterSpacing: -0.2,
                fontFamily: FONT,
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <span style={{ color: DARK }}>{line1}</span>
            {line2 && (
                <span style={{ color: BLUE, fontWeight: 700 }}>{line2}</span>
            )}
        </span>
    )
}

function CardShell({ index, children }) {
    return (
        <div
            style={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: "28px 20px",
                border: "1px solid #EEF2F7",
                boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxSizing: "border-box",
            }}
        >
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    backgroundColor: "#111827",
                    padding: "5px 14px",
                    borderRadius: 999,
                    letterSpacing: 0.5,
                    fontFamily: FONT,
                }}
            >
                {index}
            </span>
            {children}
        </div>
    )
}

function OptionBox({ image, label }) {
    return (
        <div
            style={{
                flex: 1,
                backgroundColor: "#F8FAFC",
                borderRadius: 14,
                padding: "14px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                border: "1px solid #EEF2F7",
            }}
        >
            <div
                style={{
                    width: 52,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <span style={{ color: "#94A3B8", fontSize: 9 }}>아이콘</span>
                )}
            </div>
            <TwoLineLabel label={label} size={12.5} />
        </div>
    )
}

function ConditionCell({ image, label }) {
    return (
        <div
            style={{
                flex: "1 1 calc(50% - 6px)",
                minWidth: 0,
                backgroundColor: "#F8FAFC",
                borderRadius: 14,
                padding: "18px 10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                border: "1px solid #EEF2F7",
            }}
        >
            <div
                style={{
                    width: 52,
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <span style={{ color: "#94A3B8", fontSize: 9 }}>아이콘</span>
                )}
            </div>
            <TwoLineLabel label={label} size={13} />
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FlipFoldReasonsSection(props) {
    const {
        sectionTitle = "KT마켓에서 사면",
        sectionTitleHighlight = "좋은 이유",

        // Card 01
        card1Title1 = "KT마켓 순수 기기값",
        card1Title2 = "즉시 할인 혜택",
        card1Option1Image,
        card1Option1Label = "공통지원금\n단말 할인",
        card1OrText = "또는",
        card1Option2Image,
        card1Option2Label = "선택약정\n요금제 할인 25%",
        card1BadgeImage,
        card1BadgeTitle = "KT마켓 단독지원금",
        card1BadgeValue = "최대 40만원",
        card1DetailLabel = "더 자세한 내용 확인하기",
        card1DetailLink = "",

        // Card 02
        card2Title1 = "복잡한 조건 없이",
        card2Title2 = "자유롭게 이용 가능",
        cond1Image,
        cond1Label = "비싼 요금제\n가입조건 없음",
        cond2Image,
        cond2Label = "카드 발급\n조건 없음",
        cond3Image,
        cond3Label = "부가서비스\n조건 없음",
        cond4Image,
        cond4Label = "인터넷 / TV\n가입조건 없음",
        cond5Image,
        cond5Label = "중고기기\n반납조건 없음",
        cond6Image,
        cond6Label = "2년후 사용기기\n반납조건 없음",

        // Card 03
        card3Title1 = "언제든지 부담없는",
        card3Title2 = "비교 상담 가능",
        card3Hours = "",
        kakaoIcon,
        kakaoLabel = "카카오톡 상담",
        kakaoLink = "http://pf.kakao.com/_HfItxj/chat",
        phoneIcon,
        phoneLabel = "1522-6562",
        phoneLink = "tel:1522-6562",

        style,
    } = props

    const open = (url: string) => {
        if (!url || typeof window === "undefined") return
        if (url.startsWith("tel:") || url.startsWith("mailto:")) {
            window.location.href = url
        } else {
            window.open(url, "_blank", "noopener,noreferrer")
        }
    }

    const handleDetail = () => {
        if (card1DetailLink) open(card1DetailLink)
    }

    const renderCardTitle = (top: string, bottom: string) => (
        <h3
            style={{
                margin: "14px 0 20px",
                fontSize: 20,
                fontWeight: 700,
                color: DARK,
                textAlign: "center",
                lineHeight: 1.35,
                letterSpacing: -0.5,
                fontFamily: FONT,
            }}
        >
            {top}
            <br />
            <span style={{ color: BLUE }}>{bottom}</span>
        </h3>
    )

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={fade}
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                padding: "40px 20px 48px",
                boxSizing: "border-box",
                fontFamily: FONT,
                backgroundColor: "#F5F7FB",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                ...style,
            }}
        >
            <h2
                style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    color: DARK,
                    letterSpacing: -0.6,
                    textAlign: "center",
                    lineHeight: 1.35,
                    fontFamily: FONT,
                }}
            >
                {sectionTitle}
                <br />
                {sectionTitleHighlight}
            </h2>

            {/* Card 01 — 즉시 할인 혜택 */}
            <CardShell index="01">
                {renderCardTitle(card1Title1, card1Title2)}

                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <OptionBox image={card1Option1Image} label={card1Option1Label} />
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#6B7280",
                            fontFamily: FONT,
                            flexShrink: 0,
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E5E7EB",
                            padding: "4px 10px",
                            borderRadius: 999,
                        }}
                    >
                        {card1OrText}
                    </span>
                    <OptionBox image={card1Option2Image} label={card1Option2Label} />
                </div>

                <div
                    style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: "#9CA3AF",
                        margin: "12px 0",
                        lineHeight: 1,
                    }}
                >
                    +
                </div>

                <div
                    style={{
                        width: "100%",
                        backgroundColor: BLUE,
                        borderRadius: 14,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                    }}
                >
                    {card1BadgeImage && (
                        <img
                            src={card1BadgeImage}
                            alt=""
                            style={{ width: 40, height: 40, objectFit: "contain" }}
                        />
                    )}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                        }}
                    >
                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: "rgba(255,255,255,0.9)",
                                fontFamily: FONT,
                                letterSpacing: -0.2,
                            }}
                        >
                            {card1BadgeTitle}
                        </span>
                        <span
                            style={{
                                fontSize: 20,
                                fontWeight: 800,
                                color: "#FFFFFF",
                                fontFamily: FONT,
                                letterSpacing: -0.5,
                                marginTop: 2,
                            }}
                        >
                            {card1BadgeValue}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleDetail}
                    style={{
                        marginTop: 18,
                        background: "none",
                        border: "none",
                        color: "#6B7280",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: card1DetailLink ? "pointer" : "default",
                        fontFamily: FONT,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    {card1DetailLabel}
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M9 6l6 6-6 6" />
                    </svg>
                </button>
            </CardShell>

            {/* Card 02 — 자유롭게 이용 가능 */}
            <CardShell index="02">
                {renderCardTitle(card2Title1, card2Title2)}

                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    <ConditionCell image={cond1Image} label={cond1Label} />
                    <ConditionCell image={cond2Image} label={cond2Label} />
                    <ConditionCell image={cond3Image} label={cond3Label} />
                    <ConditionCell image={cond4Image} label={cond4Label} />
                    <ConditionCell image={cond5Image} label={cond5Label} />
                    <ConditionCell image={cond6Image} label={cond6Label} />
                </div>
            </CardShell>

            {/* Card 03 — 비교 상담 가능 */}
            <CardShell index="03">
                {renderCardTitle(card3Title1, card3Title2)}

                {card3Hours ? (
                    <p
                        style={{
                            margin: "-12px 0 18px",
                            fontSize: 12,
                            color: "#6B7280",
                            textAlign: "center",
                            fontFamily: FONT,
                            letterSpacing: -0.2,
                        }}
                    >
                        {card3Hours}
                    </p>
                ) : null}

                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        gap: 10,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => open(kakaoLink)}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            aspectRatio: "1 / 1",
                            maxHeight: 140,
                            borderRadius: 16,
                            border: "1px solid #EEF2F7",
                            backgroundColor: "#F8FAFC",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            fontFamily: FONT,
                            padding: "14px",
                        }}
                    >
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {kakaoIcon ? (
                                <img
                                    src={kakaoIcon}
                                    alt=""
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: "#FEE500",
                                    }}
                                />
                            )}
                        </div>
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: DARK,
                                letterSpacing: -0.3,
                                fontFamily: FONT,
                            }}
                        >
                            {kakaoLabel}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => open(phoneLink)}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            aspectRatio: "1 / 1",
                            maxHeight: 140,
                            borderRadius: 16,
                            border: "1px solid #EEF2F7",
                            backgroundColor: "#F8FAFC",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            fontFamily: FONT,
                            padding: "14px",
                        }}
                    >
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {phoneIcon ? (
                                <img
                                    src={phoneIcon}
                                    alt=""
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        backgroundColor: BLUE,
                                    }}
                                />
                            )}
                        </div>
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: DARK,
                                letterSpacing: -0.3,
                                fontFamily: FONT,
                            }}
                        >
                            {phoneLabel}
                        </span>
                    </button>
                </div>
            </CardShell>
        </motion.section>
    )
}

addPropertyControls(FlipFoldReasonsSection, {
    sectionTitle: {
        type: ControlType.String,
        title: "섹션 타이틀 1",
        defaultValue: "KT마켓에서 사면",
    },
    sectionTitleHighlight: {
        type: ControlType.String,
        title: "섹션 타이틀 2",
        defaultValue: "좋은 이유",
    },

    card1Title1: {
        type: ControlType.String,
        title: "①-1",
        defaultValue: "KT마켓 순수 기기값",
    },
    card1Title2: {
        type: ControlType.String,
        title: "①-2(블루)",
        defaultValue: "즉시 할인 혜택",
    },
    card1Option1Image: { type: ControlType.Image, title: "① 옵션1 아이콘" },
    card1Option1Label: {
        type: ControlType.String,
        title: "① 옵션1 텍스트",
        defaultValue: "공통지원금\n단말 할인",
        displayTextArea: true,
    },
    card1OrText: {
        type: ControlType.String,
        title: "① 구분 텍스트",
        defaultValue: "또는",
    },
    card1Option2Image: { type: ControlType.Image, title: "① 옵션2 아이콘" },
    card1Option2Label: {
        type: ControlType.String,
        title: "① 옵션2 텍스트",
        defaultValue: "선택약정\n요금제 할인 25%",
        displayTextArea: true,
    },
    card1BadgeImage: { type: ControlType.Image, title: "① 단독지원 아이콘" },
    card1BadgeTitle: {
        type: ControlType.String,
        title: "① 단독지원 타이틀",
        defaultValue: "KT마켓 단독지원금",
    },
    card1BadgeValue: {
        type: ControlType.String,
        title: "① 단독지원 금액",
        defaultValue: "최대 40만원",
    },
    card1DetailLabel: {
        type: ControlType.String,
        title: "① 자세히 보기",
        defaultValue: "더 자세한 내용 확인하기",
    },
    card1DetailLink: {
        type: ControlType.String,
        title: "① 자세히 링크",
        defaultValue: "",
    },

    card2Title1: {
        type: ControlType.String,
        title: "② 타이틀 1",
        defaultValue: "복잡한 조건 없이",
    },
    card2Title2: {
        type: ControlType.String,
        title: "② 타이틀 2(블루)",
        defaultValue: "자유롭게 이용 가능",
    },
    cond1Image: { type: ControlType.Image, title: "②-1 아이콘" },
    cond1Label: {
        type: ControlType.String,
        title: "②-1 텍스트",
        defaultValue: "비싼 요금제\n가입조건 없음",
        displayTextArea: true,
    },
    cond2Image: { type: ControlType.Image, title: "②-2 아이콘" },
    cond2Label: {
        type: ControlType.String,
        title: "②-2 텍스트",
        defaultValue: "카드 발급\n조건 없음",
        displayTextArea: true,
    },
    cond3Image: { type: ControlType.Image, title: "②-3 아이콘" },
    cond3Label: {
        type: ControlType.String,
        title: "②-3 텍스트",
        defaultValue: "부가서비스\n조건 없음",
        displayTextArea: true,
    },
    cond4Image: { type: ControlType.Image, title: "②-4 아이콘" },
    cond4Label: {
        type: ControlType.String,
        title: "②-4 텍스트",
        defaultValue: "인터넷 / TV\n가입조건 없음",
        displayTextArea: true,
    },
    cond5Image: { type: ControlType.Image, title: "②-5 아이콘" },
    cond5Label: {
        type: ControlType.String,
        title: "②-5 텍스트",
        defaultValue: "중고기기\n반납조건 없음",
        displayTextArea: true,
    },
    cond6Image: { type: ControlType.Image, title: "②-6 아이콘" },
    cond6Label: {
        type: ControlType.String,
        title: "②-6 텍스트",
        defaultValue: "2년후 사용기기\n반납조건 없음",
        displayTextArea: true,
    },

    card3Title1: {
        type: ControlType.String,
        title: "③ 타이틀 1",
        defaultValue: "언제든지 부담없는",
    },
    card3Title2: {
        type: ControlType.String,
        title: "③ 타이틀 2(블루)",
        defaultValue: "비교 상담 가능",
    },
    card3Hours: {
        type: ControlType.String,
        title: "③ 상담 시간",
        defaultValue: "",
    },
    kakaoIcon: { type: ControlType.Image, title: "③ 카카오 아이콘" },
    kakaoLabel: {
        type: ControlType.String,
        title: "③ 카카오 라벨",
        defaultValue: "카카오톡 상담",
    },
    kakaoLink: {
        type: ControlType.String,
        title: "③ 카카오 링크",
        defaultValue: "http://pf.kakao.com/_HfItxj/chat",
    },
    phoneIcon: { type: ControlType.Image, title: "③ 전화 아이콘" },
    phoneLabel: {
        type: ControlType.String,
        title: "③ 전화 라벨",
        defaultValue: "1522-6562",
    },
    phoneLink: {
        type: ControlType.String,
        title: "③ 전화 링크",
        defaultValue: "tel:1522-6562",
    },
})
